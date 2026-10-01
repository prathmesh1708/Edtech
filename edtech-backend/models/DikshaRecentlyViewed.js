import mongoose from 'mongoose';

// Metadata-only record of DIKSHA items a user opened. Trimmed to the newest 20 per user.
const dikshaRecentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    contentId: {
      type: String,
      required: [true, 'Please add a DIKSHA content id'],
      trim: true,
    },
    title: { type: String, trim: true },
    type: { type: String, trim: true },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

dikshaRecentlyViewedSchema.index({ user: 1, contentId: 1 }, { unique: true });
dikshaRecentlyViewedSchema.index({ user: 1, viewedAt: -1 });

const DikshaRecentlyViewed = mongoose.model('DikshaRecentlyViewed', dikshaRecentlyViewedSchema);
export default DikshaRecentlyViewed;
