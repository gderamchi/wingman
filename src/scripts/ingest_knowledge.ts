/**
 * Knowledge Base Ingestion Script (Enhanced)
 * Parses all data sources and generates unified knowledge_base.json
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const OUTPUT_DIR = path.join(__dirname, '../features/coach/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'knowledge_base.json');
const OCR_CACHE_FILE = path.join(DATA_DIR, 'ocr_cache.json');

interface Conversation {
  id: string;
  source: string;
  platform: string;
  outcome: string;
  context: string;
  lines: string[];
  analysis?: string;
  tags: string[];
}

interface KnowledgeBase {
  principles: string[];
  conversations: Conversation[];
  stats: {
    totalConversations: number;
    sources: { [key: string]: number };
    generatedAt: string;
  };
}

// Parse principles from text file
function parsePrinciples(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim())
    .filter(line => line.length > 0);
}

// Parse conversations from all.txt (Le State format)
function parseAllConversations(text: string): Conversation[] {
  const conversations: Conversation[] = [];
  const headerRegex = /Conversation\s+(\d+)\s*(?:\((.*?)\))?\s*:/gi;

  const matches: Array<{ index: number; id: string; context: string; fullMatch: string }> = [];
  let match;

  while ((match = headerRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      id: match[1],
      context: match[2] || '',
      fullMatch: match[0],
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const startContent = current.index + current.fullMatch.length;
    const endContent = next ? next.index : text.length;

    const contentBlock = text.substring(startContent, endContent).trim();

    // Split into lines (conversation content)
    const lines = contentBlock
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('[...]'));

    // Infer tags from context
    const tags = inferTags(current.context);
    const platform = inferPlatform(current.context);
    const outcome = inferOutcome(current.context);

    conversations.push({
      id: `telegram_${current.id}`,
      source: 'le_state/telegram',
      platform,
      outcome,
      context: current.context,
      lines,
      tags,
    });
  }

  return conversations;
}

// Parse a single text conversation file (like whatsapp_justine.txt)
function parseTextConversation(filePath: string, id: string): Conversation | null {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Extract context from first line if it matches pattern
    const firstLine = lines[0] || '';
    const contextMatch = firstLine.match(/Conversation\s*\d*\s*\((.*?)\)/i);
    const context = contextMatch ? contextMatch[1] : path.basename(filePath, '.txt');

    const tags = inferTags(context);
    const platform = inferPlatform(filePath);
    const outcome = inferOutcome(context);

    return {
      id,
      source: 'guillaume',
      platform,
      outcome,
      context,
      lines: contextMatch ? lines.slice(1) : lines,
      tags,
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

// Parse OCR cache and group by conversation
function parseOcrCache(cacheFile: string): Map<string, Conversation> {
  const conversations = new Map<string, Conversation>();

  if (!fs.existsSync(cacheFile)) {
    console.warn('OCR cache not found, skipping screenshot data');
    return conversations;
  }

  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));

  // Group by conversation name (e.g., whatsapp_danielle, whatsapp_katerina)
  for (const [filename, data] of Object.entries(cache)) {
    const { extractedText } = data as { extractedText: string };

    // Extract conversation name from filename (e.g., "guillaume/whatsapp_danielle_1.jpeg" -> "whatsapp_danielle")
    const match = filename.match(/([a-z_]+)_\d+\.(jpeg|jpg|png)$/i);
    if (!match) continue;

    const convName = match[1];
    const convId = `ocr_${convName}`;

    if (!conversations.has(convId)) {
      const platform = inferPlatform(filename);
      conversations.set(convId, {
        id: convId,
        source: filename.includes('le_state') ? 'le_state' : 'guillaume',
        platform,
        outcome: 'unknown',
        context: `OCR de ${convName}`,
        lines: [],
        tags: [platform, 'ocr'],
      });
    }

    // Add extracted lines
    const conv = conversations.get(convId)!;
    const lines = extractedText
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);
    conv.lines.push(...lines);
  }

  return conversations;
}

// Parse analysis files (*_avec_analyse.txt)
function parseAnalysisFiles(dir: string): Map<string, string> {
  const analyses = new Map<string, string>();
  const files = fs.readdirSync(dir).filter(f => f.includes('avec_analyse'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');

    // Split at analysis separator
    const parts = content.split(/---+\s*\n*ANALYSE/i);
    if (parts.length >= 2) {
      const analysisText = parts[1].trim();

      // Extract conversation ID from filename
      const idMatch = file.match(/(\d+)/);
      if (idMatch) {
        analyses.set(`telegram_${idMatch[1]}`, analysisText);
      }
    }
  }

  return analyses;
}

// Helper functions
function inferTags(context: string): string[] {
  const tags: string[] = [];
  const lower = (context || '').toLowerCase();

  if (lower.includes('tinder')) tags.push('tinder');
  if (lower.includes('rue') || lower.includes('street') || lower.includes('abordage')) tags.push('street');
  if (lower.includes('date')) tags.push('date');
  if (lower.includes('instagram') || lower.includes('insta')) tags.push('instagram');
  if (lower.includes('whatsapp')) tags.push('whatsapp');
  if (lower.includes('couché') || lower.includes('sex') || lower.includes('fc')) tags.push('sexual');
  if (lower.includes('telegram')) tags.push('telegram');

  return tags.length > 0 ? tags : ['general'];
}

function inferPlatform(context: string): string {
  const lower = (context || '').toLowerCase();
  if (lower.includes('tinder')) return 'tinder';
  if (lower.includes('instagram') || lower.includes('insta')) return 'instagram';
  if (lower.includes('whatsapp')) return 'whatsapp';
  if (lower.includes('telegram')) return 'telegram';
  if (lower.includes('rue') || lower.includes('street')) return 'street';
  return 'unknown';
}

function inferOutcome(context: string): string {
  const lower = (context || '').toLowerCase();
  if (lower.includes('fc') || lower.includes('couché')) return 'full_close';
  if (lower.includes('date')) return 'date';
  if (lower.includes('numéro') || lower.includes('numero')) return 'number_close';
  return 'unknown';
}

// Main function
function main() {
  console.log('🚀 Knowledge Base Ingestion (Enhanced)');
  console.log('======================================\n');

  // Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const kb: KnowledgeBase = {
    principles: [],
    conversations: [],
    stats: {
      totalConversations: 0,
      sources: {},
      generatedAt: new Date().toISOString(),
    },
  };

  // 1. Parse principles
  const principesPath = path.join(DATA_DIR, 'Principes textgame.txt');
  if (fs.existsSync(principesPath)) {
    kb.principles = parsePrinciples(fs.readFileSync(principesPath, 'utf-8'));
    console.log(`✅ Parsed ${kb.principles.length} principles`);
  }

  // 2. Parse le_state/telegram/all.txt
  const allTxtPath = path.join(DATA_DIR, 'le_state/telegram/all.txt');
  if (fs.existsSync(allTxtPath)) {
    const telegramConvs = parseAllConversations(fs.readFileSync(allTxtPath, 'utf-8'));
    kb.conversations.push(...telegramConvs);
    console.log(`✅ Parsed ${telegramConvs.length} conversations from all.txt`);
  }

  // 3. Parse analysis files and attach to conversations
  const telegramDir = path.join(DATA_DIR, 'le_state/telegram');
  if (fs.existsSync(telegramDir)) {
    const analyses = parseAnalysisFiles(telegramDir);
    for (const conv of kb.conversations) {
      if (analyses.has(conv.id)) {
        conv.analysis = analyses.get(conv.id);
      }
    }
    console.log(`✅ Attached ${analyses.size} analysis annotations`);
  }

  // 4. Parse text conversations from guillaume/
  const guillaumeDir = path.join(DATA_DIR, 'guillaume');
  if (fs.existsSync(guillaumeDir)) {
    const txtFiles = fs.readdirSync(guillaumeDir).filter(f => f.endsWith('.txt'));
    for (const file of txtFiles) {
      const conv = parseTextConversation(path.join(guillaumeDir, file), `txt_${file.replace('.txt', '')}`);
      if (conv) {
        kb.conversations.push(conv);
      }
    }
    console.log(`✅ Parsed ${txtFiles.length} text conversation files`);
  }

  // 5. Parse OCR cache
  const ocrConversations = parseOcrCache(OCR_CACHE_FILE);
  kb.conversations.push(...ocrConversations.values());
  console.log(`✅ Added ${ocrConversations.size} OCR-based conversations`);

  // 6. Calculate stats
  kb.stats.totalConversations = kb.conversations.length;
  for (const conv of kb.conversations) {
    kb.stats.sources[conv.source] = (kb.stats.sources[conv.source] || 0) + 1;
  }

  // 7. Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(kb, null, 2));

  console.log('\n======================================');
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`📊 Stats:`);
  console.log(`   - Principles: ${kb.principles.length}`);
  console.log(`   - Conversations: ${kb.stats.totalConversations}`);
  console.log(`   - Sources:`, kb.stats.sources);
}

main();
