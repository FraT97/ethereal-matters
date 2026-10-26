import { useState } from 'react';
import { sendMessage } from '../lib/api.js';

const EMPTY = { name: '', email: '', eventType: '', eventDate: '', place: '', message: '', website: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [badFields, setBadFields] = useState([]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    setBadFields([]);
    try {
      await sendMessage(form);
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setBadFields(err.fields || []);
      setError(
        err.status === 400
          ? 'Some fields need a look: check the ones marked below.'
          : err.status === 429
          ? 'Too many messages from this connection. Try again in 15 minutes, or email us directly.'
          : 'The message did not send. Check your connection and try again, or email hello@etherealmatters.com.'
      );
    }
  }

  const invalid = (name) => (badFields.includes(name) ? { 'aria-invalid': true } : {});

  if (status === 'sent')
    return (
      <div className="page narrow contact-done">
        <h1>Message sent</h1>
        <p>Thanks — we'll reply within a few days, usually with questions about the place.</p>
        <button className="btn" onClick={() => setStatus('idle')}>Write another message</button>
      </div>
    );

  return (
    <div className="page contact">
      <header className="page-head">
        <h1>Plan an event with us</h1>
        <p>Tell us where and when. The more we know about the place, the better our first idea will be.</p>
      </header>

      <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
        <label>
          Your name
          <input name="name" value={form.name} onChange={update} required autoComplete="name" {...invalid('name')} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" {...invalid('email')} />
        </label>
        <label>
          Type of event
          <select name="eventType" value={form.eventType} onChange={update}>
            <option value="">Choose one</option>
            <option>Festival</option>
            <option>Party</option>
            <option>Wedding</option>
            <option>Private event</option>
            <option>Something else</option>
          </select>
        </label>
        <label>
          Date
          <input name="eventDate" type="date" value={form.eventDate} onChange={update} />
        </label>
        <label className="wide">
          Where it happens
          <input name="place" value={form.place} onChange={update} placeholder="A lake shore, a park, a courtyard…" />
        </label>
        <label className="wide">
          Tell us about it
          <textarea name="message" rows="6" value={form.message} onChange={update} required {...invalid('message')} />
        </label>
        {/* honeypot, hidden from people */}
        <label className="hp" aria-hidden="true">
          Website <input name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update} />
        </label>

        {error && <p className="form-error wide" role="alert">{error}</p>}

        <button className="btn btn-solid wide" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
