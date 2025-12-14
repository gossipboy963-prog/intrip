import React from 'react';
import { Calendar, BookOpen, ShieldCheck, Smile } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.ITINERARY, icon: Calendar, label: '行程' },
    { view: ViewState.MEMO, icon: BookOpen, label: '隨筆' },
    { view: ViewState.SAFETY, icon: ShieldCheck, label: '安心' },
    { view: ViewState.MOOD, icon: Smile, label: '心晴' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-hitori-bg/90 backdrop-blur-md border-t border-hitori-line pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive ? 'transform -translate-y-1' : ''
              }`}
            >
              <item.icon
                strokeWidth={isActive ? 2 : 1.5}
                size={24}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-hitori-red' : 'text-hitori-muted/70'
                }`}
              />
              <span className={`text-[10px] mt-1 font-sans transition-colors duration-300 ${
                 isActive ? 'text-hitori-red font-medium' : 'text-hitori-muted/50'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;