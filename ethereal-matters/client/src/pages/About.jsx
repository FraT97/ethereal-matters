import { Link } from 'react-router-dom';

const STEPS = [
  { title: 'We visit at night', text: 'Every place looks different after sunset. We walk it in the dark, at the hour your event happens, and note what light is already there.' },
  { title: 'We draw the space', text: 'A short concept with sketches: where people will gather, where the light leads them, what stays dark on purpose.' },
  { title: 'We build on site', text: 'Low-impact rigging, battery or quiet power, cables kept off paths. Setup is planned around the place, not against it.' },
  { title: 'We leave no trace', text: 'Everything comes down the same night or the morning after. The place goes back to the animals and the dark.' },
];

export default function About() {
  return (
    <div className="page about">
      <header className="page-head">
        <h1>Light as a material</h1>
        <p>
          Ethereal Matters is a small collective of friends who make light installations for events.
          The name says what we care about: building spaces out of something you cannot touch.
        </p>
      </header>

      <section className="about-text">
        <p>
          We like working where nature does half of the job. A lake gives you a second sky. A line of
          trees gives you walls and a ceiling. Fog shows the shape of a beam that would otherwise be
          invisible. Our work is to notice those things and add only what is missing.
        </p>
        <p>
          Our palette sits between cyan and green — the colours of water and leaves at night — because
          they feel calm, let people's faces stay visible, and do not fight with the landscape.
        </p>
      </section>

      <section className="process" aria-labelledby="process-title">
        <h2 id="process-title">How a project goes</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta">
        <h2>Bring us to your place</h2>
        <Link className="btn btn-solid" to="/contact">Plan an event with us</Link>
      </section>
    </div>
  );
}
