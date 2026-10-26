import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Works from './pages/Works.jsx';
import Project from './pages/Project.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import '@fontsource/courier-prime/latin-400.css'; // typewriter font for the whole site, self-hosted
import '@fontsource/courier-prime/latin-700.css';
import '@fontsource/courier-prime/latin-400-italic.css';
import '@fontsource/special-elite/latin-400.css'; // worn typewriter font for the name next to the logo
import '@fontsource/tilt-neon/latin-400.css'; // neon-tube font for the showreel and neon signs
import './styles.css';

function NotFound() {
  return (
    <div className="page narrow">
      <h1>Nothing lit here</h1>
      <p>This page doesn't exist. <Link className="text-link" to="/">Go back to the start</Link></p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="works" element={<Works />} />
          <Route path="works/:slug" element={<Project />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
