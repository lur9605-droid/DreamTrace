import { DreamRecord } from './types';

const LS_KEY = "dreamtrace_records_v1";

/**
 * Load all dream records from local storage.
 * Returns an empty array if no records found or error occurs.
 */
export const loadRecords = (): DreamRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DreamRecord[];
    }
    return [];
  } catch (error) {
    console.error("Failed to load records from localStorage:", error);
    return [];
  }
};

/**
 * Save a single dream record.
 * If the record has an ID that exists, it updates the existing record.
 * If the ID does not exist or is new, it adds it to the list.
 */
export const saveRecord = (record: DreamRecord): void => {
  if (typeof window === 'undefined') return;

  try {
    const records = loadRecords();
    const index = records.findIndex(r => r.id === record.id);

    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }

    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save record to localStorage:", error);
  }
};

export const updateSaveRecord = (id: string, updates: Partial<DreamRecord>): void => {
  if (typeof window === 'undefined') return;

  try {
    const records = loadRecords();
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      const merged = { ...records[index], ...updates } as DreamRecord;
      records[index] = merged;
      localStorage.setItem(LS_KEY, JSON.stringify(records));
    }
  } catch (error) {
    console.error("Failed to update record in localStorage:", error);
  }
};

/**
 * Delete a dream record by its ID.
 */
export const deleteRecord = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const records = loadRecords();
    const newRecords = records.filter(r => r.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(newRecords));
  } catch (error) {
    console.error("Failed to delete record from localStorage:", error);
  }
};

/**
 * Export all records as a JSON string.
 */
export const exportRecords = (): string => {
  try {
    const records = loadRecords();
    return JSON.stringify(records, null, 2);
  } catch (error) {
    console.error("Failed to export records:", error);
    return "[]";
  }
};
