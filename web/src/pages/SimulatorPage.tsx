/**
 * SimulatorPage — reproduces exactly what a smartphone sees when it detects
 * a beacon. Enter any beacon ID and preview the triggered content.
 */

import React, { useState, FormEvent } from 'react';
import api from '../api/client';
import type { BeaconContent, Beacon } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  nature:    'bg-green-500',  culture:   'bg-purple-500',
  beach:     'bg-blue-400',   museum:    'bg-orange-500',
  park:      'bg-emerald-500',market:    'bg-yellow-500',
  viewpoint: 'bg-cyan-500',   restaurant:'bg-red-500',
  hotel:     'bg-indigo-500', transport: 'bg-gray-500',
};

const TYPE_ICONS: Record<string, string> = {
  history: '📜', tip: '💡', text: '📄', promo: '🎟️',
};
const SERVICE_ICONS: Record<string, string> = {
  restaurant: '🍽️', hotel: '🏨', taxi: '🚕', shop: '🛒',
  atm: '🏧', pharmacy: '💊', wifi: '📶',
};

// Quick-pick beacons
const QUICK_PICKS = [
  { label: '🇲🇺 Chamarel 7 couleurs',    id: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0001-0001' },
  { label: '🇲🇺 Chutes de Chamarel',      id: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0001-0002' },
  { label: '🇲🇺 Blue Penny Museum',       id: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0003-0001' },
  { label: '🇲🇺 Grand Baie',              id: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0005-0001' },
  { label: '🇲🇺 Le Morne (UNESCO)',        id: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0006-0001' },
  { label: '🇲🇬 Avenue des Baobabs',      id: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D-0001-0001' },
  { label: '🇲🇬 Isalo',                   id: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D-0002-0001' },
  { label: '🇲🇬 Tsingy de Bemaraha',      id: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D-0004-0001' },
];

export default function SimulatorPage() {
  const [beaconId, setBeaconId]   = useState('');
  const [lang, setLang]           = useState('fr');
  const [rssi, setRssi]           = useState('-65');
  const [result, setResult]       = useState<BeaconContent | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const simulate = async (id?: string) => {
    const target = (id ?? beaconId).trim();
    if (!target) return;
    setBeaconId(target);
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.get<BeaconContent>(`/beacon/${encodeURIComponent(target)}?lang=${lang}`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); simulate(); };

  const dist = () => {
    const r = Number(rssi);
    if (r === 0) return '—';
    const ratio = r / -65;
    const d = ratio < 1 ? Math.pow(ratio, 10) : 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    return `~${Math.round(d * 10) / 10} m`;
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">🔍 Simulateur BLE</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reproduit ce que voit le smartphone quand il détecte un beacon.
        </p>
      </div>

      {/* Form */}
      <div className="card mb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ID du beacon</label>
            <input
              className="input font-mono text-xs"
              value={beaconId}
              onChange={e => setBeaconId(e.target.value)}
              placeholder="UUID-MAJOR-MINOR  ex: FDA50693-…-0001-0001"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
              <select className="input" value={lang} onChange={e => setLang(e.target.value)}>
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="mg">🇲🇬 Malagasy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                RSSI simulé : <span className="text-brand-500 font-mono">{rssi} dBm</span>
              </label>
              <input type="range" className="w-full accent-brand-500" min="-100" max="-30"
                value={rssi} onChange={e => setRssi(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Distance estimée : {dist()}</p>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '⏳ Simulation en cours…' : '▶ Simuler la détection'}
          </button>
        </form>

        {/* Quick picks */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tester rapidement</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PICKS.map(qp => (
              <button key={qp.id}
                onClick={() => simulate(qp.id)}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-colors font-medium">
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-4 text-sm mb-5">
          ⚠️ {error}
        </div>
      )}

      {/* Result — mock smartphone screen */}
      {result && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">📱 Aperçu — écran smartphone</p>

          {/* Phone frame */}
          <div className="relative max-w-sm mx-auto">
            <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden" style={{ maxHeight: 680, overflowY: 'auto' }}>

                {/* Hero */}
                <div className={`${CATEGORY_COLORS[result.poi.category] ?? 'bg-brand-500'} px-5 pt-10 pb-6 relative`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10">
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase">
                      {result.poi.category}
                    </span>
                    <h2 className="text-white text-xl font-extrabold leading-tight">{result.poi.name}</h2>
                    <p className="text-white/80 text-xs mt-1">{result.poi.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-white/90 text-xs">
                        {result.beacon.country === 'MU' ? '🇲🇺 Île Maurice' : '🇲🇬 Madagascar'}
                      </span>
                      <span className="text-white/90 text-xs">📡 {dist()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Info chips */}
                  <div className="flex gap-2 flex-wrap">
                    {result.poi.openingHours && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                        🕐 {result.poi.openingHours}
                      </span>
                    )}
                    {result.poi.entryFee && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                        🎟️ {result.poi.entryFee}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">{result.poi.description}</p>

                  {/* Content blocks */}
                  {result.content.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Guide</p>
                      <div className="space-y-2">
                        {result.content.map(block => (
                          <div key={block.id} className="bg-gray-50 rounded-2xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{TYPE_ICONS[block.type] ?? '📄'}</span>
                              <p className="text-xs font-bold text-gray-700">{block.title}</p>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{block.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nearby services */}
                  {result.nearbyServices.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">À proximité</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {result.nearbyServices.map(svc => (
                          <div key={svc.id} className="shrink-0 bg-white border border-gray-100 rounded-2xl p-3 w-32 shadow-sm">
                            <div className="text-2xl mb-2">{SERVICE_ICONS[svc.type] ?? '📍'}</div>
                            <p className="text-xs font-semibold text-gray-800 leading-tight">{svc.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{svc.distance_meters}m</p>
                            {svc.price_range && <p className="text-xs text-amber-600 font-medium">{svc.price_range}</p>}
                            {svc.phone && (
                              <p className="text-xs text-brand-500 mt-1">📞 {svc.phone}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Phone notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
          </div>

          {/* Raw beacon info */}
          <div className="mt-5 card">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Données brutes beacon</p>
            <div className="space-y-1.5 font-mono text-xs text-gray-600">
              <p><span className="text-gray-400 w-24 inline-block">ID</span>{result.beacon.id}</p>
              <p><span className="text-gray-400 w-24 inline-block">UUID</span>{result.beacon.uuid}</p>
              <p><span className="text-gray-400 w-24 inline-block">Major</span>{result.beacon.major}</p>
              <p><span className="text-gray-400 w-24 inline-block">Minor</span>{result.beacon.minor}</p>
              <p><span className="text-gray-400 w-24 inline-block">TX Power</span>{result.beacon.tx_power} dBm</p>
              <p><span className="text-gray-400 w-24 inline-block">RSSI simulé</span>{rssi} dBm</p>
              <p><span className="text-gray-400 w-24 inline-block">Distance</span>{dist()}</p>
              <p><span className="text-gray-400 w-24 inline-block">POI ID</span>{result.poi.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
