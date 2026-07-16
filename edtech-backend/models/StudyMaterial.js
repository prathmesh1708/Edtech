import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Please add a reference to a Chapter'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title for study material'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify the material type'],
      enum: ['pdf', 'video', 'text'],
      default: 'text',
    },
    url: {
      type: String,
      required: [true, 'Please add the URL to the content file/link'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
