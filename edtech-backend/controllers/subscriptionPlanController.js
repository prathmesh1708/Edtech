import SubscriptionPlan from '../models/SubscriptionPlan.js';

const DEFAULT_PLANS_SEED = [
  { id: 'PLAN001', name: 'Basic All-Access Pass', targetClass: 'All Classes', targetSubject: 'All Subjects', price: 999, duration: 'Monthly', features: 'Access to Core Syllabus, 10 Mock Tests, Basic Doubt Solving', status: 'Active', subscribers: 2 },
  { id: 'PLAN002', name: 'Class 10 Math Mastery', targetClass: 'Class 10', targetSubject: 'Mathematics', price: 1499, duration: 'Quarterly', features: 'Access to Class 10 Math Syllabus, Unlimited Mock Tests, 24/7 AI Tutor', status: 'Active', subscribers: 2 },
  { id: 'PLAN003', name: 'Class 12 Physics Pro', targetClass: 'Class 12', targetSubject: 'Physics', price: 2999, duration: 'Yearly', features: 'Personal Live Mentorship, Dedicated Physics Teacher, Custom Study Kits', status: 'Active', subscribers: 1 },
  { id: 'PLAN004', name: 'Class 9 Science Special', targetClass: 'Class 9', targetSubject: 'Science', price: 1199, duration: 'Quarterly', features: 'Physics, Chemistry & Biology Modules, Interactive Quizzes, Doubt Support', status: 'Active', subscribers: 3 }
];

let DEFAULT_SUBJECT_PRICING = {
  perSubjectMonthly: 499,
  perSubjectQuarterly: 1299,
  perSubjectYearly: 3999
};

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ status: 'Active' }).sort({ createdAt: -1 });
    if (plans.length > 0) {
      return res.json(plans);
    }
    return res.json(DEFAULT_PLANS_SEED);
  } catch (err) {
    res.json(DEFAULT_PLANS_SEED);
  }
};

export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, targetClass, targetSubject, price, duration, features, status } = req.body;
    const plan = await SubscriptionPlan.create({
      name,
      targetClass: targetClass || 'All Classes',
      targetSubject: targetSubject || 'All Subjects',
      price: Number(price) || 0,
      duration: duration || 'Monthly',
      features: features || '',
      status: status || 'Active'
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubjectPricing = async (req, res) => {
  try {
    res.json(DEFAULT_SUBJECT_PRICING);
  } catch (err) {
    res.json(DEFAULT_SUBJECT_PRICING);
  }
};

export const updateSubjectPricing = async (req, res) => {
  try {
    const { perSubjectMonthly, perSubjectQuarterly, perSubjectYearly } = req.body;
    if (perSubjectMonthly) DEFAULT_SUBJECT_PRICING.perSubjectMonthly = Number(perSubjectMonthly);
    if (perSubjectQuarterly) DEFAULT_SUBJECT_PRICING.perSubjectQuarterly = Number(perSubjectQuarterly);
    if (perSubjectYearly) DEFAULT_SUBJECT_PRICING.perSubjectYearly = Number(perSubjectYearly);
    res.json(DEFAULT_SUBJECT_PRICING);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
