/**
 * Admin routes — protected by JWT.
 * Full CRUD for beacons, services, POIs and analytics.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth); // all admin routes require auth

// ══════════════════════════════════════════════════════════════════════════════
// BEACONS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/beacons
router.get('/beacons', (_req: AuthRequest, res: Response) => {
  const rows = db.prepare(`
    SELECT b.*, p.name AS poi_name, p.country, p.category
    FROM beacons b
    JOIN pois p ON p.id = b.poi_id
    ORDER BY b.created_at DESC
  `).all();
  res.json({ success: true, data: rows });
});

// POST /api/admin/beacons
router.post('/beacons', (req: AuthRequest, res: Response) => {
  const { uuid, major, minor, poi_id, label, tx_power } = req.body as {
    uuid?: string; major?: number; minor?: number;
    poi_id?: string; label?: string; tx_power?: number;
  };
  if (!uuid || major === undefined || minor === undefined || !poi_id) {
    throw new AppError(400, 'uuid, major, minor et poi_id sont requis');
  }
  const poi = db.prepare('SELECT id FROM pois WHERE id = ?').get(poi_id);
  if (!poi) throw new AppError(404, 'POI introuvable');

  const majorN = Number(major);
  const minorN = Number(minor);
  const id = `${uuid.toUpperCase()}-${String(majorN).padStart(4,'0')}-${String(minorN).padStart(4,'0')}`;

  const exists = db.prepare('SELECT id FROM beacons WHERE id = ?').get(id);
  if (exists) throw new AppError(409, 'Ce beacon existe déjà (UUID+Major+Minor identiques)');

  db.prepare(`
    INSERT INTO beacons (id, uuid, major, minor, poi_id, label, tx_power, active, installed_at, battery_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), 100)
  `).run(id, uuid.toUpperCase(), majorN, minorN, poi_id, label ?? '', tx_power ?? -65);

  const beacon = db.prepare('SELECT * FROM beacons WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: beacon });
});

// PATCH /api/admin/beacons/:id  (activate/deactivate, update label, battery…)
router.patch('/beacons/:id', (req: AuthRequest, res: Response) => {
  const beacon = db.prepare('SELECT * FROM beacons WHERE id = ?').get(req.params.id);
  if (!beacon) throw new AppError(404, 'Beacon introuvable');

  const allowed = ['label', 'tx_power', 'active', 'battery_level', 'installed_at'];
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(req.body as Record<string, unknown>)) {
    if (allowed.includes(k)) { sets.push(`${k} = ?`); vals.push(v); }
  }
  if (sets.length === 0) throw new AppError(400, 'Aucun champ valide fourni');
  vals.push(req.params.id);
  db.prepare(`UPDATE beacons SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

  res.json({ success: true, data: db.prepare('SELECT * FROM beacons WHERE id = ?').get(req.params.id) });
});

// DELETE /api/admin/beacons/:id
router.delete('/beacons/:id', (req: AuthRequest, res: Response) => {
  const r = db.prepare('DELETE FROM beacons WHERE id = ?').run(req.params.id);
  if (r.changes === 0) throw new AppError(404, 'Beacon introuvable');
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/services
router.get('/services', (_req: AuthRequest, res: Response) => {
  const rows = db.prepare(`
    SELECT s.*, p.name AS poi_name, p.country
    FROM nearby_services s
    JOIN pois p ON p.id = s.poi_id
    ORDER BY p.name, s.distance_meters
  `).all();
  res.json({ success: true, data: rows });
});

// POST /api/admin/services
router.post('/services', (req: AuthRequest, res: Response) => {
  const { poi_id, type, name, description, phone, distance_meters, price_range } = req.body as {
    poi_id?: string; type?: string; name?: string; description?: string;
    phone?: string; distance_meters?: number; price_range?: string;
  };
  if (!poi_id || !type || !name) throw new AppError(400, 'poi_id, type et name sont requis');

  const poi = db.prepare('SELECT id FROM pois WHERE id = ?').get(poi_id);
  if (!poi) throw new AppError(404, 'POI introuvable');

  const id = uuidv4();
  db.prepare(`
    INSERT INTO nearby_services (id, poi_id, type, name, description, phone, distance_meters, price_range)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, poi_id, type, name, description ?? '', phone ?? null, distance_meters ?? 0, price_range ?? null);

  res.status(201).json({ success: true, data: db.prepare('SELECT * FROM nearby_services WHERE id = ?').get(id) });
});

// PATCH /api/admin/services/:id
router.patch('/services/:id', (req: AuthRequest, res: Response) => {
  const svc = db.prepare('SELECT id FROM nearby_services WHERE id = ?').get(req.params.id);
  if (!svc) throw new AppError(404, 'Service introuvable');

  const allowed = ['type', 'name', 'description', 'phone', 'distance_meters', 'price_range'];
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(req.body as Record<string, unknown>)) {
    if (allowed.includes(k)) { sets.push(`${k} = ?`); vals.push(v); }
  }
  if (sets.length === 0) throw new AppError(400, 'Aucun champ valide fourni');
  vals.push(req.params.id);
  db.prepare(`UPDATE nearby_services SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

  res.json({ success: true, data: db.prepare('SELECT * FROM nearby_services WHERE id = ?').get(req.params.id) });
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', (req: AuthRequest, res: Response) => {
  const r = db.prepare('DELETE FROM nearby_services WHERE id = ?').run(req.params.id);
  if (r.changes === 0) throw new AppError(404, 'Service introuvable');
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/stats
router.get('/stats', (_req: AuthRequest, res: Response) => {
  const totalPOIs      = (db.prepare('SELECT COUNT(*) as n FROM pois').get() as { n: number }).n;
  const totalBeacons   = (db.prepare('SELECT COUNT(*) as n FROM beacons').get() as { n: number }).n;
  const activeBeacons  = (db.prepare('SELECT COUNT(*) as n FROM beacons WHERE active=1').get() as { n: number }).n;
  const totalServices  = (db.prepare('SELECT COUNT(*) as n FROM nearby_services').get() as { n: number }).n;
  const totalDetections = (db.prepare('SELECT COUNT(*) as n FROM detection_events').get() as { n: number }).n;
  const todayDetections = (db.prepare(
    "SELECT COUNT(*) as n FROM detection_events WHERE date(detected_at) = date('now')"
  ).get() as { n: number }).n;
  const weekDetections = (db.prepare(
    "SELECT COUNT(*) as n FROM detection_events WHERE detected_at >= datetime('now','-7 days')"
  ).get() as { n: number }).n;

  const topPOIs = db.prepare(`
    SELECT p.name, p.country, COUNT(de.id) AS detections
    FROM detection_events de
    JOIN beacons b ON b.id = de.beacon_id
    JOIN pois p ON p.id = b.poi_id
    GROUP BY p.id
    ORDER BY detections DESC
    LIMIT 5
  `).all();

  const recentDetections = db.prepare(`
    SELECT de.detected_at, de.rssi, b.label AS beacon_label, p.name AS poi_name
    FROM detection_events de
    JOIN beacons b ON b.id = de.beacon_id
    JOIN pois p ON p.id = b.poi_id
    ORDER BY de.detected_at DESC
    LIMIT 10
  `).all();

  res.json({
    success: true,
    data: {
      totalPOIs, totalBeacons, activeBeacons, totalServices,
      totalDetections, todayDetections, weekDetections,
      topPOIs, recentDetections,
    },
  });
});

// GET /api/admin/pois  (list for dropdowns)
router.get('/pois', (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT id, name, country, category FROM pois ORDER BY country, name').all();
  res.json({ success: true, data: rows });
});

export default router;
