export interface EmotionLabel {
  name: string;
  score: number; // 0-10 or percentage
}

export interface Extracted {
  keywords: string[];
  emotions: EmotionLabel[] | string[];
  people: string[];
  locations?: string[];
  scenes?: string[];
  actions?: string[];
  symbols?: string[];
}

export interface DreamRecord {
  id: string;
  date: string; // ISO 8601 string YYYY-MM-DD
  title: string;
  content: string;
  clarity: number; // 1-5 or 1-10 scale
  tags: string[];
  extracted?: Extracted; // AI analyzed data
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface DictionaryEntry {
  id: string;
  keyword: string;
  interpretation: string;
  category?: string;
}
