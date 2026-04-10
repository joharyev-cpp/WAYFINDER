import React, { useEffect, useState, FormEvent } from 'react';
import api from '../api/client';
import type { NearbyService, POI } from '../types';

const SERVICE_TYPES = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'hotel',      label: '🏨 Hôtel' },
  { value: 'taxi',       label: '🚕 Taxi / Transport' },
  { value: 'shop',       label: '🛒 Boutique' },
  { value: 'atm',        label: '🏧 Distributeur ATM' },
  { value: 'pharmacy',   label: '💊 Pharmacie' },
  { value: 'wifi',       label: '📶 Point WiFi' },
];

const TYPE_ICONS: Record<string, string> = {
  restaurant: '🍽️', hotel: '🏨', taxi: '🚕', shop: '🛒',
  atm: '🏧', pharmacy: '💊', wifi: '📶',
};

// ─── Modal ───────────────────────────────────────────────────────────────────
function ServiceModal({
  pois, editing, onClose, onSaved,
}: {
  pois: POI[];
  editing: NearbyService | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [poiId, setPoiId]         = useState(editing?.poi_id ?? pois[0]?.id ?? '');
  const [type, setType]           = useState(editing?.type ?? 'restaurant');
  const [name, setName]           = useState(editing?.name ?? '');
  const [description, setDesc]    = useState(editing?.description ?? '');
  const [phone, setPhone]         = useState(editing?.phone ?? '');
  const [distance, setDistance]   = useState(String(editing?.distance_meters ?? ''));
  const [priceRange, setPriceRange] = useState(editing?.price_range ?? '');
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        poi_id: poiId, type, name, description,
        phone: phone || null,
        distance_meters: Number(distance),
        price_range: priceRange || null,
      };
      if (editing) {
        await api.patch(`/admin/services/${editing.id}`, payload);
      } else {
        await api.post('/admin/services', payload);
      }
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
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? 'Modifier le service' : 'Ajouter un service'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-100 text-gray-500">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Point d'intérêt</label>
            <select className="input" value={poiId} onChange={e => setPoiId(e.target.value)} required>
              {pois.map(p => (
                <option key={p.id} value={p.id}>{p.country === 'MU' ? '🇲🇺' : '🇲🇬'} {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de service</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)} required>
              {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="ex: Restaurant Chez Marie" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea className="input resize-none" rows={2} value={description}
              onChange={e => setDesc(e.target.value)} placeholder="Courte description…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+230 …" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance (m)</label>
              <input className="input" type="number" min="0" value={distance} onChange={e => setDistance(e.target.value)} placeholder="150" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gamme de prix</label>
            <input className="input" value={priceRange} onChange={e => setPriceRange(e.target.value)} placeholder="ex: $$ ou 500–1000 MUR" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Enregistrement…' : editing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [services, setServices] = useState<NearbyService[]>([]);
  const [pois, setPois]         = useState<POI[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<NearbyService | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<NearbyService[]>('/admin/services'),
      api.get<POI[]>('/admin/pois'),
    ]).then(([s, p]) => { setServices(s); setPois(p); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteService = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    await api.delete(`/admin/services/${id}`);
    load();
  };

  const filtered = services.filter(s => {
    const matchType   = filterType === 'all' || s.type === filterType;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.poi_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const groupedByPOI = filtered.reduce<Record<string, NearbyService[]>>((acc, s) => {
    const key = s.poi_name ?? s.poi_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🛎️ Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} service{services.length > 1 ? 's' : ''} enregistrés</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditing(null); setShowModal(true); }}>
          <span>+</span> Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input className="input flex-1 min-w-40" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold ${filterType === 'all' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Tous
          </button>
          {SERVICE_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilterType(t.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold ${filterType === t.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin text-3xl">🔄</div></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🛎️</p>
          <p className="font-semibold">Aucun service trouvé</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedByPOI).map(([poiName, svcs]) => {
            const country = svcs[0]?.country;
            return (
              <div key={poiName}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {country === 'MU' ? '🇲🇺' : country === 'MG' ? '🇲🇬' : '📍'} {poiName}
                </p>
                <div className="space-y-2">
                  {svcs.map(svc => (
                    <div key={svc.id} className="card flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {TYPE_ICONS[svc.type] ?? '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                          <span className="badge bg-gray-100 text-gray-500 text-xs">{svc.distance_meters}m</span>
                          {svc.price_range && <span className="badge bg-amber-50 text-amber-700">{svc.price_range}</span>}
                        </div>
                        {svc.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{svc.description}</p>}
                        {svc.phone && (
                          <a href={`tel:${svc.phone}`} className="text-xs text-brand-500 mt-0.5 flex items-center gap-1 hover:underline">
                            📞 {svc.phone}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => { setEditing(svc); setShowModal(true); }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                          ✏️
                        </button>
                        <button onClick={() => deleteService(svc.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100">
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ServiceModal
          pois={pois}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
