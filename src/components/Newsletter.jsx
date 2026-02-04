import { useState } from 'react';
import './Newsletter.css';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('subscribing');

    try {
      const response = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          // Add your Buttondown API key in the metadata or use their embed form
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="newsletter">
      <h2>Stay tuned</h2>
      <p>Subscribe to get notified whenever I post new ambiences.</p>

      <form
        action="https://buttondown.email/api/emails/embed-subscribe/august_dominik"
        method="post"
        target="popupwindow"
        onSubmit={(e) => {
          window.open('https://buttondown.email/august_dominik', 'popupwindow');
        }}
        className="newsletter-form"
      >
        <input
          type="text"
          name="metadata__name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="newsletter-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="newsletter-input"
        />
        <button type="submit" className="newsletter-button">
          Subscribe
        </button>
      </form>

      {status === 'success' && (
        <p className="newsletter-message success">Thanks for subscribing!</p>
      )}
      {status === 'error' && (
        <p className="newsletter-message error">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}

export default Newsletter;
