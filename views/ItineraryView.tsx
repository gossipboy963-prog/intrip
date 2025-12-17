import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Plus, ChevronLeft, Calendar as CalendarIcon, Edit2, Trash2, X, Archive, Download, Upload } from 'lucide-react';
import { DayItinerary, ItineraryItem, Trip } from '../types';

interface ItineraryViewProps {
  trips: Trip[];
  itineraryData: Record<string, DayItinerary[]>;
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateItinerary: (tripId: string, days: DayItinerary[]) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  appTitle: string;
  appSubtitle: string;
  onUpdateAppHeader: (title: string, subtitle: string) => void;
}

// Helper to determine trip status
const getTripStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  // Reset time to midnight for accurate date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Adjust dates to avoid timezone issues when parsing YYYY-MM-DD
  // Simple comparison using ISO strings is often safer for display logic
  const todayStr = now.toISOString().split('T')[0];
  
  if (todayStr < startDate) return 'PLANNING';
  if (todayStr > endDate) return 'COMPLETED';
  return 'ONGOING';
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ 
  trips, 
  itineraryData, 
  onAddTrip, 
  onUpdateTrip, 
  onDeleteTrip,
  onUpdateItinerary,
  onExport,
  onImport,
  appTitle,
  appSubtitle,
  onUpdateAppHeader
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  
  const handleSelectTrip = (id: string) => setSelectedTripId(id);
  const handleBack = () => setSelectedTripId(null);

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-hitori-bg font-sans">
      {!selectedTripId ? (
        <TripListView 
          trips={trips} 
          onSelectTrip={handleSelectTrip} 
          onAddTrip={onAddTrip}
          onExport={onExport}
          onImport={onImport}
          appTitle={appTitle}
          appSubtitle={appSubtitle}
          onUpdateAppHeader={onUpdateAppHeader}
        />
      ) : (
        <TripDetailView 
          trip={trips.find(t => t.id === selectedTripId)!}
          days={itineraryData[selectedTripId] || []}
          onBack={handleBack}
          onUpdateDays={(days) => onUpdateItinerary(selectedTripId, days)}
          onUpdateTrip={onUpdateTrip}
          onDeleteTrip={() => {
            onDeleteTrip(selectedTripId);
            handleBack();
          }}
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const TripListView: React.FC<{ 
  trips: Trip[], 
  onSelectTrip: (id: string) => void,
  onAddTrip: (trip: Trip) => void,
  onExport: () => void,
  onImport: (file: File) => void,
  appTitle: string,
  appSubtitle: string,
  onUpdateAppHeader: (title: string, subtitle: string) => void
}> = ({ trips, onSelectTrip, onAddTrip, onExport, onImport, appTitle, appSubtitle, onUpdateAppHeader }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!newTripName || !newTripStart) return;
    const newTrip: Trip = {
      id: Date.now().toString(),
      name: newTripName,
      startDate: newTripStart,
      endDate: newTripEnd || newTripStart
    };
    onAddTrip(newTrip);
    setIsCreating(false);
    setNewTripName('');
    setNewTripStart('');
    setNewTripEnd('');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (window.confirm('匯入將會覆蓋目前的資料，確定要繼續嗎？')) {
        onImport(e.target.files[0]);
      }
      setShowSettings(false);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1 mr-4">
          <input 
            type="text" 
            value={appTitle}
            onChange={(e) => onUpdateAppHeader(e.target.value, appSubtitle)}
            className="w-full text-2xl font-serif text-hitori-text font-bold tracking-wide mb-2 bg-transparent border-b border-transparent hover:border-hitori-line/50 focus:border-hitori-red focus:outline-none placeholder-hitori-muted/30 transition-colors"
            placeholder="設定標題"
          />
          <input 
            type="text" 
            value={appSubtitle}
            onChange={(e) => onUpdateAppHeader(appTitle, e.target.value)}
            className="w-full text-sm text-hitori-muted font-light bg-transparent border-b border-transparent hover:border-hitori-line/50 focus:border-hitori-red focus:outline-none placeholder-hitori-muted/30 transition-colors"
            placeholder="設定副標題"
          />
        </div>
        <div className="relative pt-1">
            <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-2 rounded-full text-hitori-muted hover:bg-stone-100 transition-colors"
            >
                <Archive size={20} />
            </button>
            {showSettings && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-hitori-line p-2 w-40 z-20 animate-in fade-in zoom-in duration-200">
                    <button onClick={onExport} className="w-full text-left px-3 py-2 text-xs text-hitori-text hover:bg-hitori-bg rounded-lg flex items-center gap-2">
                        <Download size={14} /> 備份資料
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-3 py-2 text-xs text-hitori-text hover:bg-hitori-bg rounded-lg flex items-center gap-2">
                        <Upload size={14} /> 匯入備份
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
            )}
        </div>
      </div>

      <div className="space-y-6">
        {trips.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(trip => {
          const status = getTripStatus(trip.startDate, trip.endDate);
          return (
            <div 
                key={trip.id} 
                onClick={() => onSelectTrip(trip.id)}
                className="group relative bg-white p-6 rounded-2xl border border-hitori-line shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${
                    status === 'ONGOING' ? 'bg-hitori-red/5' : 
                    status === 'COMPLETED' ? 'bg-stone-100' : 'bg-transparent'
                }`}></div>
                <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-[10px] tracking-widest rounded-full border transition-colors ${
                    status === 'ONGOING' ? 'bg-hitori-red text-white border-hitori-red shadow-sm shadow-hitori-red/20' : 
                    status === 'COMPLETED' ? 'bg-stone-100 text-stone-400 border-stone-200' : 
                    'bg-white text-hitori-muted border-hitori-muted/50'
                    }`}>
                    {status === 'ONGOING' ? '旅行中' : status === 'PLANNING' ? '規劃中' : '成回憶'}
                    </span>
                </div>
                <h3 className={`text-xl font-serif font-bold mb-2 transition-colors ${status === 'COMPLETED' ? 'text-hitori-muted' : 'text-hitori-text group-hover:text-hitori-red'}`}>
                    {trip.name}
                </h3>
                <div className="flex items-center text-hitori-muted text-xs font-mono space-x-2">
                    <CalendarIcon size={12} />
                    <span>{trip.startDate} ~ {trip.endDate}</span>
                </div>
                </div>
            </div>
          );
        })}
        <button 
          onClick={() => setIsCreating(true)}
          className="w-full py-6 border-2 border-dashed border-hitori-line rounded-2xl text-hitori-muted/60 hover:text-hitori-red hover:border-hitori-red/30 hover:bg-hitori-red/5 transition-all flex flex-col items-center justify-center space-y-2"
        >
          <Plus size={24} />
          <span className="text-sm tracking-wide">開始新的旅程</span>
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-serif font-bold text-hitori-text mb-4">新旅程</h3>
            <div className="space-y-4">
              <input 
                type="text" value={newTripName} onChange={e => setNewTripName(e.target.value)}
                placeholder="例如：冬日北海道" className="w-full p-2 border-b border-hitori-line focus:border-hitori-red outline-none bg-transparent selection:bg-hitori-red/20" autoFocus
              />
              <div className="flex space-x-4">
                <input type="date" value={newTripStart} onChange={e => setNewTripStart(e.target.value)} className="w-full p-2 border-b border-hitori-line focus:border-hitori-red outline-none bg-transparent text-sm selection:bg-hitori-red/20" />
                <input type="date" value={newTripEnd} onChange={e => setNewTripEnd(e.target.value)} className="w-full p-2 border-b border-hitori-line focus:border-hitori-red outline-none bg-transparent text-sm selection:bg-hitori-red/20" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs text-hitori-muted hover:text-hitori-text">取消</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-hitori-red text-white text-xs rounded-full shadow-lg shadow-hitori-red/20">建立</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TripDetailView: React.FC<{
  trip: Trip,
  days: DayItinerary[],
  onBack: () => void,
  onUpdateDays: (days: DayItinerary[]) => void,
  onUpdateTrip: (trip: Trip) => void,
  onDeleteTrip: () => void
}> = ({ trip, days, onBack, onUpdateDays, onUpdateTrip, onDeleteTrip }) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || '');
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editingItem, setEditingItem] = useState<{ dayId: string, item: ItineraryItem | null } | null>(null);
  
  useEffect(() => {
    if (days.length > 0 && !days.find(d => d.id === selectedDayId)) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const currentDay = days.find(d => d.id === selectedDayId);
  const tripStatus = getTripStatus(trip.startDate, trip.endDate);
  const isCompleted = tripStatus === 'COMPLETED';

  const handleSaveItem = (dayId: string, item: ItineraryItem) => {
    const dayIndex = days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;
    const newDays = [...days];
    const existingItemIndex = newDays[dayIndex].items.findIndex(i => i.id === item.id);
    if (existingItemIndex >= 0) newDays[dayIndex].items[existingItemIndex] = item;
    else {
      newDays[dayIndex].items.push(item);
      newDays[dayIndex].items.sort((a, b) => a.time.localeCompare(b.time));
    }
    onUpdateDays(newDays);
    setEditingItem(null);
  };

  const handleDeleteItem = (dayId: string, itemId: string) => {
    const dayIndex = days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;
    const newDays = [...days];
    newDays[dayIndex].items = newDays[dayIndex].items.filter(i => i.id !== itemId);
    onUpdateDays(newDays);
    setEditingItem(null);
  };

  const handleToggleComplete = (itemId: string) => {
     if (!currentDay) return;
     const updatedItem = currentDay.items.find(i => i.id === itemId);
     if (updatedItem) {
       handleSaveItem(currentDay.id, { ...updatedItem, isCompleted: !updatedItem.isCompleted });
     }
  };

  const handleAddDay = () => {
    const lastDay = days[days.length - 1];
    let newDate = new Date(trip.startDate);
    let dayNum = 1;
    if (lastDay) {
        const lastDate = new Date(lastDay.date);
        lastDate.setDate(lastDate.getDate() + 1);
        newDate = lastDate;
        dayNum = days.length + 1;
    }
    const newDay: DayItinerary = {
        id: `d${Date.now()}`,
        date: newDate.toISOString().split('T')[0],
        dayLabel: `Day ${dayNum}`,
        items: []
    };
    onUpdateDays([...days, newDay]);
    setSelectedDayId(newDay.id);
  };

  const handleDeleteDay = (dayId: string) => {
    const dayToDelete = days.find(d => d.id === dayId);
    if (window.confirm(`確定要刪除 ${dayToDelete?.dayLabel} (${dayToDelete?.date}) 嗎？此操作無法復原。`)) {
        const newDays = days.filter(d => d.id !== dayId);
        onUpdateDays(newDays);
        if (selectedDayId === dayId) {
            setSelectedDayId(newDays.length > 0 ? newDays[0].id : '');
        }
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center text-hitori-muted hover:text-hitori-text transition-colors mb-4 text-sm">
          <ChevronLeft size={16} className="mr-1" /> 返回列表
        </button>
        <div className="flex justify-between items-start">
          <div className={isCompleted ? 'opacity-70' : ''}>
            <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-serif text-hitori-text font-bold tracking-wide">{trip.name}</h1>
                {isCompleted && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">成回憶</span>}
            </div>
            <p className="text-sm text-hitori-muted font-light">{trip.startDate} - {trip.endDate}</p>
          </div>
          <button onClick={() => setIsEditingTrip(true)} className="p-2 text-hitori-muted hover:text-hitori-red transition-colors bg-white rounded-full border border-hitori-line shadow-sm">
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto no-scrollbar mb-8 pb-2">
        {days.map((day) => {
          const isSelected = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl transition-all duration-300 border ${
                isSelected ? 'bg-hitori-text text-white border-hitori-text shadow-md' : 'bg-white text-hitori-muted border-hitori-line hover:border-hitori-muted/50'
              }`}
            >
              <span className={`block text-xs uppercase tracking-wider mb-1 ${isSelected ? 'opacity-70' : 'opacity-50'}`}>{day.dayLabel}</span>
              <span className="block text-lg font-serif font-medium">{day.date.split('-')[2]} <span className="text-xs font-sans font-light">日</span></span>
            </button>
          );
        })}
        <button onClick={handleAddDay} className="flex-shrink-0 w-12 flex items-center justify-center rounded-2xl border border-dashed border-hitori-muted/30 text-hitori-muted/50 hover:text-hitori-red hover:border-hitori-red/30">
          <Plus size={20} />
        </button>
      </div>

      {currentDay ? (
        <div className={`relative pl-4 border-l border-hitori-line space-y-8 pb-20 ${isCompleted ? 'grayscale-[0.5]' : ''}`}>
          {currentDay.items.map((item) => (
            <div key={item.id} className="relative group">
              <div className={`absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${item.isCompleted ? 'bg-hitori-line border-hitori-line' : 'bg-hitori-bg border-hitori-red'}`}></div>
              <div 
                onClick={() => setEditingItem({ dayId: currentDay.id, item })}
                className={`relative bg-white p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${item.isCompleted ? 'border-hitori-line opacity-60' : 'border-hitori-line shadow-sm hover:border-hitori-red/30 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2 text-hitori-red font-medium">
                    <Clock size={14} />
                    <span className="text-sm tracking-wide">{item.time}</span>
                  </div>
                  <div className="text-hitori-muted/50 group-hover:text-hitori-text/50">
                    <Edit2 size={12} />
                  </div>
                </div>

                <h3 className={`text-lg font-serif font-bold text-hitori-text mb-1 ${item.isCompleted ? 'line-through decoration-hitori-muted/50' : ''}`}>
                  {item.title || item.location}
                </h3>
                
                <div className="flex items-center text-xs text-hitori-muted mb-2 font-medium">
                    <MapPin size={12} className="mr-1" />
                    {item.location}
                </div>

                {item.note && (
                  <p className="text-sm text-hitori-muted leading-relaxed mb-4 whitespace-pre-line border-l-2 border-hitori-line pl-2 mt-2">
                    {item.note}
                  </p>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-hitori-line/50" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleToggleComplete(item.id)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${item.isCompleted ? 'bg-hitori-line text-hitori-muted' : 'bg-hitori-red-light text-hitori-red hover:bg-hitori-red hover:text-white'}`}
                  >
                    {item.isCompleted ? '已完成' : '標記完成'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="relative pt-4">
            <div className="absolute -left-[19px] top-8 w-1.5 h-1.5 rounded-full bg-hitori-line"></div>
            <button 
                onClick={() => setEditingItem({ dayId: currentDay.id, item: null })}
                className="w-full py-4 border border-dashed border-hitori-muted/30 rounded-2xl text-hitori-muted/60 text-sm hover:text-hitori-red hover:border-hitori-red/30 transition-all flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>新增行程</span>
            </button>
          </div>

          <div className="mt-12 mb-4 flex justify-center">
            <button 
                onClick={() => handleDeleteDay(currentDay.id)}
                className="text-xs text-hitori-muted/30 hover:text-red-400 flex items-center space-x-1 transition-colors px-4 py-2 rounded-full hover:bg-red-50"
            >
                <Trash2 size={14} />
                <span>刪除此日行程</span>
            </button>
         </div>
        </div>
      ) : (
        <div className="text-center text-hitori-muted py-10">請新增天數來開始規劃</div>
      )}

      {isEditingTrip && (
        <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-serif font-bold text-hitori-text">編輯旅程</h3>
                <button onClick={() => setIsEditingTrip(false)} className="text-hitori-muted"><X size={20}/></button>
             </div>
             <div className="space-y-4">
                 <input type="text" defaultValue={trip.name} id="edit-trip-name" className="w-full p-2 border-b border-hitori-line focus:border-hitori-red outline-none selection:bg-hitori-red/20" placeholder="名稱" />
                 <div className="flex gap-2">
                     <input type="date" defaultValue={trip.startDate} id="edit-trip-start" className="w-full p-2 border-b border-hitori-line outline-none selection:bg-hitori-red/20" />
                     <input type="date" defaultValue={trip.endDate} id="edit-trip-end" className="w-full p-2 border-b border-hitori-line outline-none selection:bg-hitori-red/20" />
                 </div>
             </div>
             <div className="flex justify-between items-center mt-6">
                 <button onClick={onDeleteTrip} className="text-xs text-red-500 hover:text-red-700 flex items-center font-medium"><Trash2 size={14} className="mr-1"/> 刪除此旅程</button>
                 <button 
                    onClick={() => {
                        const name = (document.getElementById('edit-trip-name') as HTMLInputElement).value;
                        const start = (document.getElementById('edit-trip-start') as HTMLInputElement).value;
                        const end = (document.getElementById('edit-trip-end') as HTMLInputElement).value;
                        onUpdateTrip({ ...trip, name, startDate: start, endDate: end });
                        setIsEditingTrip(false);
                    }}
                    className="px-6 py-2 bg-hitori-text text-white text-xs rounded-full"
                 >
                     儲存
                 </button>
             </div>
          </div>
        </div>
      )}

      {editingItem && (
        <ItemEditor 
            item={editingItem.item} 
            onSave={(item) => handleSaveItem(editingItem.dayId, item)}
            onDelete={editingItem.item ? (id) => handleDeleteItem(editingItem.dayId, id) : undefined}
            onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

// 24-hour time selector component
const TimeSelector: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [hour, setHour] = useState(value.split(':')[0] || '10');
  const [minute, setMinute] = useState(value.split(':')[1] || '00');

  useEffect(() => {
    onChange(`${hour}:${minute}`);
  }, [hour, minute]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <select 
          value={hour} 
          onChange={(e) => setHour(e.target.value)}
          className="appearance-none bg-hitori-bg border border-hitori-line rounded-lg py-2 pl-3 pr-8 text-hitori-text focus:border-hitori-red outline-none font-mono"
        >
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-hitori-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <span className="text-hitori-muted font-bold">:</span>
      <div className="relative">
        <select 
          value={minute} 
          onChange={(e) => setMinute(e.target.value)}
          className="appearance-none bg-hitori-bg border border-hitori-line rounded-lg py-2 pl-3 pr-8 text-hitori-text focus:border-hitori-red outline-none font-mono"
        >
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-hitori-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

const ItemEditor: React.FC<{
    item: ItineraryItem | null,
    onSave: (item: ItineraryItem) => void,
    onDelete?: (id: string) => void,
    onClose: () => void
}> = ({ item, onSave, onDelete, onClose }) => {
    const [time, setTime] = useState(item?.time || '10:00');
    const [title, setTitle] = useState(item?.title || '');
    const [location, setLocation] = useState(item?.location || '');
    const [note, setNote] = useState(item?.note || '');

    const handleSave = () => {
        if (!title && !location) return;
        const newItem: ItineraryItem = {
            id: item?.id || Date.now().toString(),
            time,
            title: title || location, // Fallback
            location,
            note,
            isCompleted: item?.isCompleted || false
        };
        onSave(newItem);
    };

    return (
        <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-6">
            <div className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-bold text-hitori-text">{item ? '編輯行程' : '新增行程'}</h3>
                    <button onClick={onClose} className="text-hitori-muted p-1 hover:bg-stone-100 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="space-y-5">
                    <div className="flex items-center space-x-3">
                        <Clock size={18} className="text-hitori-red" />
                        <TimeSelector value={time} onChange={setTime} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-hitori-muted ml-1">行程名稱 (做什麼)</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：晚餐、參拜、逛街" className="w-full p-2 border-b border-hitori-line outline-none focus:border-hitori-red text-lg font-bold placeholder-hitori-line selection:bg-hitori-red/20" autoFocus={!item} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-hitori-muted ml-1 flex items-center"><MapPin size={10} className="mr-1"/> 地點 (去哪裡)</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：京都車站" className="w-full p-2 border-b border-hitori-line outline-none focus:border-hitori-red text-sm font-medium placeholder-hitori-line selection:bg-hitori-red/20" />
                    </div>

                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="備註、預約號碼..." className="w-full h-24 p-3 bg-hitori-bg rounded-xl border border-hitori-line text-sm text-hitori-text placeholder-hitori-muted/50 focus:outline-none focus:border-hitori-red resize-none selection:bg-hitori-red/20" />
                </div>

                <div className="flex justify-between items-center mt-8">
                    {item && onDelete ? (
                        <button onClick={() => onDelete(item.id)} className="text-hitori-muted hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                    ) : <div></div>}
                    <button onClick={handleSave} disabled={!title && !location} className="px-8 py-3 bg-hitori-red text-white font-medium rounded-full shadow-lg shadow-hitori-red/20 disabled:opacity-50 disabled:shadow-none">
                        {item ? '更新' : '新增'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryView;