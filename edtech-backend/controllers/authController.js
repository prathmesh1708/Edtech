import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, role, phone, schoolName, childName, classId, board } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please include name, email, and password');
    }

    const userExists = (await User.findOne({ email })) || (await Admin.findOne({ email }));

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    if (role === 'admin') {
      const admin = await Admin.create({
        name,
        email,
        password,
        role: 'admin',
        phone,
      });

      if (admin) {
        res.status(201).json({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone,
          token: generateToken(admin._id),
        });
      } else {
        res.status(400);
        throw new Error('Invalid admin data');
      }
    } else {
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
        phone,
        schoolName,
        childName,
        classId,
        board: board || 'CBSE',
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          schoolName: user.schoolName,
          childName: user.childName,
          classId: user.classId,
          board: user.board,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please include email and password');
    }

    // Check Admin collection first
    let user = await Admin.findOne({ email });
    let isAdminModel = true;

    if (!user) {
      user = await User.findOne({ email });
      isAdminModel = false;
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || (isAdminModel ? 'admin' : 'student'),
        phone: user.phone,
        schoolName: user.schoolName,
        childName: user.childName,
        classId: user.classId,
        board: user.board,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    let user = await Admin.findById(req.user._id);
    if (!user) {
      user = await User.findById(req.user._id);
    }

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        schoolName: user.schoolName,
        childName: user.childName,
        classId: user.classId,
        board: user.board,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
