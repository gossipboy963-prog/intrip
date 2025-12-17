export enum ViewState {
  ITINERARY = 'ITINERARY',
  MEMO = 'MEMO',
  SAFETY = 'SAFETY',
  MOOD = 'MOOD'
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  // Status is now calculated dynamically, removing manual field
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;    // New: Name of the activity (e.g., "Dinner", "Visit Temple")
  location: string; // Place (e.g., "Kiyomizu-dera", "Restaurant X")
  note?: string;
  mapLink?: string;
  isCompleted: boolean;
}

export interface DayItinerary {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Day 1"
  items: ItineraryItem[];
}

export interface MemoItem {
  id: string;
  type: 'EAT' | 'BUY' | 'GO';
  content: string;
  tags: string[];
  isCompleted: boolean;
}

export interface SafetyContact {
  id: string;
  name: string;
  phone: string;
  relation: string; // e.g., "Embassy", "Family"
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  checkInTime: string;
  note: string;
}

export interface SafetyData {
  contacts: SafetyContact[];
  passportNumber: string;
  accommodation: Accommodation[];
}

export interface MoodEntry {
  id: string; // Added ID for editing/deleting
  date: string;
  mood: 'HAPPY' | 'CALM' | 'TIRED' | 'LOVED';
  note: string;
}

// Helper to get mood icon
export const getMoodIcon = (mood: MoodEntry['mood']) => {
  switch (mood) {
    case 'HAPPY': return '😊';
    case 'CALM': return '😌';
    case 'TIRED': return '😵';
    case 'LOVED': return '🫶';
    default: return '😐';
  }
};