import React, { useEffect, useState, FormEvent } from 'react';
import api from '../api/client';
import type { Beacon, POI } from '../types';

// ─── Modal: add beacon ───────────────────────────────────────────────────────
function BeaconModal({
  pois, onClose, onSaved,
}: { pois: POI[]; onClose: () => void; onSaved: () => void }) {
  const [uuid, setUuid]       = useState('FDA50693-A4E2-4FB1-AFCF-C6EB07647825');
  const [major, setMajor]     = useState('');
  const [minor, setMinor]     = useState('');
  const [poiId, setPoiId]     = useState(pois[0]?.id ?? '');
  const [label, setLabel]     = useState('');
  const [txPower, setTxPower] = useState('-65');
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/admin/beacons', {
        uuid, major: Number(major), minor: Number(minor),
        poi_id: poiId, label, tx_power: Number(txPower),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Ajouter un beacon</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">UUID iBeacon</label>
            <input className="input font-mono text-xs" value={uuid} onChange={e => setUuid(e.target.value)} required placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Major</label>
              <input className="input" type="number" min="1" max="65535" value={major}
                onChange={e => setMajor(e.target.value)} required placeholder="ex: 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Minor</label>
              <input className="input" type="number" min="1" max="65535" value={minor}
                onChange={e => setMinor(e.target.value)} required placeholder="ex: 1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Point d'intérêt associé</label>
            <select className="input" value={poiId} onChange={e => setPoiId(e.target.value)} required>
              {pois.map(p => (
                <option key={p.id} value={p.id}>{p.country === 'MU' ? '🇲🇺' : '🇲🇬'} {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Label (emplacement)</label>
            <input className="input" value={label} onChange={e => setLabel(e.target.value)} placeholder="ex: Entrée principale" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">TX Power (dBm @ 1m)</label>
            <input className="input" type="number" value={txPower} onChange={e => setTxPower(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Valeur gravée sur le beacon physique (généralement entre -90 et -50)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Ajouter le beacon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function BeaconsPage() {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [pois, setPois]       = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]   = useState('');
  const [filterCountry, setFilterCountry] = useState<'all' | 'MU' | 'MG'>('all');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<Beacon[]>('/admin/beacons'),
      api.get<POI[]>('/admin/pois'),
    ]).then(([b, p]) => { setBeacons(b); setPois(p); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (beacon: Beacon) => {
    await api.patch(`/admin/beacons/${beacon.id}`, { active: beacon.active ? 0 : 1 });
    load();
  };

  const deleteBeacon = async (id: string) => {
    if (!confirm('Supprimer ce beacon ?')) return;
    await api.delete(`/admin/beacons/${id}`);
    load();
  };

  const filtered = beacons.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      (b.poi_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === 'all' || b.country === filterCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📡 Beacons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{beacons.length} beacon{beacons.length > 1 ? 's' : ''} enregistrés</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <span>+</span> Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input
          className="input flex-1"
          placeholder="Rechercher par ID, label, POI…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {(['all', 'MU', 'MG'] as const).map(c => (
            <button key={c} onClick={() => setFilterCountry(c)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterCountry === c ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c === 'all' ? 'Tous' : c === 'MU' ? '🇲🇺' : '🇲🇬'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin text-3xl">🔄</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📡</p>
          <p className="font-semibold">Aucun beacon trouvé</p>
          <p className="text-sm mt-1">Ajoutez votre premier beacon avec le bouton ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(beacon => (
            <div key={beacon.id} className="card">
              <div className="flex items-start gap-3">
                {/* Status dot */}
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${beacon.active ? 'bg-green-500' : 'bg-gray-300'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{beacon.label || 'Sans label'}</span>
                    <span className={`badge ${beacon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {beacon.active ? '✓ Actif' : '○ Inactif'}
                    </span>
                    <span className="badge bg-gray-100 text-gray-500 font-mono text-xs">
                      M{beacon.major} · m{beacon.minor}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 font-mono truncate">{beacon.id}</p>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      {beacon.country === 'MU' ? '🇲🇺' : '🇲🇬'}
                      {beacon.poi_name}
                    </span>
                    {beacon.battery_level != null && (
                      <span className="text-xs text-gray-400">
                        🔋 {beacon.battery_level}%
                      </span>
                    )}
                    <span className="text-xs text-gray-400">TX {beacon.tx_power} dBm</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(beacon)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      beacon.active
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {beacon.active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => deleteBeacon(beacon.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BeaconModal
          pois={pois}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
