import React, { useState } from 'react';
import { getMoodIcon, MoodEntry } from '../types';
import { Trash2, X } from 'lucide-react';

interface MoodViewProps {
  moods: MoodEntry[];
  onAdd: (mood: MoodEntry) => void;
  onUpdate: (mood: MoodEntry) => void;
  onDelete: (id: string) => void;
}

const MoodView: React.FC<MoodViewProps> = ({ moods, onAdd, onUpdate, onDelete }) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  const moodOptions: MoodEntry['mood'][] = ['HAPPY', 'CALM', 'TIRED', 'LOVED'];
  const moodLabels = {
    'HAPPY': '開心',
    'CALM': '平靜',
    'TIRED': '有點累',
    'LOVED': '被療癒',
  };

  const handleSaveToday = () => {
      if (!selectedMood) return;
      const today = new Date().toISOString().split('T')[0];
      const newEntry: MoodEntry = {
          id: Date.now().toString(),
          date: today,
          mood: selectedMood,
          note
      };
      onAdd(newEntry);
      setSelectedMood(null);
      setNote('');
  };

  const handleUpdateEntry = () => {
      if (!editingEntry) return;
      onUpdate(editingEntry);
      setEditingEntry(null);
  };

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-hitori-bg font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-hitori-text mb-2">今日心晴</h1>
        <p className="text-xs text-hitori-muted">不說話也可以，記錄此刻的感受。</p>
      </div>

      {/* Today's Input */}
      <div className="bg-white p-6 rounded-2xl border border-hitori-line shadow-sm mb-10">
        <h2 className="text-sm font-bold text-hitori-text mb-6 text-center">今天過得如何？</h2>
        
        <div className="flex justify-between mb-8 px-2">
          {moodOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                selectedMood === m ? 'transform scale-110' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-4xl filter drop-shadow-sm">{getMoodIcon(m)}</span>
              <span className={`text-[10px] ${selectedMood === m ? 'text-hitori-red font-bold' : 'text-hitori-muted'}`}>
                {moodLabels[m]}
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="寫下一句話給今天的自己..."
          className="w-full h-24 p-3 bg-hitori-bg rounded-xl border border-hitori-line text-sm text-hitori-text placeholder-hitori-muted/50 focus:outline-none focus:border-hitori-red/30 resize-none transition-colors selection:bg-hitori-red/20"
        />
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSaveToday}
            disabled={!selectedMood}
            className="px-6 py-2 bg-hitori-text text-white text-xs rounded-full hover:bg-hitori-red transition-colors duration-300 disabled:opacity-50"
          >
            記錄
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-bold text-hitori-text mb-4 pl-1 border-l-2 border-hitori-red/50 leading-none">過往記錄</h2>
        <div className="space-y-4">
          {moods.map((entry) => (
            <div key={entry.id} className="flex space-x-4 cursor-pointer group" onClick={() => setEditingEntry(entry)}>
               <div className="flex flex-col items-center pt-1">
                 <span className="text-xs font-mono text-hitori-muted">{entry.date.split('-')[1]}/{entry.date.split('-')[2]}</span>
                 <div className="h-full w-px bg-hitori-line mt-2 group-hover:bg-hitori-red/30 transition-colors"></div>
               </div>
               <div className="flex-1 pb-6">
                 <div className="bg-white p-4 rounded-xl border border-hitori-line shadow-sm flex items-start space-x-3 hover:shadow-md hover:border-hitori-red/30 transition-all">
                   <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                   <div>
                     <p className="text-sm text-hitori-text leading-relaxed">{entry.note}</p>
                   </div>
                 </div>
               </div>
            </div>
          ))}
          {moods.length === 0 && <div className="text-center text-xs text-hitori-muted py-4">還沒有記錄，開始你的第一筆吧。</div>}
        </div>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-hitori-muted">{editingEntry.date}</span>
                <button onClick={() => setEditingEntry(null)} className="text-hitori-muted"><X size={20}/></button>
             </div>
             
             <div className="flex justify-between mb-6 px-2">
                {moodOptions.map((m) => (
                    <button
                    key={m}
                    onClick={() => setEditingEntry({...editingEntry, mood: m})}
                    className={`text-3xl transition-transform ${editingEntry.mood === m ? 'scale-110' : 'opacity-40'}`}
                    >
                    {getMoodIcon(m)}
                    </button>
                ))}
             </div>

             <textarea
                value={editingEntry.note}
                onChange={(e) => setEditingEntry({...editingEntry, note: e.target.value})}
                className="w-full h-24 p-3 bg-hitori-bg rounded-xl border border-hitori-line text-sm focus:border-hitori-red outline-none resize-none mb-4 selection:bg-hitori-red/20"
             />

             <div className="flex justify-between items-center">
                 <button onClick={() => { onDelete(editingEntry.id); setEditingEntry(null); }} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                 <button onClick={handleUpdateEntry} className="px-6 py-2 bg-hitori-text text-white text-xs rounded-full">更新</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodView;