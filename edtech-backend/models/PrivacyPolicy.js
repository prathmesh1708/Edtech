import mongoose from 'mongoose';

const clauseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '', maxlength: 20000 },
    enabled: { type: Boolean, default: true },
  },
  { _id: true }
);

// One document per audience. Only 'customer' (student/parent app users) exists today.
const privacyPolicySchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ['customer'], default: 'customer', unique: true },
    title: { type: String, trim: true, maxlength: 200, default: 'Privacy Policy' },
    introduction: { type: String, default: '', maxlength: 5000 },
    effectiveDate: { type: Date, default: Date.now },
    contactEmail: { type: String, trim: true, maxlength: 200, default: '' },
    published: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
    clauses: { type: [clauseSchema], default: [] },
  },
  { timestamps: true }
);

const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);
export default PrivacyPolicy;
