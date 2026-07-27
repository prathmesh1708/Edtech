import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a plan name'],
      trim: true
    },
    targetClass: {
      type: String,
      default: 'All Classes',
      trim: true
    },
    targetSubject: {
      type: String,
      default: 'All Subjects',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0
    },
    duration: {
      type: String,
      default: 'Monthly'
    },
    features: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    subscribers: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;
