import mongoose from 'mongoose';

const educationalMaterialSchema = new mongoose.Schema(
  {
    materialTitle: {
      type: String,
      required: [true, 'Please add a material title'],
      trim: true
    },
    materialType: {
      type: String,
      enum: [
        'PDF Notes',
        'Videos',
        'Images',
        'PPT',
        'Documents',
        'Audio',
        'Assignments',
        'Worksheets',
        'Sample Papers',
        'Previous Year Papers',
        'Quizzes',
        'External Links'
      ],
      default: 'PDF Notes'
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileSize: {
      type: String,
      default: '2.5 MB'
    },
    description: {
      type: String,
      default: ''
    },
    board: {
      type: String,
      default: 'CBSE'
    },
    classId: {
      type: String,
      default: 'Class 10'
    },
    subject: {
      type: String,
      default: 'Mathematics'
    },
    chapter: {
      type: String,
      default: 'Chapter 1: Real Numbers'
    },
    tags: [
      {
        type: String
      }
    ],
    language: {
      type: String,
      default: 'English'
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Published'],
      default: 'Pending Review'
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Student Only'],
      default: 'Public'
    },
    version: {
      type: String,
      default: 'v1.0'
    },
    versionHistory: [
      {
        version: String,
        fileUrl: String,
        updatedBy: String,
        updatedAt: { type: Date, default: Date.now },
        notes: String
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const EducationalMaterial = mongoose.model('EducationalMaterial', educationalMaterialSchema);

export default EducationalMaterial;
