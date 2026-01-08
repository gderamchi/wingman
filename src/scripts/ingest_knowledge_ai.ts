/**
 * AI-Powered Knowledge Base Ingestion Script
 * Uses Gemini 3 Pro Preview via Blackbox API to analyze conversation screenshots
 * and generate a structured, pedagogical knowledge base for RAG.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

// ==================== Configuration ====================
const DATA_DIR = path.join(__dirname, '../../data');
const OUTPUT_DIR = path.join(__dirname, '../features/coach/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'knowledge_base.json');

const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
const BLACKBOX_API_KEY = process.env.EXPO_PUBLIC_BLACKBOX_API_KEY || '';
const MODEL = 'blackboxai/google/gemini-3-pro-preview';

// Rate limiting
const DELAY_BETWEEN_CALLS_MS = 1000;

// TEST MODE: process only first screenshot per group for quick validation
// Set to false for full processing
const TEST_MODE = process.argv.includes('--test');

// ==================== Types ====================
interface Message {
  speaker: 'moi' | 'elle';
  text: string;
}

interface AIAnalysisResult {
  platform: 'whatsapp' | 'instagram' | 'tinder' | 'telegram' | 'street' | 'unknown';
  messages: Message[];
  context: string;
  outcome: 'date' | 'ghosted' | 'number_close' | 'full_close' | 'ongoing' | 'unknown';
  dynamic: string;
  pedagogicalPoints: string[];
  principlesApplied: string[];
}

interface Principle {
  id: string;
  text: string;
  shortName: string;
  category: 'style' | 'timing' | 'mindset' | 'content' | 'logistics';
}

interface Conversation {
  id: string;
  source: string;
  platform: string;
  outcome: string;
  context: string;
  lines: string[];
  analysis?: string;
  tags: string[];
  pedagogicalPoints?: string[];
  principlesApplied?: string[];
}

interface PlatformContext {
  name: string;
  characteristics: string[];
  commonMistakes: string[];
}

interface KnowledgeBase {
  principles: Principle[];
  platforms: { [key: string]: PlatformContext };
  conversations: Conversation[];
  stats: {
    totalConversations: number;
    totalPrinciples: number;
    sources: { [key: string]: number };
    generatedAt: string;
  };
}

// ==================== AI Analysis Prompt ====================
const ANALYSIS_PROMPT = `Tu es un expert en analyse de conversations de séduction et de textgame.
Analyse ce screenshot de conversation de messagerie.

RÈGLES D'ATTRIBUTION DES LOCUTEURS (TRÈS IMPORTANT):
- Les messages à DROITE de l'écran sont de l'utilisateur ("moi")
- Les messages à GAUCHE de l'écran sont de l'autre personne ("elle")
- Fais très attention à la position des bulles de message

PRINCIPES DE TEXTGAME À IDENTIFIER:
P01: Messages courts (plusieurs petits messages plutôt qu'un gros)
P02: Fun, détachement et passion sans paraître trop investi
P03: Directif avec grande confiance en soi
P04: Objectif = obtenir un rendez-vous (date)
P05: Générer des émotions positives (rire, désir, curiosité)
P06: Utiliser ".." au lieu de "..." (moins investi)
P07: Peu d'emojis, surtout si elle n'en met pas
P08: Directif pour la logistique (heure/lieu précis)
P09: Point d'insolence/arrogance
P10: L'homme est le prix (position recruteur)
P11: Sous-texte sexuel (double sens)
P12: Phrases courtes (10 mots max)
P13: Joueur/taquin
P14: Jamais 2 questions d'affilée
P15: Messages pas plus longs que les siens
P16: Pas de messages vendredi/samedi soir
P17: Chaque message = émotion positive
P18: Ne pas donner plus d'attention qu'elle

RETOURNE UNIQUEMENT UN JSON VALIDE (pas de markdown, pas de texte avant/après):
{
  "platform": "whatsapp|instagram|tinder|telegram|street|unknown",
  "messages": [
    {"speaker": "moi", "text": "contenu exact du message"},
    {"speaker": "elle", "text": "contenu exact du message"}
  ],
  "context": "description du contexte (ex: rencontre de rue, match Tinder, relance après ghosting...)",
  "outcome": "date|ghosted|number_close|full_close|ongoing|unknown",
  "dynamic": "analyse de qui investit le plus et du niveau d'intérêt mutuel",
  "pedagogicalPoints": [
    "Explication détaillée de ce qui fonctionne bien dans cet échange et pourquoi",
    "Technique de textgame utilisée et son effet",
    "Erreur potentielle évitée ou commise"
  ],
  "principlesApplied": ["P01", "P03", "P10"]
}`;

// ==================== Utility Functions ====================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function encodeImageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

// ==================== Blackbox API ====================

async function analyzeScreenshot(imagePath: string): Promise<AIAnalysisResult | null> {
  if (!BLACKBOX_API_KEY) {
    console.error('❌ No Blackbox API key found in environment');
    return null;
  }

  const base64Image = encodeImageToBase64(imagePath);
  const mimeType = getMimeType(imagePath);

  const messages = [
    {
      role: 'system',
      content: ANALYSIS_PROMPT
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyse cette conversation et retourne le JSON structuré.'
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        }
      ]
    }
  ];

  try {
    const response = await fetch(BLACKBOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        model: MODEL,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    try {
      return JSON.parse(jsonStr) as AIAnalysisResult;
    } catch (parseError) {
      console.error(`❌ Failed to parse AI response as JSON:`, content.slice(0, 300));
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
    return null;
  }
}

// ==================== Data Parsing ====================

function parsePrinciples(text: string): Principle[] {
  const rawPrinciples = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim())
    .filter(line => line.length > 0 && !line.startsWith('----'));

  return rawPrinciples.map((text, index) => {
    const id = `P${String(index + 1).padStart(2, '0')}`;
    const shortName = extractShortName(text);
    const category = inferCategory(text);
    return { id, text, shortName, category };
  });
}

function extractShortName(text: string): string {
  const match = text.match(/^([^(]+)/);
  const base = match ? match[1].trim() : text;
  return base.length > 35 ? base.substring(0, 32) + '...' : base;
}

function inferCategory(text: string): Principle['category'] {
  const lower = text.toLowerCase();
  if (lower.includes('message') || lower.includes('court') || lower.includes('phrase')) return 'style';
  if (lower.includes('vendredi') || lower.includes('samedi') || lower.includes('72h')) return 'timing';
  if (lower.includes('confiance') || lower.includes('détach') || lower.includes('needy') || lower.includes('prix')) return 'mindset';
  if (lower.includes('rendez-vous') || lower.includes('logistique') || lower.includes('heure')) return 'logistics';
  return 'content';
}

function getPlatformContexts(): { [key: string]: PlatformContext } {
  return {
    tinder: {
      name: 'Tinder',
      characteristics: [
        "Elle scroll vite, tu as 3 messages pour capter son attention",
        "Les openers originaux performent mieux que 'Salut ça va'",
        "Le bio et les photos comptent autant que le texte",
        "Propose rapidement de passer sur Instagram ou WhatsApp"
      ],
      commonMistakes: [
        "Juste 'Salut ça va' comme opener",
        "Compliment physique direct en premier message",
        "Trop de messages sans proposer de date"
      ]
    },
    whatsapp: {
      name: 'WhatsApp',
      characteristics: [
        "Tu as déjà le numéro = elle a de l'intérêt confirmé",
        "Les vocaux peuvent être stratégiques pour créer du lien",
        "Les 'vu' sont visibles, joue avec le timing",
        "Tu peux être plus direct qu'sur les apps"
      ],
      commonMistakes: [
        "Envoyer des pavés de texte",
        "Répondre instantanément à chaque message",
        "Ignorer les signes de désintérêt"
      ]
    },
    instagram: {
      name: 'Instagram',
      characteristics: [
        "Elle peut voir ton profil = DHV passif via tes posts",
        "Les stories sont des occasions de relance naturelles",
        "Les réactions aux stories = opener soft et non-invasif",
        "Les DM requests peuvent être ignorés, sois patient"
      ],
      commonMistakes: [
        "Liker 50 photos d'un coup avant d'écrire",
        "Réagir à toutes ses stories",
        "Message trop formel type 'Bonjour, je me permets...'"
      ]
    },
    street: {
      name: 'Approche de rue',
      characteristics: [
        "Premier message = rappeler le contexte de la rencontre",
        "Elle t'a donné son num = déjà intéressée, pas besoin de resell",
        "Le délai avant le premier message compte (pas trop vite, pas 3 jours)",
        "Message le soir même ou le lendemain"
      ],
      commonMistakes: [
        "Attendre plusieurs jours avant d'écrire",
        "'C'était super de te rencontrer' (trop formel)",
        "Ne pas rappeler le contexte (elle a peut-être oublié)"
      ]
    }
  };
}

// Parse existing text conversations (already correctly formatted)
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

    // Split at analysis separator if present
    const analysisSplit = contentBlock.split(/---+\s*\n*ANALYSE/i);
    const conversationPart = analysisSplit[0].trim();
    const analysisPart = analysisSplit[1] ? analysisSplit[1].replace(/^[^\n]*\n/, '').trim() : undefined;

    const lines = conversationPart
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('[...]'));

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
      analysis: analysisPart,
      tags,
    });
  }

  return conversations;
}

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

// ==================== Screenshot Processing ====================

interface ScreenshotGroup {
  baseName: string;
  files: string[];
}

function groupScreenshots(dir: string): ScreenshotGroup[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f =>
    /\.(jpe?g|png)$/i.test(f)
  );

  const groups = new Map<string, string[]>();

  for (const file of files) {
    // Extract base name (e.g., "whatsapp_marine" from "whatsapp_marine_1.jpeg")
    const match = file.match(/^(.+?)(?:_\d+)?\.(jpe?g|png)$/i);
    if (match) {
      const baseName = match[1];
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(file);
    }
  }

  // Sort files within each group and return
  return Array.from(groups.entries()).map(([baseName, files]) => ({
    baseName,
    files: files.sort((a, b) => {
      const numA = parseInt(a.match(/_(\d+)\./)?.[1] || '0');
      const numB = parseInt(b.match(/_(\d+)\./)?.[1] || '0');
      return numA - numB;
    })
  }));
}

async function processScreenshotGroup(
  dir: string,
  group: ScreenshotGroup,
  source: string
): Promise<Conversation | null> {
  // In TEST_MODE, only process first 2 screenshots per group
  const filesToProcess = TEST_MODE ? group.files.slice(0, 2) : group.files;
  console.log(`\n📱 Processing: ${group.baseName} (${filesToProcess.length}${TEST_MODE ? ` of ${group.files.length}` : ''} screenshots)`);

  const allMessages: Message[] = [];
  let platform = 'unknown';
  let context = group.baseName.replace(/_/g, ' ');
  let outcome = 'unknown';
  let dynamic = '';
  const pedagogicalPoints: string[] = [];
  const principlesApplied: string[] = [];

  for (const file of filesToProcess) {
    const filePath = path.join(dir, file);
    console.log(`  📸 Analyzing: ${file}...`);

    const result = await analyzeScreenshot(filePath);

    if (result) {
      // Merge messages
      allMessages.push(...result.messages);

      // Use first valid platform detected
      if (platform === 'unknown' && result.platform !== 'unknown') {
        platform = result.platform;
      }

      // Use the most specific context
      if (result.context && result.context !== 'unknown') {
        context = result.context;
      }

      // Update outcome if more specific
      if (result.outcome !== 'unknown') {
        outcome = result.outcome;
      }

      // Collect dynamic analysis
      if (result.dynamic) {
        dynamic = result.dynamic;
      }

      // Collect pedagogical points
      pedagogicalPoints.push(...(result.pedagogicalPoints || []));

      // Collect principles
      principlesApplied.push(...(result.principlesApplied || []));

      console.log(`    ✅ Extracted ${result.messages.length} messages`);
    } else {
      console.log(`    ⚠️ Failed to analyze`);
    }

    // Rate limiting
    await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  if (allMessages.length === 0) {
    console.log(`  ❌ No messages extracted for ${group.baseName}`);
    return null;
  }

  // Format lines for knowledge base
  const lines = allMessages.map(m =>
    `${m.speaker === 'moi' ? 'Moi' : 'Elle'}: ${m.text}`
  );

  // Deduplicate principles
  const uniquePrinciples = Array.from(new Set(principlesApplied));

  // Create analysis from pedagogical points
  const analysis = pedagogicalPoints.length > 0
    ? `ANALYSE PÉDAGOGIQUE:\n${pedagogicalPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nDYNAMIQUE: ${dynamic}\n\nPRINCIPES APPLIQUÉS: ${uniquePrinciples.join(', ')}`
    : undefined;

  const tags = inferTags(group.baseName);
  if (platform !== 'unknown' && !tags.includes(platform)) {
    tags.unshift(platform);
  }

  return {
    id: `ai_${group.baseName}`,
    source,
    platform,
    outcome,
    context,
    lines,
    analysis,
    tags,
    pedagogicalPoints: pedagogicalPoints.length > 0 ? pedagogicalPoints : undefined,
    principlesApplied: uniquePrinciples.length > 0 ? uniquePrinciples : undefined,
  };
}

// ==================== Main ====================

async function main() {
  console.log('🚀 AI-Powered Knowledge Base Ingestion');
  console.log('========================================');
  console.log(`📦 Model: ${MODEL}`);
  console.log(`🔑 API Key: ${BLACKBOX_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`🧪 Test Mode: ${TEST_MODE ? '✅ ON (use --test flag to enable)' : '❌ OFF (full processing)'}`);
  console.log('');

  if (!BLACKBOX_API_KEY) {
    console.error('❌ EXPO_PUBLIC_BLACKBOX_API_KEY not found in environment');
    console.error('   Please add it to your .env file');
    process.exit(1);
  }

  // Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const kb: KnowledgeBase = {
    principles: [],
    platforms: getPlatformContexts(),
    conversations: [],
    stats: {
      totalConversations: 0,
      totalPrinciples: 0,
      sources: {},
      generatedAt: new Date().toISOString(),
    },
  };

  // 1. Parse principles
  const principesPath = path.join(DATA_DIR, 'Principes textgame.txt');
  if (fs.existsSync(principesPath)) {
    kb.principles = parsePrinciples(fs.readFileSync(principesPath, 'utf-8'));
    console.log(`✅ Parsed ${kb.principles.length} indexed principles`);
  }

  // 2. Parse existing well-formatted conversations from le_state/telegram
  const allTxtPath = path.join(DATA_DIR, 'le_state/telegram/all.txt');
  if (fs.existsSync(allTxtPath)) {
    const telegramConvs = parseAllConversations(fs.readFileSync(allTxtPath, 'utf-8'));
    kb.conversations.push(...telegramConvs);
    console.log(`✅ Parsed ${telegramConvs.length} conversations from all.txt (already structured)`);
  }

  // 3. Process screenshots from guillaume/ with AI
  const guillaumeDir = path.join(DATA_DIR, 'guillaume');
  const guillaumeGroups = groupScreenshots(guillaumeDir);
  console.log(`\n📁 Found ${guillaumeGroups.length} conversation groups in guillaume/`);

  for (const group of guillaumeGroups) {
    const conv = await processScreenshotGroup(guillaumeDir, group, 'guillaume');
    if (conv) {
      kb.conversations.push(conv);
    }
  }

  // 4. Process screenshots from le_state/youtube with AI
  const youtubeBaseDir = path.join(DATA_DIR, 'le_state/youtube');
  if (fs.existsSync(youtubeBaseDir)) {
    const videoDirs = fs.readdirSync(youtubeBaseDir).filter(d =>
      fs.statSync(path.join(youtubeBaseDir, d)).isDirectory()
    );

    for (const videoDir of videoDirs) {
      const fullVideoPath = path.join(youtubeBaseDir, videoDir);
      const videoGroups = groupScreenshots(fullVideoPath);
      console.log(`\n📁 Found ${videoGroups.length} conversation groups in le_state/youtube/${videoDir}`);

      for (const group of videoGroups) {
        const conv = await processScreenshotGroup(fullVideoPath, group, `le_state/youtube/${videoDir}`);
        if (conv) {
          kb.conversations.push(conv);
        }
      }
    }
  }

  // 5. Calculate stats
  kb.stats.totalConversations = kb.conversations.length;
  kb.stats.totalPrinciples = kb.principles.length;
  for (const conv of kb.conversations) {
    kb.stats.sources[conv.source] = (kb.stats.sources[conv.source] || 0) + 1;
  }

  // 6. Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(kb, null, 2));

  console.log('\n========================================');
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`📊 Stats:`);
  console.log(`   - Principles: ${kb.stats.totalPrinciples} (indexed with IDs)`);
  console.log(`   - Platforms: ${Object.keys(kb.platforms).length}`);
  console.log(`   - Conversations: ${kb.stats.totalConversations}`);
  console.log(`   - Sources:`, kb.stats.sources);
  console.log('\n✅ Done!');
}

main().catch(console.error);
