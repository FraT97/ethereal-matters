import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Scene from '../components/Scene.jsx';
import { sendMessage } from '../lib/api.js';
import { SETTINGS } from '../lib/labels.js';

// A four-step enquiry. Each step switches on one lamp; the sentence at the top
// writes itself from the answers, and the place picker previews the setting at night.

const EVENTS = [
  { value: 'Festival', icon: <path d="M6 38 24 10l18 28M14 38l10-15 10 15" /> },
  { value: 'Party', icon: <><circle cx="24" cy="18" r="8" /><path d="M24 26v14M14 40h20M10 8l4 4M38 8l-4 4" /></> },
  { value: 'Wedding', icon: <><circle cx="18" cy="26" r="9" /><circle cx="30" cy="26" r="9" /></> },
  { value: 'Private event', icon: <path d="M8 22 24 10l16 12v18H8zM20 40V28h8v12" /> },
  { value: 'Something else', icon: <><circle cx="24" cy="24" r="14" /><path d="M20 20a4 4 0 1 1 5 4c-1 .5-1 1.5-1 3M24 32v.5" /></> },
];

const SETTING_PHRASE = { lake: 'by the water', forest: 'in the woods', park: 'in a park', urban: 'in the city', indoor: 'indoors' };
const GUESTS = ['20', '50', '100', '250', '500', '1,000', '2,500', '5,000+'];
const SERVICES = { installations: 'an installation', stage: 'stage lighting', mapping: 'projection mapping', private: 'private-event lighting', concept: 'a light concept' };
const STEP_NAMES = ['Event', 'Place', 'Date', 'You'];

const EMPTY = { eventType: '', setting: '', place: '', eventDate: '', guests: 3, name: '', email: '', message: '', website: '' };

