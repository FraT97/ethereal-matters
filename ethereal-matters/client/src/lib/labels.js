// Display names for values stored in the database
export const CATEGORIES = [
  { key: 'festival', label: 'Festivals' },
  { key: 'party', label: 'Parties' },
  { key: 'private', label: 'Private events' },
  { key: 'public', label: 'Public art' },
];

export const SETTINGS = {
  lake: 'Lake & river',
  forest: 'Woods',
  park: 'Park',
  urban: 'City',
  indoor: 'Indoor',
};

export const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label || key;

// Put the showreel video URL here (mp4, or a Vimeo/YouTube embed URL)
export const SHOWREEL_URL = '';
