import { Router } from 'express';
import Project from '../models/Project.js';

const router = Router();

// Build a Mongo filter from query params. Multiple values are comma separated:
// ?category=festival&setting=lake,park&technique=Laser&year=2025&region=Italy
function buildFilter(q) {
  const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
  const filter = {};
  const set = (field, values, map = (x) => x) => {
    if (values.length) filter[field] = { $in: values.map(map) };
  };
  set('category', list(q.category));
  set('setting', list(q.setting));
  set('techniques', list(q.technique));
  set('region', list(q.region));
  set('year', list(q.year), Number);
  if (q.featured === 'true') filter.featured = true;
  if (q.q) filter.title = { $regex: String(q.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  return filter;
}

// GET /api/projects?…filters…&page=1&limit=9
router.get('/', async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);
    const limit = Math.min(Number(req.query.limit) || 9, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const [items, total] = await Promise.all([
      Project.find(filter)
        .sort({ order: 1, year: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-story -__v')
        .lean(),
      Project.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/meta — values available for the filter panel
router.get('/meta', async (_req, res, next) => {
  try {
    const [techniques, years, regions] = await Promise.all([
      Project.distinct('techniques'),
      Project.distinct('year'),
      Project.distinct('region'),
    ]);
    res.json({
      techniques: techniques.sort(),
      years: years.sort((a, b) => b - a),
      regions: regions.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).select('-__v').lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const all = await Project.find().sort({ order: 1, year: -1 }).select('slug title').lean();
    const i = all.findIndex((p) => p.slug === project.slug);
    const next = all[(i + 1) % all.length];
    res.json({ ...project, next: next.slug !== project.slug ? next : null });
  } catch (err) {
    next(err);
  }
});

export default router;
