
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const OUTPUT_DIR = path.join(__dirname, '../features/coach/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'knowledge_base.json');

interface KnowledgeBase {
  principles: string[];
  conversations: ConversationExample[];
}

interface ConversationExample {
  id: string;
  title: string;
  context: string; // The text in the parentheses e.g. "de l'abordage de rue..."
  lines: string[];
  tags: string[]; // inferred tags
}

const parsePrinciples = (text: string): string[] => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim()) // Remove "- "
    .filter(line => line.length > 0);
};

const parseConversations = (text: string): ConversationExample[] => {
  // Split by "Conversation X" headers
  // Regex to match headers like: "Conversation 1 (metadata) :"
  const headerRegex = /Conversation\s+(\d+)\s*\((.*?)\)\s*:/g;

  const conversations: ConversationExample[] = [];
  let match;
  let lastIndex = 0;

  // Find all start indices
  const matches = [];
  while ((match = headerRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      id: match[1],
      context: match[2],
      fullMatch: match[0]
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    // Content starts after the header
    const startContent = current.index + current.fullMatch.length;
    // Content ends at the start of next header, or end of file
    const endContent = next ? next.index : text.length;

    const contentBlock = text.substring(startContent, endContent).trim();

    // Parse lines
    const lines = contentBlock
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .filter(l => !l.startsWith('[...]')); // Remove ellipses

    // simple tag inference
    const tags: string[] = [];
    const lowerContext = current.context.toLowerCase();
    if (lowerContext.includes('tinder')) tags.push('tinder');
    if (lowerContext.includes('rue') || lowerContext.includes('street')) tags.push('street');
    if (lowerContext.includes('date')) tags.push('date');
    if (lowerContext.includes('instagram') || lowerContext.includes('insta')) tags.push('instagram');
    if (lowerContext.includes('couché') || lowerContext.includes('sex')) tags.push('sexual');

    conversations.push({
      id: current.id,
      title: `Conversation ${current.id}`,
      context: current.context,
      lines,
      tags
    });
  }

  return conversations;
};

const main = () => {
  console.log('🚀 Starting Knowledge Ingestion...');

  // 1. Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Read Files
  const principesPath = path.join(DATA_DIR, 'Principes textgame.txt');
  const conversationsPath = path.join(DATA_DIR, 'Textgame Le State.txt');

  if (!fs.existsSync(principesPath) || !fs.existsSync(conversationsPath)) {
    console.error('❌ Data files not found in:', DATA_DIR);
    process.exit(1);
  }

  const principestxt = fs.readFileSync(principesPath, 'utf-8');
  const conversationstxt = fs.readFileSync(conversationsPath, 'utf-8');

  // 3. Parse
  const principles = parsePrinciples(principestxt);
  console.log(`✅ Parsed ${principles.length} principles`);

  const conversations = parseConversations(conversationstxt);
  console.log(`✅ Parsed ${conversations.length} conversations`);

  // 4. Write
  const kb: KnowledgeBase = {
    principles,
    conversations
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(kb, null, 2));
  console.log(`💾 Saved knowledge base to: ${OUTPUT_FILE}`);
};

main();
