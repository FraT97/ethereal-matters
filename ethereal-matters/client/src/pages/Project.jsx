import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Scene from '../components/Scene.jsx';
import { getProject } from '../lib/api.js';
import { SETTINGS as PLACE, categoryLabel } from '../lib/labels.js';

export default function Project() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setProject(null);
    setError('');
    getProject(slug)
      .then(setProject)
      .catch((e) => setError(e.status === 404 ? 'missing' : 'failed'));
  }, [slug]);

  if (error === 'missing')
    return (
      <div className="page narrow">
        <h1>This work isn't here</h1>
        <p>It may have been renamed. <Link className="text-link" to="/works">Browse all works</Link></p>
      </div>
    );
  if (error) return <div className="page narrow"><p className="notice">The project could not load. Refresh to try again.</p></div>;
  if (!project) return <div className="page narrow"><p className="notice">Loading…</p></div>;

  return (
    <article className="project">
      <div className="project-hero">
        <Scene project={project} />
      </div>

      <div className="project-body">
        <header>
          <h1>{project.title}</h1>
          <p className="project-summary">{project.summary}</p>
        </header>

        <dl className="facts">
          <div><dt>Event</dt><dd>{project.event || '—'}</dd></div>
          <div><dt>Type</dt><dd>{categoryLabel(project.category)}</dd></div>
          <div><dt>Place</dt><dd>{PLACE[project.setting]}{project.location ? `, ${project.location}` : ''}</dd></div>
          <div><dt>Region</dt><dd>{project.region || '—'}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          {project.techniques?.length > 0 && (
            <div><dt>Light</dt><dd>{project.techniques.join(', ')}</dd></div>
          )}
        </dl>

        <div className="story">
          {project.story?.map((para, i) => <p key={i}>{para}</p>)}
        </div>

        {project.images?.length > 1 && (
          <div className="gallery">
            {project.images.slice(1).map((src) => (
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>

      {project.next && (
        <Link to={`/works/${project.next.slug}`} className="next-project">
          <span>Next work</span>
          <strong>{project.next.title}</strong>
        </Link>
      )}
    </article>
  );
}
