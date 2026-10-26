import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Where the installation lived: lake, park, forest, urban, indoor
    setting: {
      type: String,
      enum: ['lake', 'park', 'forest', 'urban', 'indoor'],
      required: true,
    },
    // Kind of event, used for the tabs on the works page
    category: {
      type: String,
      enum: ['festival', 'party', 'private', 'public'],
      required: true,
    },
    location: { type: String, trim: true },
    region: { type: String, trim: true }, // country or area, e.g. "Netherlands"
    year: { type: Number, required: true },
    event: { type: String, trim: true }, // festival / party name
    summary: { type: String, required: true }, // one line for the list
    story: [{ type: String }], // paragraphs for the detail page
    techniques: [{ type: String }], // e.g. "Laser", "UV paint", "LED tubes"
    // Real photos: put URLs here. If empty the site draws a generated light scene.
    images: [{ type: String }],
    // Palette used by the generated scene when no photos exist
    hue: { type: String, enum: ['cyan', 'green', 'mixed'], default: 'mixed' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
