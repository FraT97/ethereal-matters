import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Scene from './Scene.jsx';
import { getMeta, getProjects } from '../lib/api.js';
import { CATEGORIES, SETTINGS, categoryLabel } from '../lib/labels.js';

const PAGE = 9;
const GROUPS = ['setting', 'technique', 'region', 'year'];
const GROUP_TITLES = { setting: 'Place', technique: 'Light', region: 'Region', year: 'Year' };

// Reads/writes filters in the URL so filtered views can be shared:
// ?category=festival&setting=lake,forest&view=list
export default function WorksExplorer() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const filters = useMemo(() => {
    const f = {};
    for (const g of GROUPS) f[g] = params.get(g) ? params.get(g).split(',') : [];
    return f;
  }, [params]);
  const activeCount = GROUPS.reduce((n, g) => n + filters[g].length, 0);

  const [meta, setMeta] = useState({ techniques: [], years: [], regions: [] });
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    getMeta().then(setMeta).catch(() => {});
  }, []);

  // reload from page 1 whenever the filters change
  const key = params.toString();
  useEffect(() => {
    setLoading(true);
    setError('');
    getProjects({ category, ...filters }, { page: 1, limit: PAGE })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setPage(1);
        setPages(r.pages);
      })
      .catch(() => setError('The works could not load. Refresh the page to try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function showMore() {
    setLoading(true);
    getProjects({ category, ...filters }, { page: page + 1, limit: PAGE })
      .then((r) => {
        setItems((prev) => [...prev, ...r.items]);
        setPage(r.page);
      })
      .finally(() => setLoading(false));
  }

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      const val = Array.isArray(v) ? v.join(',') : v;
      if (val) next.set(k, val);
      else next.delete(k);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  }

  const toggle = (group, value) => {
    const cur = filters[group];
    update({ [group]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  };
  const resetAll = () => update(Object.fromEntries(GROUPS.map((g) => [g, ''])));

  const options = {
    setting: Object.entries(SETTINGS).map(([value, label]) => ({ value, label })),
    technique: meta.techniques.map((t) => ({ value: t, label: t })),
    region: meta.regions.map((r) => ({ value: r, label: r })),
    year: meta.years.map((y) => ({ value: String(y), label: String(y) })),
  };
  const labelFor = (g, v) => options[g].find((o) => o.value === v)?.label || v;

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  return (
    <section className="explorer" id="works" aria-labelledby="works-title">
      <h2 id="works-title" className="sr-only">Works</h2>

      <div className="explorer-bar">
        <div className="tabs" role="tablist" aria-label="Kind of event">
          {[{ key: '', label: 'All works' }, ...CATEGORIES].map((c) => (
            <button
              key={c.key || 'all'}
              role="tab"
              aria-selected={category === c.key}
              className={category === c.key ? 'active' : ''}
              onClick={() => update({ category: c.key })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="explorer-tools">
          <span className="explorer-count">Works: {loading && !items.length ? '…' : total}</span>
          <button className="tool-btn" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="filter-drawer">
            Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
          <div className="view-toggle" role="group" aria-label="Layout">
            <button aria-pressed={view === 'grid'} onClick={() => update({ view: '' })} title="Grid">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" /></svg>
              <span className="sr-only">Grid</span>
            </button>
            <button aria-pressed={view === 'list'} onClick={() => update({ view: 'list' })} title="List">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 2h14v2H1zM1 7h14v2H1zM1 12h14v2H1z" /></svg>
              <span className="sr-only">List</span>
            </button>
          </div>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="chips">
          {GROUPS.flatMap((g) =>
            filters[g].map((v) => (
              <button key={g + v} className="chip" onClick={() => toggle(g, v)} aria-label={`Remove filter ${labelFor(g, v)}`}>
                {labelFor(g, v)} <span aria-hidden="true">×</span>
              </button>
            ))
          )}
          <button className="link-btn" onClick={resetAll}>Reset all</button>
        </div>
      )}

      {error && <p className="notice">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <p>No works match these filters.</p>
          <button className="btn" onClick={() => setParams({}, { replace: true })}>Show all works</button>
        </div>
      )}

      {view === 'grid' ? (
        <ul className="grid">
          {items.map((p) => (
            <li key={p.slug}>
              <Link to={`/works/${p.slug}`} className="card">
                <div className="card-media"><Scene project={p} /></div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <span className="card-cat">{categoryLabel(p.category)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        items.length > 0 && (
          <div className="table-wrap">
            <table className="works-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Year</th>
                  <th scope="col">Place</th>
                  <th scope="col">Light</th>
                  <th scope="col">Region</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.slug}>
                    <td>
                      <Link to={`/works/${p.slug}`}>
                        <span className="row-thumb"><Scene project={p} /></span>
                        <span>
                          <strong>{p.title}</strong>
                          <small>{p.summary}</small>
                        </span>
                      </Link>
                    </td>
                    <td>{p.year}</td>
                    <td>{SETTINGS[p.setting]}</td>
                    <td>{p.techniques.join(', ')}</td>
                    <td>{p.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {page < pages && (
        <div className="more">
          <button className="btn" onClick={showMore} disabled={loading}>
            {loading ? 'Loading…' : 'Show more'}
          </button>
          <span>{items.length} / {total}</span>
        </div>
      )}

      {/* Filter drawer */}
      <div className={`drawer-backdrop ${drawer ? 'open' : ''}`} onClick={() => setDrawer(false)} />
      <aside
        id="filter-drawer"
        className={`drawer ${drawer ? 'open' : ''}`}
        aria-label="Filters"
        aria-hidden={!drawer}
        inert={drawer ? undefined : ''}
      >
        <div className="drawer-head">
          <h2>Filters</h2>
          <button className="tool-btn" onClick={() => setDrawer(false)}>Close</button>
        </div>
        {GROUPS.map((g) => (
          <fieldset key={g}>
            <legend>{GROUP_TITLES[g]}</legend>
            <div className="option-list">
              {options[g].map((o) => (
                <label key={o.value} className={filters[g].includes(o.value) ? 'checked' : ''}>
                  <input type="checkbox" checked={filters[g].includes(o.value)} onChange={() => toggle(g, o.value)} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="drawer-foot">
          <button className="btn" onClick={resetAll} disabled={!activeCount}>Reset all</button>
          <button className="btn btn-solid" onClick={() => setDrawer(false)}>
            Show {total} {total === 1 ? 'work' : 'works'}
          </button>
        </div>
      </aside>
    </section>
  );
}
