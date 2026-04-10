import { Router } from 'express';
import db from '../database/db';
import { AppError } from '../middleware/errorHandler';
import type { POI, ApiResponse } from '../models/types';

const router = Router();

// ── GET /api/pois ─────────────────────────────────────────────────────────────
// Query params: country (MU|MG), category, lang
router.get('/', (req, res) => {
  const { country, category } = req.query;
  let sql = 'SELECT * FROM pois WHERE 1=1';
  const params: Record<string, unknown> = {};

  if (country) { sql += ' AND country = @country'; params.country = country; }
  if (category) { sql += ' AND category = @category'; params.category = category; }
  sql += ' ORDER BY country, name';

  const rows = db.prepare(sql).all(params) as POI[];
  const pois = rows.map(deserializePOI);

  res.json({ success: true, data: pois } satisfies ApiResponse<POI[]>);
});

// ── GET /api/pois/:id ─────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM pois WHERE id = ?').get(req.params.id) as POI | undefined;
  if (!row) throw new AppError(404, 'POI not found');

  const poi = deserializePOI(row);
  const content = db.prepare(
    'SELECT * FROM content_blocks WHERE poi_id = ? ORDER BY lang, type',
  ).all(req.params.id);
  const services = db.prepare(
    'SELECT * FROM nearby_services WHERE poi_id = ? ORDER BY distance_meters',
  ).all(req.params.id);

  res.json({ success: true, data: { poi, content, nearbyServices: services } });
});

function deserializePOI(row: POI): POI {
  return {
    ...row,
    languages: typeof row.languages === 'string'
      ? JSON.parse(row.languages)
      : row.languages,
  };
}

export default router;
