import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a banner title'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add a banner image URL'],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    targeting: {
      type: String,
      default: 'Prospective Students',
    },
    scheduleType: {
      type: String,
      enum: ['Permanent', 'Scheduled'],
      default: 'Permanent',
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Scheduled', 'Inactive'],
      default: 'Active',
    },
    active: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
      enum: ['home', 'dashboard'],
      default: 'dashboard',
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ active: 1, placement: 1, status: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
