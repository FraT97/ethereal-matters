import { useEffect, useState } from 'react';
import FeaturedSlider from '../components/FeaturedSlider.jsx';
import WorksExplorer from '../components/WorksExplorer.jsx';
import ScrollLitText from '../components/ScrollLitText.jsx';
import { getProjects } from '../lib/api.js';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProjects({ featured: true }, { limit: 6 })
      .then((r) => setFeatured(r.items))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <h1 className="sr-only">Ethereal Matters — light installations</h1>
      <FeaturedSlider projects={featured} />
      <section className="tagline">
        <ScrollLitText text="We shape space with light, out where water, trees and night already are." />
      </section>
      <WorksExplorer />
    </>
  );
}
