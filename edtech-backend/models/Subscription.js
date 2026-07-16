import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    planName: {
      type: String,
      required: [true, 'Please specify the plan name'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Please specify active status'],
      enum: ['active', 'expired', 'canceled'],
      default: 'active',
    },
    price: {
      type: Number,
      required: [true, 'Please specify subscription price'],
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Please specify plan expiry date'],
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
