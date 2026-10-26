import { Link } from 'react-router-dom';

const SERVICES = [
  {
    title: 'Installations',
    text: 'Light objects and environments built for one place: floating forms on a lake, lit clearings in a wood, lines drawn through reeds.',
    tags: ['LED objects', 'UV', 'Tree-safe rigging'],
  },
  {
    title: 'Stage and dance floor design',
    text: 'Lighting for the stage and the space around it, so the whole field feels like one room rather than a stage and a crowd.',
    tags: ['Lasers', 'Haze', 'Audio-reactive'],
  },
  {
    title: 'Projection mapping',
    text: 'Moving images fitted to walls, tunnels, trees and water screens, with visuals made for the shape of the surface.',
    tags: ['Projection mapping', 'Generative visuals'],
  },
  {
    title: 'Light for private events',
    text: 'Weddings, dinners and parties in gardens, greenhouses and estates — quieter light that keeps faces visible.',
    tags: ['Spot lighting', 'Sensors'],
  },
  {
    title: 'Concept and site visits',
    text: 'If you have a place but no plan yet, we visit after dark and come back with sketches and a budget.',
    tags: ['Night survey', 'Sketches', 'Budget'],
  },
];

export default function Services() {
  return (
    <div className="page services">
      <header className="page-head">
        <h1>Services</h1>
        <p>From a single lit tree to a full festival site. Every project starts with a night visit.</p>
      </header>

      <ul className="service-list">
        {SERVICES.map((s) => (
          <li key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <ul className="tag-list">
              {s.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <section className="cta">
        <h2>Tell us about your place</h2>
        <Link className="btn btn-solid" to="/contact">Contact us</Link>
      </section>
    </div>
  );
}
