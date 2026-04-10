import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { AppError } from '../middleware/errorHandler';
import type { Beacon, BeaconContentResponse, ApiResponse } from '../models/types';

const router = Router();

// ── GET /api/beacon/:beaconId ─────────────────────────────────────────────────
// Primary mobile endpoint: given a beacon ID return everything the app needs.
// beaconId format: UUID-MAJOR-MINOR  (e.g. FDA50693-...-0001-0001)
// Optional query param: lang (fr|en|mg, default fr)
router.get('/:beaconId', (req, res) => {
  const { beaconId } = req.params;
  const lang = (req.query.lang as string) ?? 'fr';

  const beacon = db.prepare('SELECT * FROM beacons WHERE id = ? AND active = 1').get(beaconId) as Beacon | undefined;
  if (!beacon) throw new AppError(404, `Beacon not found: ${beaconId}`);

  const poi = db.prepare('SELECT * FROM pois WHERE id = ?').get(beacon.poi_id);
  if (!poi) throw new AppError(404, 'POI not found for this beacon');

  // Prefer requested language, fall back to French then English
  const content = db.prepare(`
    SELECT * FROM content_blocks
    WHERE poi_id = ?
    ORDER BY
      CASE lang WHEN ? THEN 0 WHEN 'fr' THEN 1 WHEN 'en' THEN 2 ELSE 3 END,
      type
  `).all(beacon.poi_id, lang);

  const nearbyServices = db.prepare(`
    SELECT * FROM nearby_services WHERE poi_id = ? ORDER BY distance_meters
  `).all(beacon.poi_id);

  const payload: BeaconContentResponse = {
    beacon,
    poi: poi as never,
    content: content as never,
    nearbyServices: nearbyServices as never,
  };

  res.json({ success: true, data: payload } satisfies ApiResponse<BeaconContentResponse>);
});

// ── POST /api/detect ──────────────────────────────────────────────────────────
// Record a beacon detection event (analytics)
// Body: { beaconId, rssi, estimatedDistanceMeters, deviceId }
router.post('/detect', (req, res) => {
  const { beaconId, rssi, estimatedDistanceMeters, deviceId } = req.body as {
    beaconId: string;
    rssi: number;
    estimatedDistanceMeters: number;
    deviceId: string;
  };

  if (!beaconId || !deviceId) {
    throw new AppError(400, 'beaconId and deviceId are required');
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO detection_events (id, beacon_id, rssi, estimated_distance_m, device_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, beaconId, rssi ?? 0, estimatedDistanceMeters ?? 0, deviceId);

  res.status(201).json({ success: true, data: { id } });
});

// ── GET /api/stats ────────────────────────────────────────────────────────────
// Basic analytics for operator dashboard
router.get('/stats/summary', (_req, res) => {
  const totalDetections = (db.prepare('SELECT COUNT(*) as n FROM detection_events').get() as { n: number }).n;
  const todayDetections = (db.prepare(
    "SELECT COUNT(*) as n FROM detection_events WHERE date(detected_at) = date('now')",
  ).get() as { n: number }).n;
  const topBeacons = db.prepare(`
    SELECT b.id, p.name AS poi_name, COUNT(*) AS hits
    FROM detection_events de
    JOIN beacons b ON b.id = de.beacon_id
    JOIN pois p ON p.id = b.poi_id
    GROUP BY b.id
    ORDER BY hits DESC
    LIMIT 10
  `).all();

  res.json({ success: true, data: { totalDetections, todayDetections, topBeacons } });
});

export default router;
