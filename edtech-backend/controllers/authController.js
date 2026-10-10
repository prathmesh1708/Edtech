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
  const { name, email, password, role, phone, schoolName, childName, classId, board, address } = req.body;

  try {
    if (!name || !password) {
      res.status(400);
      throw new Error('Please include name and password');
    }

    let userExists = false;
    if (email && email.trim()) {
      userExists = (await User.findOne({ email: email.trim().toLowerCase() })) || (await Admin.findOne({ email: email.trim().toLowerCase() }));
      if (userExists) {
        res.status(400);
        throw new Error('This email is already registered. Log in instead?');
      }
    }

    if (phone && phone.trim()) {
      const phoneClean = phone.replace(/\D/g, '');
      const existingPhoneUser = await User.findOne({ phone: { $in: [phone, phoneClean, `+91${phoneClean}`] } });
      if (existingPhoneUser) {
        res.status(400);
        throw new Error('This number is already registered. Log in instead?');
      }
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
        address,
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
          address: user.address,
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
  const { password } = req.body;
  // The login form sends the email-or-mobile value as `email`; `identifier` is also accepted.
  const rawIdentifier = req.body.identifier ?? req.body.email;
  const identifier = typeof rawIdentifier === 'string' ? rawIdentifier.trim() : '';

  try {
    if (!identifier || !password) {
      res.status(400);
      throw new Error('Please include your email or mobile number and password');
    }

    // Build the lookup: email as typed or lowercased (Admin emails are not lowercased
    // on save), or a 10-digit mobile in the formats registration may have stored.
    let query = null;
    if (identifier.includes('@')) {
      query = { email: { $in: [identifier, identifier.toLowerCase()] } };
    } else {
      const digits = identifier.replace(/\D/g, '');
      const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      if (local.length === 10) {
        query = { phone: { $in: [identifier, local, `+91${local}`, `91${local}`] } };
      }
    }

    // Check Admin collection first
    let user = query ? await Admin.findOne(query) : null;
    let isAdminModel = true;

    if (!user && query) {
      user = await User.findOne(query);
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
      throw new Error('Invalid email/mobile number or password');
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

const FCM_DEVICE_TYPES = ['android', 'ios', 'web'];

// @desc    Save (or refresh) the FCM device token for the logged-in user
// @route   POST /api/auth/fcm-token
// @access  Private
export const saveFcmToken = async (req, res, next) => {
  try {
    const { fcmToken, deviceType = 'android' } = req.body;

    if (!fcmToken || typeof fcmToken !== 'string') {
      res.status(400);
      throw new Error('fcmToken is required');
    }
    if (!FCM_DEVICE_TYPES.includes(deviceType)) {
      res.status(400);
      throw new Error('deviceType must be one of: ' + FCM_DEVICE_TYPES.join(', '));
    }

    // A device token belongs to one account at a time: detach it from everyone first
    await Promise.all([User, Admin].map((Model) =>
      Model.updateMany({ 'fcmTokens.token': fcmToken }, { $pull: { fcmTokens: { token: fcmToken } } })
    ));

    const Model = req.user.role === 'admin' ? Admin : User;
    await Model.updateOne(
      { _id: req.user._id },
      { $push: { fcmTokens: { token: fcmToken, deviceType, updatedAt: new Date() } } }
    );

    res.json({ message: 'FCM token saved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an FCM device token (call on logout)
// @route   DELETE /api/auth/fcm-token
// @access  Private
export const removeFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      res.status(400);
      throw new Error('fcmToken is required');
    }

    const Model = req.user.role === 'admin' ? Admin : User;
    await Model.updateOne({ _id: req.user._id }, { $pull: { fcmTokens: { token: fcmToken } } });

    res.json({ message: 'FCM token removed' });
  } catch (error) {
    next(error);
  }
};

// Mobile OTP login has no SMS provider yet. The only supported mode is a LOCAL DEVELOPMENT
// one: with ENABLE_DEV_OTP=true every registered number accepts the fixed code below.
// That means anyone who knows a phone number can log in as that user, so the flag must
// never be set on a deployed server. With the flag off (the default) both endpoints refuse.
const DEV_OTP_CODE = '1234';
let devOtpWarned = false;
const devOtpEnabled = () => {
  if (process.env.ENABLE_DEV_OTP !== 'true') return false;
  if (!devOtpWarned) {
    devOtpWarned = true;
    console.warn(`WARNING: ENABLE_DEV_OTP is on — every mobile number accepts OTP ${DEV_OTP_CODE}. Never use this in production.`);
  }
  return true;
};
const OTP_UNAVAILABLE = 'Mobile OTP login is not available yet. Please log in with your password.';

const findUserByPhone = (phone) => {
  const clean = String(phone).replace(/\D/g, '');
  const local = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;
  return User.findOne({ phone: { $in: [phone, clean, local, `+91${local}`, `91${local}`] } });
};

// @desc    Send OTP to user mobile (dev mode only — no SMS is actually sent)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res, next) => {
  if (!devOtpEnabled()) return res.status(501).json({ message: OTP_UNAVAILABLE });

  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      res.status(400);
      throw new Error('Please enter your mobile number');
    }
    const user = await findUserByPhone(phone);
    if (!user) {
      res.status(404);
      throw new Error('No account found with this mobile number. Please sign up first.');
    }
    res.json({ success: true, message: 'OTP sent successfully to your mobile number' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP & Authenticate (dev mode only — accepts the fixed code)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  if (!devOtpEnabled()) return res.status(501).json({ message: OTP_UNAVAILABLE });

  try {
    const { phone, otp } = req.body;
    if (!phone || typeof phone !== 'string' || !otp) {
      res.status(400);
      throw new Error('Please provide both mobile number and OTP');
    }
    // Same message for "wrong code" and "unknown number" so this can't be used to probe numbers
    const user = String(otp) === DEV_OTP_CODE ? await findUserByPhone(phone) : null;
    if (!user) {
      res.status(401);
      throw new Error('Invalid OTP. Please try again.');
    }
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
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
