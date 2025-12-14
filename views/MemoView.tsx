import React, { useState } from 'react';
import { Tag, Utensils, ShoppingBag, MapPin, Plus, X, Trash2, CheckCircle, Circle } from 'lucide-react';
import { MemoItem } from '../types';

interface MemoViewProps {
  memos: MemoItem[];
  onAdd: (memo: MemoItem) => void;
  onUpdate: (memo: MemoItem) => void;
  onDelete: (id: string) => void;
}

const MemoView: React.FC<MemoViewProps> = ({ memos, onAdd, onUpdate, onDelete }) => {
  const [filter, setFilter] = useState<'ALL' | 'EAT' | 'BUY' | 'GO'>('ALL');
  const [editingMemo, setEditingMemo] = useState<Partial<MemoItem> | null>(null);

  const filteredMemos = filter === 'ALL' ? memos : memos.filter(m => m.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EAT': return <Utensils size={14} />;
      case 'BUY': return <ShoppingBag size={14} />;
      case 'GO': return <MapPin size={14} />;
      default: return <Tag size={14} />;
    }
  };

  const getTypeColor = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-hitori-line/50 text-hitori-muted border-hitori-line';
    switch (type) {
      case 'EAT': return 'bg-orange-50 text-orange-800 border-orange-100';
      case 'BUY': return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'GO': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const handleSave = () => {
      if (!editingMemo?.content || !editingMemo.type) return;
      
      const memoToSave: MemoItem = {
          id: editingMemo.id || Date.now().toString(),
          type: editingMemo.type,
          content: editingMemo.content,
          tags: editingMemo.tags || [],
          isCompleted: editingMemo.isCompleted || false
      };

      if (editingMemo.id) {
          onUpdate(memoToSave);
      } else {
          onAdd(memoToSave);
      }
      setEditingMemo(null);
  };

  const handleToggleComplete = (e: React.MouseEvent, memo: MemoItem) => {
    e.stopPropagation();
    onUpdate({ ...memo, isCompleted: !memo.isCompleted });
  };

  const openNewMemo = () => setEditingMemo({ type: 'EAT', tags: [], isCompleted: false });

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-hitori-bg font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-hitori-text">隨筆</h1>
        <button 
            onClick={openNewMemo}
            className="w-10 h-10 rounded-full bg-hitori-red text-white flex items-center justify-center shadow-lg shadow-hitori-red/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
        {['ALL', 'EAT', 'BUY', 'GO'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
              filter === f
                ? 'bg-hitori-text text-white'
                : 'bg-white border border-hitori-line text-hitori-muted hover:border-hitori-muted'
            }`}
          >
            {f === 'ALL' ? '全部' : f === 'EAT' ? '想吃' : f === 'BUY' ? '想買' : '想去'}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-4 space-y-4">
        {filteredMemos.map((memo) => (
          <div 
            key={memo.id} 
            onClick={() => setEditingMemo(memo)}
            className={`break-inside-avoid bg-white p-4 rounded-xl border transition-all cursor-pointer relative group ${
                memo.isCompleted 
                ? 'border-hitori-line opacity-60' 
                : 'border-hitori-line shadow-sm hover:shadow-md hover:border-hitori-red/20'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] border ${getTypeColor(memo.type, memo.isCompleted)}`}>
                    {getTypeIcon(memo.type)}
                    <span>{memo.type === 'EAT' ? 'FOOD' : memo.type === 'BUY' ? 'SHOP' : 'VISIT'}</span>
                </div>
                
                {/* Completion Toggle */}
                <button 
                    onClick={(e) => handleToggleComplete(e, memo)}
                    className={`text-hitori-muted transition-colors ${memo.isCompleted ? 'text-hitori-red' : 'hover:text-hitori-red opacity-30 group-hover:opacity-100'}`}
                >
                    {memo.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
            </div>
            
            <p className={`text-hitori-text font-medium text-sm mb-3 leading-relaxed ${memo.isCompleted ? 'line-through decoration-hitori-muted/50 text-hitori-muted' : ''}`}>
              {memo.content}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {memo.tags.map(tag => (
                <span key={tag} className="text-[10px] text-hitori-muted/70 bg-hitori-bg px-2 py-0.5 rounded-full border border-hitori-line/50">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        
        <div 
            onClick={openNewMemo}
            className="break-inside-avoid bg-transparent border-2 border-dashed border-hitori-line p-4 rounded-xl flex flex-col items-center justify-center text-hitori-muted/40 h-32 cursor-pointer hover:border-hitori-red/30 hover:text-hitori-red/50 transition-colors"
        >
          <Plus size={16} className="mb-1"/>
          <span className="text-xs">想記錄什麼？</span>
        </div>
      </div>

      {/* Editor Modal */}
      {editingMemo && (
        <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-serif font-bold text-hitori-text">{editingMemo.id ? '編輯隨筆' : '新隨筆'}</h3>
                    <button onClick={() => setEditingMemo(null)} className="text-hitori-muted"><X size={20}/></button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between gap-2">
                        {(['EAT', 'BUY', 'GO'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setEditingMemo({ ...editingMemo, type })}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                                    editingMemo.type === type 
                                    ? 'bg-hitori-red/10 border-hitori-red text-hitori-red' 
                                    : 'bg-white border-hitori-line text-hitori-muted'
                                }`}
                            >
                                {type === 'EAT' ? '想吃' : type === 'BUY' ? '想買' : '想去'}
                            </button>
                        ))}
                    </div>

                    <textarea 
                        value={editingMemo.content || ''}
                        onChange={e => setEditingMemo({ ...editingMemo, content: e.target.value })}
                        placeholder="寫下你的想法..."
                        className="w-full h-32 p-3 bg-hitori-bg rounded-xl border border-hitori-line text-sm text-hitori-text placeholder-hitori-muted/50 focus:outline-none focus:border-hitori-red resize-none selection:bg-hitori-red/20"
                    />

                    <div>
                        <label className="text-xs text-hitori-muted mb-1 block">標籤 (用逗號分隔)</label>
                        <input 
                            type="text"
                            value={editingMemo.tags?.join(', ') || ''}
                            onChange={e => setEditingMemo({ ...editingMemo, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            placeholder="例如：伴手禮, 機場"
                            className="w-full p-2 bg-hitori-bg rounded-lg border border-hitori-line text-sm focus:border-hitori-red outline-none selection:bg-hitori-red/20"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                     {editingMemo.id ? (
                        <button onClick={() => { onDelete(editingMemo.id!); setEditingMemo(null); }} className="text-hitori-muted hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                        </button>
                    ) : <div></div>}
                    <button 
                        onClick={handleSave}
                        disabled={!editingMemo.content}
                        className="px-6 py-2 bg-hitori-text text-white text-xs rounded-full disabled:opacity-50"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MemoView;