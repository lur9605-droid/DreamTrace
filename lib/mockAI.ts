import { Extracted, DictionaryEntry, EmotionLabel } from './types';

// Load dictionary dynamically to avoid bundling issues if not used immediately
// Note: In a real Next.js/React app, this might need adjustment based on build configuration.
// Here we assume the file is available at runtime or bundled via import.
let dictionaryCache: DictionaryEntry[] | null = null;

const loadDictionary = async (): Promise<DictionaryEntry[]> => {
  if (dictionaryCache) return dictionaryCache;

  if (typeof window === 'undefined') {
    // Server-side or build time: might handle differently or return empty
    // For simple client-side mock, we can just try import if environment allows
    // or return empty to be safe.
    return [];
  }

  try {
    // In a typical setup (e.g., Vite/Webpack), importing JSON is supported.
    // Adjust path as needed based on your project structure alias.
    // Using relative path assuming 'data' is at project root relative to 'lib'.
    // If 'data' is not in 'src' or strictly module-resolvable, fetch might be better for public assets.
    // Assuming 'data' folder is compiled or alias set, or we use a direct import if possible.
    // For this mock, we will try to fetch if it's in public, or just hardcode a fallback import logic.
    
    // Strategy: Try to import explicitly.
    // Note: Dynamic import path must be static-analyzable for some bundlers.
    // If this fails, we can fallback to fetch if file is in public folder.
    const dict = await import('../data/dream-dictionary.json');
    dictionaryCache = (dict.default || dict) as DictionaryEntry[];
    return dictionaryCache;
  } catch (error) {
    console.error("Failed to load dream dictionary:", error);
    return [];
  }
};

/**
 * Simple mock function to map keywords to emotions.
 * To extend: Add more keyword-to-emotion mappings here.
 */
const mapEmotions = (text: string, matchedKeywords: string[]): EmotionLabel[] => {
  const emotions: EmotionLabel[] = [];
  const lowerText = text.toLowerCase();

  // Basic keyword mapping
  if (matchedKeywords.includes('坠落') || lowerText.includes('害怕') || lowerText.includes('恐怖')) {
    emotions.push({ name: '恐惧', score: 80 });
  }
  if (matchedKeywords.includes('飞翔') || lowerText.includes('开心') || lowerText.includes('自由')) {
    emotions.push({ name: '快乐', score: 85 });
  }
  if (matchedKeywords.includes('考试') || lowerText.includes('担心') || lowerText.includes('紧张')) {
    emotions.push({ name: '焦虑', score: 70 });
  }
  if (matchedKeywords.includes('水') && (lowerText.includes('平静') || lowerText.includes('温柔'))) {
    emotions.push({ name: '平静', score: 60 });
  }

  // Default if no specific emotion detected
  if (emotions.length === 0) {
    emotions.push({ name: '平和', score: 50 });
  }

  return emotions;
};

/**
 * Simple tokenizer that splits by common Chinese/English punctuation.
 */
const tokenize = (text: string): string[] => {
  return text.split(/[.,，。!！?？\s\n]+/).filter(Boolean);
};

export const parseDream = async (text: string): Promise<{ extracted: Extracted; summary: string }> => {
  const dictionary = await loadDictionary();
  const tokens = tokenize(text);
  
  // Find matches in dictionary
  // Naive approach: check if dictionary keyword exists in text
  // To extend: Use better NLP library (e.g., jieba-js) for tokenization
  const matchedEntries = dictionary.filter(entry => text.includes(entry.keyword));
  
  const keywords = matchedEntries.map(e => e.keyword);
  const interpretations = matchedEntries.map(e => e.interpretation);
  
  // Deduplicate keywords
  const uniqueKeywords = Array.from(new Set(keywords));
  
  // Extract simple entities (Mock implementation)
  // To extend: Use NER (Named Entity Recognition) models
  const people = tokens.filter(t => t.length > 1 && (t.includes('人') || t.includes('友') || t.includes('妈') || t.includes('爸')));
  const locations = tokens.filter(t => t.length > 1 && (t.includes('家') || t.includes('学校') || t.includes('公司') || t.includes('山') || t.includes('海')));

  const emotions = mapEmotions(text, uniqueKeywords);

  // Generate summary
  let summary = "这是一个充满潜意识符号的梦境。";
  if (uniqueKeywords.length > 0) {
    summary = `梦中出现了 ${uniqueKeywords.join('、')} 等意象，${interpretations[0] || ''} 整体氛围似乎偏向${emotions[0]?.name || '中性'}。`;
  } else {
    summary = "这个梦境似乎比较抽象，包含了个人的独特体验，建议结合近期生活状态进行联想。";
  }

  const extracted: Extracted = {
    keywords: uniqueKeywords,
    emotions: emotions,
    people: Array.from(new Set(people)),
    locations: Array.from(new Set(locations)),
  };

  return { extracted, summary };
};
