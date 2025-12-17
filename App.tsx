import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ItineraryView from './views/ItineraryView';
import MemoView from './views/MemoView';
import SafetyView from './views/SafetyView';
import MoodView from './views/MoodView';
import { ViewState, Trip, DayItinerary, MemoItem, SafetyData, MoodEntry } from './types';

// Storage Key
const STORAGE_KEY = 'hitori_app_data_v1';

// --- Initial Data (Fallbacks) ---
const INITIAL_TRIPS: Trip[] = [
  { id: 't1', name: '春の京都獨旅', startDate: '2024-04-10', endDate: '2024-04-15' },
  { id: 't2', name: '首爾散策', startDate: '2024-09-20', endDate: '2024-09-24' }
];

const INITIAL_ITINERARY_DATA: Record<string, DayItinerary[]> = {
  't1': [
    {
      id: 'd1',
      date: '2024-04-10',
      dayLabel: 'Day 1',
      items: [
        { id: 'i1', time: '10:00', title: '抵達關西', location: '關西機場', note: '領取 JR Pass', isCompleted: true },
        { id: 'i2', time: '12:30', title: '寄放行李', location: '京都車站', note: '置物櫃寄放行李', isCompleted: false },
        { id: 'i3', time: '14:00', title: '午後散步', location: '鴨川散步', note: '買咖啡在河邊坐坐', isCompleted: false },
        { id: 'i4', time: '18:00', title: '晚餐', location: '先斗町燒肉', note: '預約：18:30', isCompleted: false },
      ]
    },
    {
      id: 'd2',
      date: '2024-04-11',
      dayLabel: 'Day 2',
      items: [
        { id: 'i5', time: '07:00', title: '晨間參拜', location: '清水寺', note: '早起避開人潮', isCompleted: false },
        { id: 'i6', time: '09:30', title: '散步購物', location: '三年坂', note: '買七味粉', isCompleted: false },
      ]
    }
  ],
  't2': [
    {
      id: 'd1-s',
      date: '2024-09-20',
      dayLabel: 'Day 1',
      items: [
         { id: 'i7', time: '15:00', title: '入住', location: '弘大民宿', note: '記得帶轉接頭', isCompleted: false },
      ]
    }
  ]
};

const INITIAL_MEMOS: MemoItem[] = [
  { id: '1', type: 'EAT', content: '嵐山 廣川鰻魚飯', tags: ['午餐', '預約'], isCompleted: false },
  { id: '2', type: 'BUY', content: '藥妝店休足時間', tags: ['比價'], isCompleted: true },
  { id: '3', type: 'GO', content: '鴨川跳烏龜', tags: ['傍晚', '天氣好'], isCompleted: false },
  { id: '4', type: 'EAT', content: '抹茶聖代', tags: ['祇園'], isCompleted: false },
];

const INITIAL_SAFETY: SafetyData = {
  contacts: [
    { id: 'c1', name: '當地緊急電話', phone: '110 / 119', relation: 'Public' },
    { id: 'c2', name: '外交部駐日代表處', phone: '+81-3-3280-7811', relation: 'Official' }
  ],
  passportNumber: '312456789',
  accommodation: [
    {
      id: 'acc1',
      name: 'Hotel Resol Kyoto',
      address: '〒604-8033 京都府京都市中京区河原町通三条下る大黒町59-1',
      startDate: '2024-04-10',
      endDate: '2024-04-15',
      checkInTime: '15:00',
      note: '櫃檯在 2 樓'
    }
  ]
};

const INITIAL_MOODS: MoodEntry[] = [
  { id: 'm1', date: '2024-04-10', mood: 'HAPPY', note: '飛機餐意外地好吃，順利抵達。' },
];

