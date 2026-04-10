import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { Stats } from '../types';

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }  = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin text-4xl">🔄</div>
    </div>
  );

  if (error) return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Bonjour, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre réseau de beacons</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon="📍" label="Points d'intérêt" value={stats?.totalPOIs ?? 0}        color="bg-purple-50" />
        <StatCard icon="📡" label="Beacons actifs"   value={stats?.activeBeacons ?? 0}     sub={`sur ${stats?.totalBeacons ?? 0} total`} color="bg-blue-50" />
        <StatCard icon="🛎️" label="Services"         value={stats?.totalServices ?? 0}     color="bg-green-50" />
        <StatCard icon="👀" label="Détections"        value={stats?.totalDetections ?? 0}   sub={`${stats?.todayDetections ?? 0} aujourd'hui`} color="bg-orange-50" />
      </div>

      {/* Détections semaine */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-800">Cette semaine</p>
          <span className="badge bg-blue-100 text-blue-700">{stats?.weekDetections ?? 0} détections</span>
        </div>
        <p className="text-xs text-gray-400">7 derniers jours</p>
      </div>

      {/* Top POIs */}
      {(stats?.topPOIs?.length ?? 0) > 0 && (
        <div className="card mb-4">
          <p className="font-semibold text-gray-800 mb-3">🏆 Sites les plus visités</p>
          <div className="space-y-2">
            {stats!.topPOIs.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full text-xs font-bold flex items-center justify-center text-gray-500">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.country === 'MU' ? '🇲🇺 Maurice' : '🇲🇬 Madagascar'}</p>
                </div>
                <span className="badge bg-gray-100 text-gray-600">{p.detections}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activité récente */}
      {(stats?.recentDetections?.length ?? 0) > 0 && (
        <div className="card mb-4">
          <p className="font-semibold text-gray-800 mb-3">🕐 Activité récente</p>
          <div className="space-y-2">
            {stats!.recentDetections.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-sm">📡</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.poi_name}</p>
                  <p className="text-xs text-gray-400">{d.beacon_label} · RSSI {d.rssi} dBm</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(d.detected_at).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/beacons" className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
          <span className="text-2xl">📡</span>
          <div>
            <p className="font-semibold text-sm text-gray-900">Gérer les beacons</p>
            <p className="text-xs text-gray-400">Ajouter, activer, désactiver</p>
          </div>
        </Link>
        <Link to="/services" className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
          <span className="text-2xl">🛎️</span>
          <div>
            <p className="font-semibold text-sm text-gray-900">Gérer les services</p>
            <p className="text-xs text-gray-400">Restaurants, taxis, hotels…</p>
          </div>
        </Link>
        <Link to="/simulator" className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer col-span-2">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="font-semibold text-sm text-gray-900">Simulateur de beacon</p>
            <p className="text-xs text-gray-400">Tester le contenu déclenché sans smartphone</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