export default function Contact() {
  const [params] = useSearchParams();
  const service = params.get('service') || '';
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0); // furthest step visited
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const stepRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const valid = [!!form.eventType, !!form.setting, true, form.name.trim() && emailOk && form.message.trim()];

  // move focus to the new step's heading so keyboard and screen-reader users follow along
  useEffect(() => {
    if (status === 'idle') stepRef.current?.querySelector('h2')?.focus({ preventScroll: true });
    if (status === 'sent') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, status]);

  const summary = useMemo(() => {
    const parts = [];
    const ev = form.eventType && form.eventType !== 'Something else' ? form.eventType.toLowerCase() : 'night';
    parts.push(`A ${ev}`);
    if (form.setting) parts.push(SETTING_PHRASE[form.setting]);
    if (form.place) parts.push(`at ${form.place}`);
    if (reached >= 2) parts.push(`for about ${GUESTS[form.guests]} people`);
    if (form.eventDate) {
      const d = new Date(form.eventDate + 'T12:00');
      parts.push(`on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    }
    let s = parts.join(' ');
    if (service && SERVICES[service]) s += `, with ${SERVICES[service]}`;
    return s + '.';
  }, [form, reached, service]);

  function next() {
    setTouched(true);
    if (!valid[step]) return;
    setTouched(false);
    const n = Math.min(step + 1, 3);
    setStep(n);
    setReached((r) => Math.max(r, n));
  }

  async function submit(e) {
    e.preventDefault();
    if (step < 3) return next();
    setTouched(true);
    if (!valid[3]) return;
    setStatus('sending');
    setError('');
    try {
      await sendMessage({
        ...form,
        guests: GUESTS[form.guests],
        setting: form.setting,
        service,
        message: `${form.message}\n\n— ${summary}`,
      });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(
        err.status === 429
          ? 'Too many messages from this connection. Try again in 15 minutes, or email hello@etherealmatters.com.'
          : err.status === 400
          ? 'Check your name, email and message, then send again.'
          : 'The message did not send. Try again, or email hello@etherealmatters.com.'
      );
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
      e.preventDefault();
      step < 3 ? next() : submit(e);
    }
  };

  if (status === 'sent') {
    return (
      <div className="page contact contact-sent">
        <Lamps step={4} reached={4} onPick={() => {}} />
        <h1 className="neon-word">Message sent</h1>
        <p className="contact-summary">{summary}</p>
        <p>Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. We'll reply within a few days — usually with questions about the place.</p>
        <button
          className="btn"
          onClick={() => {
            setForm(EMPTY);
            setStep(0);
            setReached(0);
            setStatus('idle');
          }}
        >
          Plan another event
        </button>
      </div>
    );
  }

  const showErr = (cond) => touched && cond;

  return (
    <div className="page contact">
      <header className="page-head">
        <h1>Plan an event with us</h1>
        <p className="contact-summary" aria-live="polite">{summary}</p>
      </header>

      <Lamps step={step} reached={reached} onPick={(i) => i <= reached && setStep(i)} />

      <form className="wizard" onSubmit={submit} onKeyDown={onKeyDown} noValidate>
        <div className="wizard-step" key={step} ref={stepRef}>
          {step === 0 && (
            <fieldset aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1}>What are you planning?</h2>
              <div className="choice-grid">
                {EVENTS.map((ev) => (
                  <label key={ev.value} className={`choice ${form.eventType === ev.value ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="eventType"
                      value={ev.value}
                      checked={form.eventType === ev.value}
                      onChange={() => set('eventType', ev.value)}
                    />
                    <svg viewBox="0 0 48 48" aria-hidden="true">{ev.icon}</svg>
                    <span>{ev.value}</span>
                  </label>
                ))}
              </div>
              {showErr(!valid[0]) && <p className="field-error" role="alert">Pick the closest one — you can explain more later.</p>}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="place-step" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1}>Where will it happen?</h2>
              <div className="place-grid">
                <div className="place-preview" aria-hidden="true">
                  {form.setting ? (
                    <Scene key={form.setting} project={{ slug: `contact-${form.setting}`, setting: form.setting, hue: 'mixed', title: '' }} />
                  ) : (
                    <div className="place-empty">Pick a place to see it at night</div>
                  )}
                </div>
                <div>
                  <div className="chip-row">
                    {Object.entries(SETTINGS).map(([value, label]) => (
                      <label key={value} className={`chip-choice ${form.setting === value ? 'is-on' : ''}`}>
                        <input type="radio" name="setting" value={value} checked={form.setting === value} onChange={() => set('setting', value)} />
                        {label}
                      </label>
                    ))}
                  </div>
                  {showErr(!valid[1]) && <p className="field-error" role="alert">Choose the kind of place.</p>}
                  <label className="field">
                    <span className="field-label">Name of the place or town <span className="optional">optional</span></span>
                    <input value={form.place} onChange={(e) => set('place', e.target.value)} placeholder="Sloterplas, a farm near Utrecht…" />
                  </label>
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1}>When, and for how many?</h2>
              <div className="date-guests">
                <label className="field">
                  <span className="field-label">Date <span className="optional">optional</span></span>
                  <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                </label>
                <label className="field guests">
                  <span>
                    Guests <output className="guests-out">about {GUESTS[form.guests]}</output>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={GUESTS.length - 1}
                    step="1"
                    value={form.guests}
                    onChange={(e) => set('guests', Number(e.target.value))}
                    style={{ '--fill': `${(form.guests / (GUESTS.length - 1)) * 100}%` }}
                    aria-valuetext={`about ${GUESTS[form.guests]} people`}
                  />
                  <span className="guests-scale" aria-hidden="true">
                    <span>20</span><span>5,000+</span>
                  </span>
                </label>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1}>Who should we answer?</h2>
              <div className="you-grid">
                <label className="field">
                  Your name
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={showErr(!form.name.trim())} />
                </label>
                <label className="field">
                  Email
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" aria-invalid={showErr(!emailOk)} />
                </label>
                <label className="field wide">
                  Anything else we should know?
                  <textarea
                    rows="5"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="The mood you want, the music, what the place looks like by day…"
                    aria-invalid={showErr(!form.message.trim())}
                  />
                </label>
                <label className="hp" aria-hidden="true">
                  Website <input tabIndex="-1" autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
                </label>
              </div>
              {showErr(!valid[3]) && <p className="field-error" role="alert">Add your name, a valid email and a few words about the event.</p>}
              {error && <p className="field-error" role="alert">{error}</p>}
            </fieldset>
          )}
        </div>

        <div className="wizard-nav">
          {step > 0 && (
            <button type="button" className="btn" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="btn btn-solid" onClick={next}>
              Next: {STEP_NAMES[step + 1]}
            </button>
          ) : (
            <button type="submit" className="btn btn-solid" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Progress as a row of lamps: done = lit, current = glowing, later = off
function Lamps({ step, reached, onPick }) {
  return (
    <ol className="lamps" aria-label="Steps">
      {STEP_NAMES.map((name, i) => {
        const state = i < step || step === 4 ? 'done' : i === step ? 'current' : 'off';
        return (
          <li key={name} className={`lamp lamp-${state}`}>
            <button type="button" onClick={() => onPick(i)} disabled={i > reached || step === 4} aria-current={i === step ? 'step' : undefined}>
              <span className="lamp-bulb" aria-hidden="true" />
              <span className="lamp-name">{name}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
