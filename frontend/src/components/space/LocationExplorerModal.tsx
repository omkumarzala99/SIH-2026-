import React, { useState } from 'react';
import { MapPin, Compass, Pickaxe, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOIL_MINES_DATA, MineLocation } from './GlobeCanvas';

interface LocationExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (lat: number, lng: number, mineName?: string, mineId?: string) => void;
  onSelectOnMap: () => void;
  defaultMine?: MineLocation;
}

export const LocationExplorerModal: React.FC<LocationExplorerModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  onSelectOnMap,
  defaultMine = MOIL_MINES_DATA[0]
}) => {
  const [activeTab, setActiveTab] = useState<'coords' | 'mines'>('coords');
  const [lat, setLat] = useState<string>('21.8502');
  const [lng, setLng] = useState<string>('80.2274');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMine, setSelectedMine] = useState<MineLocation>(defaultMine);

  if (!isOpen) return null;

  // Validation: Check if coordinates are within the operational MOIL Manganese Belt
  // Central India Sausar Group: Lat 21.0 - 22.5 N, Lng 78.5 - 81.0 E
  const handleExploreCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    if (latNum < 21.0 || latNum > 22.5 || lngNum < 78.5 || lngNum > 81.0) {
      setErrorMsg(
        'No mining intelligence data is currently available for this location. Operational AI/ML models are active for the Central India MOIL Manganese Concession (Lat: 21.0°–22.5° N, Long: 78.5°–81.0° E).'
      );
      return;
    }

    setErrorMsg(null);
    onConfirmLocation(latNum, lngNum, 'Balaghat Concession (Custom Coordinates)', 'MINE_BALAGHAT_01');
  };

  const handleSelectMine = (mine: MineLocation) => {
    setSelectedMine(mine);
    setLat(mine.lat.toFixed(4));
    setLng(mine.lng.toFixed(4));
    setErrorMsg(null);
    onConfirmLocation(mine.lat, mine.lng, mine.name, mine.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Location Explorer</h2>
              <p className="text-xs text-slate-400">Target a MOIL Manganese extraction concession for AI intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('coords'); setErrorMsg(null); }}
            className={`py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === 'coords'
                ? 'border-amber-500 text-amber-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Enter Coordinates</span>
          </button>
          <button
            onClick={() => { setActiveTab('mines'); setErrorMsg(null); }}
            className={`py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === 'mines'
                ? 'border-amber-500 text-amber-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pickaxe className="w-4 h-4" />
            <span>Select MOIL Mine</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {activeTab === 'coords' ? (
            <form onSubmit={handleExploreCoordinates} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Latitude (°N)
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g. 21.8502"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Longitude (°E)
                  </label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="e.g. 80.2274"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick Preset Coordinates */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 mb-2">Quick Presets (Active Operational Sectors):</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setLat('21.8502'); setLng('80.2274'); setErrorMsg(null); }}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700"
                  >
                    Balaghat (21.85°N, 80.23°E)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLat('21.6836'); setLng('79.7247'); setErrorMsg(null); }}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700"
                  >
                    Tirodi (21.68°N, 79.72°E)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLat('21.5500'); setLng('79.6833'); setErrorMsg(null); }}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700"
                  >
                    Dongri Buzurg (21.55°N, 79.68°E)
                  </button>
                </div>
              </div>

              {/* Error Alert if Out of Bounding Box */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{errorMsg}</span>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => { setLat('21.8502'); setLng('80.2274'); setErrorMsg(null); }}
                        className="text-amber-400 underline font-semibold hover:text-amber-300"
                      >
                        Reset to Balaghat Mine Concession
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onSelectOnMap}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Select on GIS Map</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <span>🚀 Explore Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 mb-2">
                Operational manganese concessions documented in MOIL official gazette:
              </div>
              {MOIL_MINES_DATA.map((mine) => (
                <div
                  key={mine.id}
                  onClick={() => handleSelectMine(mine)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedMine.id === mine.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-amber-400">{mine.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                        {mine.state}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {mine.type} &bull; District: {mine.district}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Lat: {mine.lat.toFixed(4)}°N, Lng: {mine.lng.toFixed(4)}°E
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all">
                    Launch
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
