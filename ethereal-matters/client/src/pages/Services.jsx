import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import Scene from '../components/Scene.jsx';
import useLightOn from '../lib/useLightOn.js';

// Each service shows a generated light scene until real photos are added (image: '...')
const SERVICES = [
  {
    id: 'installations',
    title: 'Installations',
    line: 'Light objects and environments built for one place.',
    text: 'Floating forms on a lake, lit clearings in a wood, lines drawn through reeds. We design for the place you have, so no two pieces are the same.',
    includes: ['Night-time site visit', 'Concept sketches and a light plan', 'Build, run and take-down'],
    tags: ['LED objects', 'UV', 'Tree-safe rigging'],
    scene: { slug: 'svc-installations', setting: 'lake', hue: 'cyan' },
  },
  {
    id: 'stage',
    title: 'Stage and dance floor',
    line: 'The stage and the field around it, lit as one room.',
    text: 'Lasers, haze and light that follows the music. We extend the stage into the crowd and the trees, so the whole field feels like part of the show.',
    includes: ['Light design for each set', 'Audio-reactive programming', 'Operator on the night'],
    tags: ['Lasers', 'Haze', 'Audio-reactive'],
    scene: { slug: 'svc-stage', setting: 'park', hue: 'mixed' },
  },
  {
    id: 'mapping',
    title: 'Projection mapping',
    line: 'Moving images fitted to walls, tunnels, trees and water.',
    text: 'Visuals made for the shape of the surface: an underpass that becomes a sky, a facade that breathes, a water screen on a lake.',
    includes: ['Surface scan and test night', 'Custom generative visuals', 'Projectors and media server'],
    tags: ['Projection mapping', 'Generative visuals'],
    scene: { slug: 'svc-mapping', setting: 'urban', hue: 'cyan' },
  },
  {
    id: 'private',
    title: 'Private events',
    line: 'Weddings, dinners and parties in gardens and greenhouses.',
    text: 'Quieter light that keeps faces visible and the mood warm. We light the plants, the paths and the table — never the guests in the eyes.',
    includes: ['Garden and venue lighting', 'Silent battery fixtures', 'Setup before guests arrive'],
    tags: ['Spot lighting', 'Sensors'],
    scene: { slug: 'svc-private', setting: 'indoor', hue: 'green' },
  },
  {
    id: 'concept',
    title: 'Concept only',
    line: 'You have a place and an idea, we draw the light.',
    text: 'For organisers with their own crew: we visit after dark and deliver a light concept, sketches and a fixture list your team can build.',
    includes: ['Night visit', 'Concept deck with sketches', 'Fixture and power list'],
    tags: ['Night survey', 'Sketches'],
    scene: { slug: 'svc-concept', setting: 'forest', hue: 'green' },
  },
];

const STEPS = [
  { title: 'We visit at night', text: 'We walk your place in the dark, at the hour your event happens, and note what light is already there.' },
  { title: 'We draw the space', text: 'Sketches of where people will gather, where light leads them and what stays dark on purpose.' },
  { title: 'We build on site', text: 'Low-impact rigging, quiet power, cables off the paths. Planned around the place, not against it.' },
  { title: 'We leave no trace', text: 'Everything comes down the same night or the morning after. The place goes back to the dark.' },
];

export default function Services() {
  const [open, setOpen] = useState(SERVICES[0].id);
  const root = useRef(null);
  useLightOn(root, '.svc, .step');

  return (
    <div className="page services" ref={root}>
      <header className="page-head">
        <h1>Services</h1>
        <p>From a single lit tree to a whole festival site. Every project starts with a visit after dark.</p>
      </header>

      <ul className="svc-list">
        {SERVICES.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className={`svc ${isOpen ? 'is-open' : ''}`}>
              <h2>
                <button
                  className="svc-head"
                  aria-expanded={isOpen}
                  aria-controls={`svc-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                >
                  <span className="svc-lamp" aria-hidden="true" />
                  <span className="svc-title">{s.title}</span>
                  <span className="svc-line">{s.line}</span>
                  <span className="svc-icon" aria-hidden="true" />
                </button>
              </h2>
              <div className="svc-body" id={`svc-${s.id}`} role="region" aria-label={s.title} hidden={!isOpen}>
                <div className="svc-media">
                  <Scene project={{ ...s.scene, title: s.title, images: s.image ? [s.image] : [] }} />
                </div>
                <div className="svc-detail">
                  <p>{s.text}</p>
                  <h3>What's included</h3>
                  <ul className="svc-includes">
                    {s.includes.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                  <ul className="tag-list">
                    {s.tags.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <Link className="btn btn-solid" to={`/contact?service=${s.id}`}>Ask about {s.title.toLowerCase()}</Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="steps" aria-labelledby="steps-title">
        <h2 id="steps-title">How a project goes</h2>
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title} className="step" style={{ '--i': i }}>
              <span className="step-dot" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta">
        <h2>Tell us about your place</h2>
        <Link className="btn btn-solid" to="/contact">Plan an event with us</Link>
      </section>
    </div>
  );
}
