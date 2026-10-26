import { Link } from 'react-router-dom';
import { useRef } from 'react';
import ScrollLitText from '../components/ScrollLitText.jsx';
import useLightOn from '../lib/useLightOn.js';

// Principles, each with a small icon drawn as a line of light
const PRINCIPLES = [
  {
    title: 'Work with the dark',
    text: 'Darkness is half of the design. We decide what stays unlit as carefully as what we light.',
    icon: <path d="M6 30h36M12 30a12 12 0 0 1 24 0" />,
  },
  {
    title: 'Let the place lead',
    text: 'Water, trees, fog and old walls already make a room. We only add what is missing.',
    icon: <path d="M24 40V14M24 22l-8-8M24 28l9-9M10 40h28" />,
  },
  {
    title: 'Light for people',
    text: 'Faces stay visible, nobody gets a beam in the eyes, and there is always a calm corner.',
    icon: <><circle cx="24" cy="17" r="6" /><path d="M12 40c1-8 6-12 12-12s11 4 12 12" /></>,
  },
  {
    title: 'Leave no trace',
    text: 'Tree-safe straps, quiet power, everything packed up by morning. The animals get their night back.',
    icon: <path d="M10 26c6-10 22-10 28 0M14 32h20M19 38h10" />,
  },
];

// Replace with the real crew: name, role, and optionally a photo URL
const TEAM = [
  { name: 'Name Surname', role: 'Light design', hue: 'cyan' },
  { name: 'Name Surname', role: 'Lasers and stage', hue: 'green' },
  { name: 'Name Surname', role: 'Projection and visuals', hue: 'cyan' },
  { name: 'Name Surname', role: 'Production and rigging', hue: 'green' },
];

export default function About() {
  const root = useRef(null);
  useLightOn(root, '.principle, .member');

  return (
    <div className="page about" ref={root}>
      <header className="page-head about-head">
        <h1>About us</h1>
        <ScrollLitText
          className="about-lead"
          text="We are a group of friends who build rooms out of light, for nights outside."
        />
      </header>

      <section className="about-name" aria-labelledby="name-title">
        <h2 id="name-title" className="neon-word">ethereal matters</h2>
        <div className="about-name-text">
          <p>
            Ethereal means light and hard to hold. Matters means material — and what counts.
            Together it is our whole idea: light is something you can build with, even if you can never touch it.
          </p>
          <p>
            We started by lighting parties for friends by a lake. Now we make installations for festivals,
            private events and public nights across the Netherlands and beyond, still mostly outdoors and always after sunset.
          </p>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <h2 id="principles-title">What we care about</h2>
        <ul>
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="principle">
              <svg viewBox="0 0 48 48" aria-hidden="true">{p.icon}</svg>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="team" aria-labelledby="team-title">
        <h2 id="team-title">The crew</h2>
        <ul>
          {TEAM.map((m, i) => (
            <li key={i} className={`member hue-${m.hue}`}>
              <div className="member-orb">
                {m.photo ? <img src={m.photo} alt="" /> : <span aria-hidden="true">{m.name.split(' ').map((w) => w[0]).join('')}</span>}
              </div>
              <h3>{m.name}</h3>
              <p>{m.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta">
        <h2>Bring us to your place</h2>
        <Link className="btn btn-solid" to="/contact">Plan an event with us</Link>
      </section>
    </div>
  );
}
