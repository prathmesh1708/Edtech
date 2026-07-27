import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import syllabusService from '../services/syllabusService';
import subscriptionService from '../services/subscriptionService';
import { openRazorpayCheckout } from '../../utils/razorpayService';
import { useAuth } from './AuthContext';

const SyllabusContext = createContext(null);

export const useSyllabusState = () => {
  const context = useContext(SyllabusContext);
  if (!context) throw new Error('useSyllabusState must be used within a SyllabusProvider');
  return context;
};

const DEFAULT_PLANS = [
  { id: 'PLAN001', name: 'Basic All-Access Pass', targetClass: 'All Classes', targetSubject: 'All Subjects', price: 999, duration: 'Monthly', features: 'Access to Core Syllabus, 10 Mock Tests, Basic Doubt Solving', status: 'Active', subscribers: 2 },
  { id: 'PLAN002', name: 'Class 10 Math Mastery', targetClass: 'Class 10', targetSubject: 'Mathematics', price: 1499, duration: 'Quarterly', features: 'Access to Class 10 Math Syllabus, Unlimited Mock Tests, 24/7 AI Tutor', status: 'Active', subscribers: 2 },
  { id: 'PLAN003', name: 'Class 12 Physics Pro', targetClass: 'Class 12', targetSubject: 'Physics', price: 2999, duration: 'Yearly', features: 'Personal Live Mentorship, Dedicated Physics Teacher, Custom Study Kits', status: 'Active', subscribers: 1 },
  { id: 'PLAN004', name: 'Class 9 Science Special', targetClass: 'Class 9', targetSubject: 'Science', price: 1199, duration: 'Quarterly', features: 'Physics, Chemistry & Biology Modules, Interactive Quizzes, Doubt Support', status: 'Active', subscribers: 3 }
];

const DEFAULT_PRICING = {
  perSubjectMonthly: 499,
  perSubjectQuarterly: 1299,
  perSubjectYearly: 3999
};

const DEFAULT_CYCLE_SETTINGS = {
  quarterlyDiscount: 10,
  yearlyDiscount: 20
};

