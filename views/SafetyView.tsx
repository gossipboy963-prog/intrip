import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Phone, Copy, Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { SafetyData, SafetyContact } from '../types';

interface SafetyViewProps {
  data: SafetyData;
  onUpdate: (data: SafetyData) => void;
}

const SafetyView: React.FC<SafetyViewProps> = ({ data, onUpdate }) => {
  const [showPassport, setShowPassport] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<'CONTACTS' | 'PASSPORT' | 'ACCOMMODATION' | null>(null);
  
  // Temp state for editing
  const [tempPassport, setTempPassport] = useState(data.passportNumber);
  const [tempAccommodation, setTempAccommodation] = useState(data.accommodation);
  const [tempContact, setTempContact] = useState<Partial<SafetyContact>>({});
  const [isAddingContact, setIsAddingContact] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const SectionHeader = ({ title, icon: Icon, onEdit }: { title: string, icon: any, onEdit: () => void }) => (
    <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 text-hitori-red-muted">
            <Icon size={18} />
            <h2 className="text-sm font-serif font-bold tracking-wide">{title}</h2>
        </div>
        <button onClick={onEdit} className="text-hitori-muted/50 hover:text-hitori-text">
            <Edit2 size={14} />
        </button>
    </div>
  );

  const savePassport = () => {
      onUpdate({ ...data, passportNumber: tempPassport });
      setEditingSection(null);
  };

  const saveAccommodation = () => {
      onUpdate({ ...data, accommodation: tempAccommodation });
      setEditingSection(null);
  };

  const saveContact = () => {
      if (!tempContact.name || !tempContact.phone) return;
      const newContact = {
          id: tempContact.id || Date.now().toString(),
          name: tempContact.name,
          phone: tempContact.phone,
          relation: tempContact.relation || ''
      } as SafetyContact;

      let newContacts = [...data.contacts];
      if (tempContact.id) {
          newContacts = newContacts.map(c => c.id === tempContact.id ? newContact : c);
      } else {
          newContacts.push(newContact);
      }
      onUpdate({ ...data, contacts: newContacts });
      setIsAddingContact(false);
      setTempContact({});
  };

  const deleteContact = (id: string) => {
      onUpdate({ ...data, contacts: data.contacts.filter(c => c.id !== id) });
  };

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-hitori-bg font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-hitori-text mb-2">安心手帳</h1>
        <p className="text-xs text-hitori-muted">重要資料僅儲存於本機，請放心。</p>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl p-6 border border-hitori-line shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-hitori-red/5 rounded-bl-full -mr-4 -mt-4"></div>
        <SectionHeader title="緊急聯絡" icon={Phone} onEdit={() => setIsAddingContact(true)} />
        
        <div className="space-y-4">
          {data.contacts.map(contact => (
              <div key={contact.id} className="flex justify-between items-center border-b border-hitori-line/50 pb-3 last:border-0 last:pb-0 group">
                <div onClick={() => { setTempContact(contact); setIsAddingContact(true); }} className="cursor-pointer flex-1">
                  <p className="text-xs text-hitori-muted mb-0.5">{contact.name}</p>
                  <p className="text-lg font-mono font-medium text-hitori-text">{contact.phone}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <a href={`tel:${contact.phone}`} className="w-10 h-10 rounded-full bg-hitori-red-light text-hitori-red flex items-center justify-center">
                        <Phone size={18} />
                    </a>
                </div>
              </div>
          ))}
          <button onClick={() => { setTempContact({}); setIsAddingContact(true); }} className="w-full py-2 mt-2 text-xs text-hitori-muted/70 hover:text-hitori-red border border-dashed border-hitori-line rounded-lg flex items-center justify-center gap-1">
             <Plus size={14} /> 新增聯絡人
          </button>
        </div>
      </div>

      {/* Passport Data */}
      <div className="bg-white rounded-2xl p-6 border border-hitori-line shadow-sm mb-6">
        <SectionHeader title="護照資料" icon={Lock} onEdit={() => setEditingSection('PASSPORT')} />
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-hitori-muted">護照號碼</p>
                <button onClick={() => setShowPassport(!showPassport)} className="text-hitori-muted">
                    {showPassport ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            <div className="flex items-center justify-between bg-hitori-bg p-3 rounded-lg border border-hitori-line">
              <span className={`font-mono text-lg ${showPassport ? 'text-hitori-text' : 'text-hitori-muted blur-sm select-none'}`}>
                {data.passportNumber || '尚未設定'}
              </span>
              <button onClick={() => handleCopy(data.passportNumber, 'passport')} className="text-hitori-muted hover:text-hitori-red">
                {copied === 'passport' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Address */}
      <div className="bg-white rounded-2xl p-6 border border-hitori-line shadow-sm">
        <SectionHeader title="住宿地址" icon={Lock} onEdit={() => setEditingSection('ACCOMMODATION')} />
        <div>
            <p className="text-xs text-hitori-muted mb-1">{data.accommodation.name || '旅館名稱'}</p>
            <div className="flex items-start justify-between bg-hitori-bg p-3 rounded-lg border border-hitori-line">
              <span className="text-sm text-hitori-text leading-relaxed w-5/6">
                {data.accommodation.address || '尚未設定地址'}
              </span>
              <button onClick={() => handleCopy(data.accommodation.address, 'addr')} className="text-hitori-muted hover:text-hitori-red mt-1">
                {copied === 'addr' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-hitori-muted mt-2 text-right">{data.accommodation.note}</p>
        </div>
      </div>

      {/* Modals */}
      {/* 1. Passport Modal */}
      {editingSection === 'PASSPORT' && (
          <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold mb-4">修改護照號碼</h3>
                  <input type="text" value={tempPassport} onChange={e => setTempPassport(e.target.value)} className="w-full p-2 border border-hitori-line rounded mb-4 font-mono selection:bg-hitori-red/20" />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-xs text-hitori-muted">取消</button>
                      <button onClick={savePassport} className="px-4 py-2 bg-hitori-text text-white text-xs rounded-full">儲存</button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Accommodation Modal */}
      {editingSection === 'ACCOMMODATION' && (
          <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-3">
                  <h3 className="font-bold mb-2">修改住宿資訊</h3>
                  <input type="text" placeholder="旅館名稱" value={tempAccommodation.name} onChange={e => setTempAccommodation({...tempAccommodation, name: e.target.value})} className="w-full p-2 border border-hitori-line rounded text-sm selection:bg-hitori-red/20" />
                  <textarea placeholder="地址" value={tempAccommodation.address} onChange={e => setTempAccommodation({...tempAccommodation, address: e.target.value})} className="w-full p-2 border border-hitori-line rounded text-sm h-20 selection:bg-hitori-red/20" />
                  <input type="text" placeholder="備註 (e.g. check-in time)" value={tempAccommodation.note} onChange={e => setTempAccommodation({...tempAccommodation, note: e.target.value})} className="w-full p-2 border border-hitori-line rounded text-sm selection:bg-hitori-red/20" />
                  
                  <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-xs text-hitori-muted">取消</button>
                      <button onClick={saveAccommodation} className="px-4 py-2 bg-hitori-text text-white text-xs rounded-full">儲存</button>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Contact Modal */}
      {isAddingContact && (
          <div className="fixed inset-0 bg-hitori-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex justify-between">
                     <h3 className="font-bold mb-2">{tempContact.id ? '編輯聯絡人' : '新增聯絡人'}</h3>
                     {tempContact.id && <button onClick={() => {deleteContact(tempContact.id!); setIsAddingContact(false);}} className="text-red-500"><Trash2 size={16}/></button>}
                  </div>
                  <input type="text" placeholder="名稱" value={tempContact.name || ''} onChange={e => setTempContact({...tempContact, name: e.target.value})} className="w-full p-2 border border-hitori-line rounded text-sm selection:bg-hitori-red/20" />
                  <input type="text" placeholder="電話" value={tempContact.phone || ''} onChange={e => setTempContact({...tempContact, phone: e.target.value})} className="w-full p-2 border border-hitori-line rounded text-sm selection:bg-hitori-red/20" />
                  
                  <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => setIsAddingContact(false)} className="px-4 py-2 text-xs text-hitori-muted">取消</button>
                      <button onClick={saveContact} className="px-4 py-2 bg-hitori-text text-white text-xs rounded-full">儲存</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SafetyView;