import React from 'react';
import { MapPin, Navigation, Coffee, Store, Train, Heart } from 'lucide-react';

const MapView: React.FC = () => {
  // Mock nearby places
  const nearby = [
    { id: 1, name: 'Blue Bottle Coffee', type: 'Cafe', dist: '120m', icon: Coffee },
    { id: 2, name: 'FamilyMart', type: 'Mart', dist: '50m', icon: Store },
    { id: 3, name: 'Sanjo Station', type: 'Train', dist: '300m', icon: Train },
  ];

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-hitori-bg font-sans flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-hitori-text mb-2">周邊探索</h1>
        <p className="text-xs text-hitori-muted">不需要去遠方，附近就有美好。</p>
      </div>

      {/* Radar Visual - Abstract Map */}
      <div className="relative w-full aspect-square bg-white rounded-full border border-hitori-line shadow-inner mb-8 flex items-center justify-center overflow-hidden">
        {/* Radar circles */}
        <div className="absolute w-3/4 h-3/4 border border-hitori-line/50 rounded-full animate-pulse"></div>
        <div className="absolute w-1/2 h-1/2 border border-hitori-line/50 rounded-full"></div>
        
        {/* Me */}
        <div className="relative z-10 w-4 h-4 bg-hitori-red rounded-full shadow-[0_0_0_4px_rgba(136,19,55,0.1)]">
            <div className="absolute -inset-8 bg-hitori-red/5 rounded-full animate-ping"></div>
        </div>

        {/* Mock dots */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-stone-300 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-stone-300 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-stone-300 rounded-full"></div>

        <div className="absolute bottom-6 text-[10px] text-hitori-muted/60 font-mono">
          Current Location: Kyoto
        </div>
      </div>

      {/* Nearby List */}
      <div className="flex-1">
        <h2 className="text-sm font-bold text-hitori-text mb-4 pl-1">步行 5 分鐘內</h2>
        <div className="space-y-3">
          {nearby.map((place) => (
            <div key={place.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-hitori-line shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-hitori-bg flex items-center justify-center text-hitori-text">
                  <place.icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-hitori-text">{place.name}</h3>
                  <p className="text-[10px] text-hitori-muted">{place.dist} • {place.type}</p>
                </div>
              </div>
              <button className="p-2 text-hitori-muted hover:text-hitori-red transition-colors">
                <Heart size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;