/**
 * OCR Screenshots Preprocessing Script
 * Uses Gemini Vision API to extract text from conversation screenshots
 * Run once to generate ocr_cache.json, then commit the cache
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const OUTPUT_FILE = path.join(DATA_DIR, 'ocr_cache.json');

// Gemini Vision API endpoint (via Blackbox)
const API_URL = 'https://api.blackbox.ai/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_BLACKBOX_API_KEY || '';
const MODEL = 'blackboxai/google/gemini-3-pro-preview';

interface OcrCache {
  [filename: string]: {
    extractedText: string;
    processedAt: string;
  };
}

async function extractTextFromImage(imagePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: `Tu es un expert en OCR de conversations de messagerie. Extrais tout le texte de cette capture d'écran de conversation.

RÈGLES:
1. Identifie qui parle (l'utilisateur vs l'autre personne) basé sur la position des bulles
2. Format de sortie:
   - "Moi: [message]" pour les messages de l'utilisateur (bulles à droite, souvent en couleur)
   - "Elle: [message]" pour les messages de l'autre personne (bulles à gauche, souvent en gris/blanc)
3. Préserve l'ordre chronologique des messages
4. Inclus les emojis si présents
5. Si tu ne peux pas lire un message, écris "[illisible]"
6. N'ajoute AUCUN commentaire, juste le texte extrait

Exemple de format attendu:
Elle: Coucou ça va ?
Moi: Oui et toi ?
Elle: Super ! On se voit quand ?`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function findAllImages(dir: string): string[] {
  const images: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...findAllImages(fullPath));
    } else if (/\.(jpeg|jpg|png)$/i.test(entry.name)) {
      images.push(fullPath);
    }
  }

  return images;
}

async function main() {
  console.log('🔍 OCR Screenshot Preprocessing');
  console.log('================================\n');

  if (!API_KEY) {
    console.error('❌ EXPO_PUBLIC_BLACKBOX_API_KEY not set');
    process.exit(1);
  }

  // Load existing cache
  let cache: OcrCache = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    cache = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`📂 Loaded existing cache with ${Object.keys(cache).length} entries\n`);
  }

  // Find all images
  const images = findAllImages(DATA_DIR);
  console.log(`📸 Found ${images.length} images to process\n`);

  // Filter out already processed
  const toProcess = images.filter(img => {
    const relPath = path.relative(DATA_DIR, img);
    return !cache[relPath];
  });

  console.log(`🆕 ${toProcess.length} new images to OCR\n`);

  // Process each image
  for (let i = 0; i < toProcess.length; i++) {
    const imagePath = toProcess[i];
    const relPath = path.relative(DATA_DIR, imagePath);

    console.log(`[${i + 1}/${toProcess.length}] Processing: ${relPath}`);

    try {
      const extractedText = await extractTextFromImage(imagePath);
      cache[relPath] = {
        extractedText,
        processedAt: new Date().toISOString(),
      };
      console.log(`   ✅ Extracted ${extractedText.length} chars\n`);

      // Save after each successful extraction (in case of crash)
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));

      // Rate limiting - wait 1s between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
    }
  }

  console.log('\n================================');
  console.log(`💾 Saved OCR cache to: ${OUTPUT_FILE}`);
  console.log(`📊 Total entries: ${Object.keys(cache).length}`);
}

main().catch(console.error);