const INITIAL_HEADER = { title: '我的旅程', subtitle: '每一段獨旅，都是與自己的對話。' };

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.ITINERARY);
  
  // Helper to load state from localStorage or fallback
  const loadState = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key] !== undefined ? parsed[key] : fallback;
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
    return fallback;
  };

  // --- States (Lazy Initialization) ---
  const [appHeader, setAppHeader] = useState(() => loadState('appHeader', INITIAL_HEADER));
  const [trips, setTrips] = useState<Trip[]>(() => loadState('trips', INITIAL_TRIPS));
  const [itineraryData, setItineraryData] = useState<Record<string, DayItinerary[]>>(() => loadState('itineraryData', INITIAL_ITINERARY_DATA));
  const [memos, setMemos] = useState<MemoItem[]>(() => loadState('memos', INITIAL_MEMOS));
  
  // Custom loader for SafetyData to handle migration from single object to array
  const [safetyData, setSafetyData] = useState<SafetyData>(() => {
    const data = loadState('safetyData', INITIAL_SAFETY);
    // Migration: If accommodation is an object (old format), convert to array
    if (data.accommodation && !Array.isArray(data.accommodation)) {
       const oldAcc = data.accommodation as any;
       return {
           ...data,
           accommodation: [{
               id: 'acc_migrated_' + Date.now(),
               name: oldAcc.name || '',
               address: oldAcc.address || '',
               note: oldAcc.note || '',
               startDate: '',
               endDate: '',
               checkInTime: ''
           }]
       };
    }
    return data;
  });

  const [moods, setMoods] = useState<MoodEntry[]>(() => loadState('moods', INITIAL_MOODS));

  // --- Effect: Auto-save to LocalStorage ---
  useEffect(() => {
    const dataToSave = {
      appHeader,
      trips,
      itineraryData,
      memos,
      safetyData,
      moods,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [appHeader, trips, itineraryData, memos, safetyData, moods]);

  // --- Handlers: App Header ---
  const handleUpdateAppHeader = (title: string, subtitle: string) => {
    setAppHeader({ title, subtitle });
  };

  // --- Handlers: Trip ---
  const handleAddTrip = (newTrip: Trip) => {
    setTrips([...trips, newTrip]);
    setItineraryData({
      ...itineraryData,
      [newTrip.id]: [
        { id: `d1-${newTrip.id}`, date: newTrip.startDate, dayLabel: 'Day 1', items: [] }
      ]
    });
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips(trips.filter(t => t.id !== tripId));
    const newItineraryData = { ...itineraryData };
    delete newItineraryData[tripId];
    setItineraryData(newItineraryData);
  };

  const handleUpdateItinerary = (tripId: string, days: DayItinerary[]) => {
    setItineraryData({ ...itineraryData, [tripId]: days });
  };

  // --- Handlers: Memo ---
  const handleAddMemo = (memo: MemoItem) => setMemos([...memos, memo]);
  const handleUpdateMemo = (memo: MemoItem) => setMemos(memos.map(m => m.id === memo.id ? memo : m));
  const handleDeleteMemo = (id: string) => setMemos(memos.filter(m => m.id !== id));

  // --- Handlers: Safety ---
  const handleUpdateSafety = (data: SafetyData) => setSafetyData(data);

  // --- Handlers: Mood ---
  const handleAddMood = (mood: MoodEntry) => setMoods([mood, ...moods]); // Newest first
  const handleUpdateMood = (mood: MoodEntry) => setMoods(moods.map(m => m.id === mood.id ? mood : m));
  const handleDeleteMood = (id: string) => setMoods(moods.filter(m => m.id !== id));

  // --- Handlers: Data Backup ---
  const handleExportData = () => {
    const data = {
        appHeader,
        trips,
        itineraryData,
        memos,
        safetyData,
        moods,
        exportDate: new Date().toISOString(),
        appVersion: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hitori_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            // Basic validation
            if (json.trips && json.itineraryData) {
                if (json.appHeader) setAppHeader(json.appHeader);
                setTrips(json.trips);
                setItineraryData(json.itineraryData);
                if (json.memos) setMemos(json.memos);
                if (json.safetyData) setSafetyData(json.safetyData);
                if (json.moods) setMoods(json.moods);
                alert('資料還原成功。');
            } else {
                alert('檔案格式錯誤，無法讀取。');
            }
        } catch (error) {
            console.error(error);
            alert('檔案讀取失敗。');
        }
    };
    reader.readAsText(file);
  };

  // --- View Rendering ---
  const renderView = () => {
    switch (currentView) {
      case ViewState.ITINERARY:
        return (
          <ItineraryView 
            trips={trips}
            itineraryData={itineraryData}
            onAddTrip={handleAddTrip}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
            onUpdateItinerary={handleUpdateItinerary}
            onExport={handleExportData}
            onImport={handleImportData}
            appTitle={appHeader.title}
            appSubtitle={appHeader.subtitle}
            onUpdateAppHeader={handleUpdateAppHeader}
          />
        );
      case ViewState.MEMO:
        return (
          <MemoView 
            memos={memos}
            onAdd={handleAddMemo}
            onUpdate={handleUpdateMemo}
            onDelete={handleDeleteMemo}
          />
        );
      case ViewState.SAFETY:
        return (
          <SafetyView 
            data={safetyData}
            onUpdate={handleUpdateSafety}
          />
        );
      case ViewState.MOOD:
        return (
          <MoodView 
            moods={moods}
            onAdd={handleAddMood}
            onUpdate={handleUpdateMood}
            onDelete={handleDeleteMood}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-hitori-bg text-hitori-text selection:bg-hitori-red/10">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl shadow-stone-200 overflow-hidden bg-hitori-bg">
        {renderView()}
        <Navigation currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;