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
  createdAt: string; // ISO 8601 string
  rawText?: string;
  summary?: string;
  extracted?: Extracted;
  // Legacy fields for backward compatibility
  date?: string; 
  title?: string;
  content?: string;
  clarity?: number;
  tags?: string[];
  updatedAt?: number;
}

export interface DictionaryEntry {
  id: string;
  keyword: string;
  interpretation: string;
  category?: string;
}