export const SyllabusProvider = ({ children }) => {
  const { user } = useAuth();

  const [selectedBoard, setSelectedBoard] = useState(() => {
    return user?.board ? user.board.toLowerCase() : 'cbse';
  });
  const [selectedClass, setSelectedClass] = useState(() => {
    return user?.classId ? String(user.classId) : '10';
  });
  const [subjects, setSubjects] = useState([]);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    return localStorage.getItem('selected_subscription_plan_id') || 'PLAN001';
  });

  // User Payment and Subscription State
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(() => {
    return localStorage.getItem('user_payment_status') || 'ACTIVE'; // default ACTIVE for smooth preview
  });
  const [paymentMessage, setPaymentMessage] = useState('');

  // Subject Pricing rates (managed by Admin)
  const [subjectPricing, setSubjectPricing] = useState(() => {
    const saved = localStorage.getItem('admin_subject_pricing');
    return saved ? JSON.parse(saved) : DEFAULT_PRICING;
  });

  // Billing Cycle Discount Rules (managed by Admin)
  const [cycleSettings, setCycleSettings] = useState(() => {
    const saved = localStorage.getItem('admin_billing_cycle_settings');
    return saved ? JSON.parse(saved) : DEFAULT_CYCLE_SETTINGS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.classId) {
      setSelectedClass(String(user.classId));
    }
    if (user?.board) {
      setSelectedBoard(user.board.toLowerCase());
    }
  }, [user?.classId, user?.board]);

  const fetchSubjects = useCallback(async () => {
    if (!selectedBoard || !selectedClass) return;
    setLoading(true);
    setError(null);
    try {
      const res = await syllabusService.getSubjects(selectedBoard, selectedClass);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const formattedSubjects = res.data.map(item => ({
          id: item._id,
          name: item.subjectName,
          code: item.subjectCode,
          description: item.description,
          color: item.color || '#4F6EF7',
          icon: item.icon || 'BookOpen',
          chapters: item.chapters || [],
          chapterCount: item.chapters ? item.chapters.length : 0,
          rawItem: item
        }));
        setSubjects(formattedSubjects);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects from backend:', err);
      setError(err.message || 'Failed to fetch syllabus data');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBoard, selectedClass]);

  const fetchPlans = useCallback(async () => {
    try {
      const localAdminPlans = localStorage.getItem('admin_subscription_plans');
      if (localAdminPlans) {
        setPlans(JSON.parse(localAdminPlans));
        return;
      }
      const res = await subscriptionService.getPlans();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPlans(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch subscription plans:', err);
    }
  }, []);

  const fetchSubjectPricing = useCallback(async () => {
    try {
      const saved = localStorage.getItem('admin_subject_pricing');
      if (saved) {
        setSubjectPricing(JSON.parse(saved));
      }
      const savedCycles = localStorage.getItem('admin_billing_cycle_settings');
      if (savedCycles) {
        setCycleSettings(JSON.parse(savedCycles));
      }
    } catch (err) {
      console.warn('Could not fetch subject pricing or cycles:', err);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchPlans();
    fetchSubjectPricing();
  }, [fetchSubjects, fetchPlans, fetchSubjectPricing]);

  const updatePricingByAdmin = useCallback((newPricing) => {
    setSubjectPricing(newPricing);
    localStorage.setItem('admin_subject_pricing', JSON.stringify(newPricing));
    try {
      subscriptionService.updateSubjectPricing(newPricing);
    } catch (e) {
      console.warn('Could not sync pricing to backend:', e.message);
    }
  }, []);

  const selectPlan = useCallback((planId) => {
    setSelectedPlanId(planId);
    localStorage.setItem('selected_subscription_plan_id', planId);
  }, []);

  const logAdminTransaction = useCallback((plan, status) => {
    const today = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setDate(expiryDateObj.getDate() + 30);
    const expiry = expiryDateObj.toISOString().split('T')[0];

    const newSubRecord = {
      id: `SUB${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: user?.name || 'Mohit Admin (Student)',
      planName: plan.name || 'Custom Subject Plan',
      targetClass: plan.targetClass || `Class ${selectedClass}`,
      targetSubject: plan.targetSubject || 'All Subjects',
      purchaseDate: today,
      expiryDate: status === 'Active' ? expiry : today,
      price: plan.price || 499,
      status: status
    };

    const savedSubs = localStorage.getItem('admin_subscriptions_list');
    const existingList = savedSubs ? JSON.parse(savedSubs) : [];
    const updatedList = [newSubRecord, ...existingList];
    localStorage.setItem('admin_subscriptions_list', JSON.stringify(updatedList));

    window.dispatchEvent(new Event('admin_subscription_updated'));
  }, [user?.name, selectedClass]);

  const initiateRazorpayPayment = useCallback((plan, onCompleted) => {
    openRazorpayCheckout({
      planName: plan.name,
      amount: plan.price || 499,
      studentName: user?.name || 'Mohit Student',
      studentEmail: user?.email || 'mohit@gmail.com',
      onSuccess: (res) => {
        const planId = plan._id || plan.id;
        setSelectedPlanId(planId);
        localStorage.setItem('selected_subscription_plan_id', planId);
        setUserSubscriptionStatus('ACTIVE');
        localStorage.setItem('user_payment_status', 'ACTIVE');
        setPaymentMessage(`Payment Successful! ₹${res.amount} paid via Razorpay (ID: ${res.paymentId}). Your subscription is active and selected subjects are unlocked.`);
        logAdminTransaction(plan, 'Active');
        if (onCompleted) onCompleted(true);
      },
      onFailure: (err) => {
        setUserSubscriptionStatus('FAILED');
        localStorage.setItem('user_payment_status', 'FAILED');
        setPaymentMessage(`Payment Failed / Canceled via Razorpay (${err.reason || 'Transaction Declined'}). No subjects unlocked.`);
        logAdminTransaction(plan, 'Canceled');
        if (onCompleted) onCompleted(false);
      }
    });
  }, [user?.name, user?.email, logAdminTransaction]);

  // Create & activate custom subject-wise subscription plan with Admin Billing Cycle Rules (%)
  const createCustomPlan = useCallback((selectedSubjectNames, duration = 'Monthly') => {
    if (!selectedSubjectNames || selectedSubjectNames.length === 0) return;

    const savedCycles = localStorage.getItem('admin_billing_cycle_settings');
    const cycles = savedCycles ? JSON.parse(savedCycles) : DEFAULT_CYCLE_SETTINGS;
    const savedPricing = localStorage.getItem('admin_subject_pricing');
    const pricing = savedPricing ? JSON.parse(savedPricing) : DEFAULT_PRICING;

    const baseRate = pricing.perSubjectMonthly || 499;
    const count = selectedSubjectNames.length;

    let totalPrice = 0;
    if (duration === 'Yearly') {
      const gross = count * baseRate * 12;
      const discount = gross * ((cycles.yearlyDiscount || 20) / 100);
      totalPrice = Math.round(gross - discount);
    } else if (duration === 'Quarterly') {
      const gross = count * baseRate * 3;
      const discount = gross * ((cycles.quarterlyDiscount || 10) / 100);
      totalPrice = Math.round(gross - discount);
    } else {
      totalPrice = count * baseRate;
    }

    const planId = `PLAN-CUSTOM-${Date.now()}`;
    const subjectListStr = selectedSubjectNames.join(', ');

    const newCustomPlan = {
      id: planId,
      _id: planId,
      name: `Custom Bundle (${count} ${count === 1 ? 'Subject' : 'Subjects'})`,
      targetClass: `Class ${selectedClass}`,
      targetSubject: subjectListStr,
      price: totalPrice,
      duration: duration,
      features: `Custom access to ${subjectListStr}, Complete Notes, Practice Papers`,
      status: 'Active',
      subscribers: 1,
      isCustom: true,
      selectedSubjectList: selectedSubjectNames
    };

    setPlans(prev => [newCustomPlan, ...prev.filter(p => !p.isCustom)]);
    const updatedPlans = [newCustomPlan, ...plans.filter(p => !p.isCustom)];
    localStorage.setItem('admin_subscription_plans', JSON.stringify(updatedPlans));

    initiateRazorpayPayment(newCustomPlan);
  }, [selectedClass, plans, initiateRazorpayPayment]);

  // Filter subjects based on selected subscription plan AND payment status
  const filteredSubjects = useMemo(() => {
    if (userSubscriptionStatus === 'FAILED') {
      return [];
    }

    const activePlan = plans.find(p => (p._id || p.id) === selectedPlanId) || plans[0];
    if (!activePlan) return subjects;

    const targetSubj = activePlan.targetSubject || 'All Subjects';

    if (targetSubj === 'All Subjects' || targetSubj.toLowerCase().includes('all subjects') || targetSubj.toLowerCase().includes('all classes')) {
      return subjects;
    }

    // Build normalized allowed target list from selectedSubjectList array or targetSubject string
    const rawAllowed = activePlan.selectedSubjectList || targetSubj.split(',').map(s => s.trim());
    const allowedList = rawAllowed.map(s => String(s).trim().toLowerCase());

    return subjects.filter(s => {
      const sName = (s.name || s.subjectName || '').toLowerCase();
      const sCode = (s.code || s.subjectCode || '').toLowerCase();
      const sRawName = (s.rawItem?.subjectName || '').toLowerCase();

      return allowedList.some(target => {
        if (!target) return false;
        const t = target.toLowerCase();

        // Exact match or substring match
        if (sName.includes(t) || t.includes(sName)) return true;
        if (sRawName && (sRawName.includes(t) || t.includes(sRawName))) return true;
        if (sCode && (sCode.includes(t) || t.includes(sCode))) return true;

        // Strip parenthetical codes e.g. "Maths (5585)" -> "maths"
        const cleanName = sName.replace(/\(.*\)/, '').trim();
        const cleanTarget = t.replace(/\(.*\)/, '').trim();
        if (cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName)) return true;

        // Common subject prefix alias matching
        const tStem = cleanTarget.slice(0, 4);
        const sStem = cleanName.slice(0, 4);
        if (tStem.length >= 3 && sStem.length >= 3 && tStem === sStem) return true;

        return false;
      });
    });
  }, [subjects, plans, selectedPlanId, userSubscriptionStatus]);

  const currentPlan = useMemo(() => {
    return plans.find(p => (p._id || p.id) === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  return (
    <SyllabusContext.Provider value={{
      selectedBoard,
      setSelectedBoard,
      selectedClass,
      setSelectedClass,
      subjects: filteredSubjects,
      allSubjects: subjects,
      plans,
      selectedPlanId,
      currentPlan,
      subjectPricing,
      cycleSettings,
      userSubscriptionStatus,
      paymentMessage,
      updatePricingByAdmin,
      selectPlan,
      createCustomPlan,
      initiateRazorpayPayment,
      loading,
      error,
      refreshSubjects: fetchSubjects,
      refreshPlans: fetchPlans
    }}>
      {children}
    </SyllabusContext.Provider>
  );
};
