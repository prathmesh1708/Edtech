import PrivacyPolicy from '../models/PrivacyPolicy.js';

// Shown until an admin saves a policy for the first time. Starting point only — needs legal review.
const DEFAULT_POLICY = {
  title: 'Privacy Policy',
  introduction:
    'Study Wisely ("we", "us") respects your privacy. This policy explains what information we collect when you use our learning platform, how we use it, and the choices you have.',
  contactEmail: '',
  published: true,
  version: 1,
  clauses: [
    {
      title: 'Information We Collect',
      content:
        'Account details (name, email, mobile number, class and board), learning activity (notes, bookmarks, study progress), and device information needed to deliver notifications.',
      enabled: true,
    },
    {
      title: 'How We Use Your Information',
      content:
        'To provide and personalise study content, run the AI tutor, send notifications you have allowed, process subscriptions, and keep the platform secure.',
      enabled: true,
    },
    {
      title: "Children's Privacy",
      content:
        'Students under 18 use Study Wisely with the consent of a parent or guardian. A parent or guardian can ask us to review or delete a child\'s data at any time.',
      enabled: true,
    },
    {
      title: 'Data Sharing',
      content:
        'We do not sell personal data. We share it only with service providers who help us run the platform (hosting, payments, notifications) and when the law requires it.',
      enabled: true,
    },
    {
      title: 'Data Retention and Security',
      content:
        'We keep your data while your account is active and delete it on request, except where we must retain records by law. We use industry-standard safeguards to protect it.',
      enabled: true,
    },
    {
      title: 'Your Rights',
      content:
        'You can access, correct or delete your personal data, withdraw consent, and turn off notifications from your device or app settings.',
      enabled: true,
    },
  ],
};

const MAX_CLAUSES = 50;

const toPublic = (policy) => ({
  title: policy.title,
  introduction: policy.introduction,
  effectiveDate: policy.effectiveDate,
  contactEmail: policy.contactEmail,
  version: policy.version,
  updatedAt: policy.updatedAt,
  clauses: (policy.clauses || [])
    .filter((c) => c.enabled)
    .map((c) => ({ id: c._id, title: c.title, content: c.content })),
});

// @desc    Customer/user privacy policy for the apps — no login required
// @route   GET /api/policies/customer
// @access  Public
export const getPublicCustomerPolicy = async (req, res, next) => {
  try {
    const policy = (await PrivacyPolicy.findOne({ audience: 'customer' }).lean()) || DEFAULT_POLICY;
    if (!policy.published) {
      res.status(404);
      throw new Error('Privacy policy is not published');
    }
    res.json(toPublic(policy));
  } catch (error) {
    next(error);
  }
};

// @desc    Full policy for editing, including disabled clauses and draft state
// @route   GET /api/policies/admin/customer
// @access  Admin
export const getAdminCustomerPolicy = async (req, res, next) => {
  try {
    const policy = await PrivacyPolicy.findOne({ audience: 'customer' }).lean();
    res.json(policy || { ...DEFAULT_POLICY, audience: 'customer', effectiveDate: new Date(), isDefault: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or replace the customer policy
// @route   PUT /api/policies/admin/customer
// @access  Admin
export const updateCustomerPolicy = async (req, res, next) => {
  try {
    const { title, introduction, effectiveDate, contactEmail, published, clauses } = req.body;

    if (!Array.isArray(clauses) || clauses.length > MAX_CLAUSES) {
      res.status(400);
      throw new Error(`clauses must be an array of at most ${MAX_CLAUSES} items`);
    }
    if (clauses.some((c) => !c || typeof c.title !== 'string' || !c.title.trim())) {
      res.status(400);
      throw new Error('Every clause needs a title');
    }

    const update = {
      title: typeof title === 'string' && title.trim() ? title : 'Privacy Policy',
      introduction: introduction ?? '',
      contactEmail: contactEmail ?? '',
      published: published !== false,
      clauses: clauses.map((c) => ({
        ...(c._id && /^[0-9a-fA-F]{24}$/.test(c._id) ? { _id: c._id } : {}),
        title: c.title,
        content: c.content ?? '',
        enabled: c.enabled !== false,
      })),
    };
    if (effectiveDate) update.effectiveDate = effectiveDate;

    const policy = await PrivacyPolicy.findOneAndUpdate(
      { audience: 'customer' },
      { $set: update, $inc: { version: 1 }, $setOnInsert: { audience: 'customer' } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(policy);
  } catch (error) {
    next(error);
  }
};
