import mongoose from 'mongoose';

const contentApprovalSchema = new mongoose.Schema(
  {
    materialTitle: {
      type: String,
      required: true
    },
    materialType: {
      type: String,
      default: 'PDF Notes'
    },
    materialRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationalMaterial',
      default: null
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
    submittedBy: {
      type: String,
      default: 'Content Contributor'
    },
    reviewer: {
      type: String,
      default: 'Master Admin'
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected', 'Changes Requested'],
      default: 'Pending Review'
    },
    reviewComments: {
      type: String,
      default: ''
    },
    history: [
      {
        status: String,
        reviewer: String,
        remarks: String,
        date: { type: Date, default: Date.now }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ContentApproval = mongoose.model('ContentApproval', contentApprovalSchema);

export default ContentApproval;
