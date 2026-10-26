import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    eventType: { type: String, trim: true, maxlength: 80 },
    eventDate: { type: String, trim: true, maxlength: 40 },
    place: { type: String, trim: true, maxlength: 160 },
    setting: { type: String, trim: true, maxlength: 20 }, // lake, forest, park, urban, indoor
    guests: { type: String, trim: true, maxlength: 20 }, // e.g. "250"
    service: { type: String, trim: true, maxlength: 40 }, // service page the visitor came from
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
