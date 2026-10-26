import { fallbackProjects } from './fallback.js';

// In production the API lives on the same origin. Override with VITE_API_URL if hosted separately.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  // A non-JSON reply means we did not reach our API (static host, proxy error page…)
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    throw new Error('API unreachable');
  }
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = data.fields;
    throw err;
  }
  return data;
}

// filters: { category, setting, technique, year, region } — arrays or strings
function toQuery(filters = {}, extra = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...filters, ...extra })) {
    const val = Array.isArray(v) ? v.join(',') : v;
    if (val !== undefined && val !== '' && val !== null) qs.set(k, val);
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ---- offline fallback (mirrors the server filters) ----
function localFilter(filters = {}) {
  const arr = (v) => (Array.isArray(v) ? v : v ? String(v).split(',') : []);
  const f = {
    category: arr(filters.category),
    setting: arr(filters.setting),
    technique: arr(filters.technique),
    year: arr(filters.year).map(Number),
    region: arr(filters.region),
  };
  return fallbackProjects.filter(
    (p) =>
      (!f.category.length || f.category.includes(p.category)) &&
      (!f.setting.length || f.setting.includes(p.setting)) &&
      (!f.technique.length || p.techniques.some((t) => f.technique.includes(t))) &&
      (!f.year.length || f.year.includes(p.year)) &&
      (!f.region.length || f.region.includes(p.region)) &&
      (!filters.featured || p.featured)
  );
}

export async function getProjects(filters = {}, { page = 1, limit = 9 } = {}) {
  try {
    return await request(`/projects${toQuery(filters, { page, limit })}`);
  } catch (err) {
    if (err.status) throw err;
    const all = localFilter(filters);
    return {
      items: all.slice((page - 1) * limit, page * limit),
      total: all.length,
      page,
      pages: Math.ceil(all.length / limit),
    };
  }
}

export async function getMeta() {
  try {
    return await request('/projects/meta');
  } catch (err) {
    if (err.status) throw err;
    return {
      techniques: [...new Set(fallbackProjects.flatMap((p) => p.techniques))].sort(),
      years: [...new Set(fallbackProjects.map((p) => p.year))].sort((a, b) => b - a),
      regions: [...new Set(fallbackProjects.map((p) => p.region).filter(Boolean))].sort(),
    };
  }
}

export async function getProject(slug) {
  try {
    return await request(`/projects/${slug}`);
  } catch (err) {
    if (err.status) throw err;
    const i = fallbackProjects.findIndex((p) => p.slug === slug);
    if (i === -1) {
      const e = new Error('Project not found');
      e.status = 404;
      throw e;
    }
    const next = fallbackProjects[(i + 1) % fallbackProjects.length];
    return { ...fallbackProjects[i], next };
  }
}

export function sendMessage(body) {
  return request('/contact', { method: 'POST', body: JSON.stringify(body) });
}
