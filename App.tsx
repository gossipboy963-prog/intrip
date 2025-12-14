import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ItineraryView from './views/ItineraryView';
import MemoView from './views/MemoView';
import SafetyView from './views/SafetyView';
import MoodView from './views/MoodView';
import { ViewState, Trip, DayItinerary, MemoItem, SafetyData, MoodEntry } from './types';

// --- Initial Data ---
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
  accommodation: {
    name: 'Hotel Resol Kyoto',
    address: '〒604-8033 京都府京都市中京区河原町通三条下る大黒町59-1',
    note: 'check-in: 15:00'
  }
};

const INITIAL_MOODS: MoodEntry[] = [
  { id: 'm1', date: '2024-04-10', mood: 'HAPPY', note: '飛機餐意外地好吃，順利抵達。' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.ITINERARY);
  
  // --- States ---
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [itineraryData, setItineraryData] = useState<Record<string, DayItinerary[]>>(INITIAL_ITINERARY_DATA);
  const [memos, setMemos] = useState<MemoItem[]>(INITIAL_MEMOS);
  const [safetyData, setSafetyData] = useState<SafetyData>(INITIAL_SAFETY);
  const [moods, setMoods] = useState<MoodEntry[]>(INITIAL_MOODS);

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