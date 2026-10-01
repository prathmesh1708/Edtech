import mongoose from 'mongoose';

// Metadata-only pointer to a DIKSHA item. Never stores file bodies or DIKSHA content.
const dikshaBookmarkSchema = new mongoose.Schema(
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
    mimeType: { type: String, trim: true },
    board: { type: String, trim: true },
    grade: { type: String, trim: true },
    subject: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    // Kept so bookmark cards can show the license and attribution DIKSHA requires.
    license: { type: String, trim: true },
    creator: { type: String, trim: true },
    organisation: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

dikshaBookmarkSchema.index({ user: 1, contentId: 1 }, { unique: true });

const DikshaBookmark = mongoose.model('DikshaBookmark', dikshaBookmarkSchema);
export default DikshaBookmark;
