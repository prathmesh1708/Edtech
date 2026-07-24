import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: true, // we will explicitly select it or handle visibility
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin', 'parent'],
      default: 'student',
    },
    phone: {
      type: String,
    },
    schoolName: {
      type: String,
    },
    childName: {
      type: String,
    },
    classId: {
      type: String,
    },
    board: {
      type: String,
      default: 'CBSE',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Blocked'],
      default: 'Active',
    },
    studentId: { type: String },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    parentName: { type: String },
    parentPhone: { type: String },
    section: { type: String },
    rollNumber: { type: String },
    batch: { type: String },
    photoUrl: { type: String },
    emailVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
