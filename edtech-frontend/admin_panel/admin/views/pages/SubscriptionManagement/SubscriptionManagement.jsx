import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CreditCard, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  Layers,
  Check,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import styles from './SubscriptionManagement.module.css';

const CLASS_OPTIONS = [
  'All Classes',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Science',
  'Computer Science'
];

const initialPlans = [
  { id: 'PLAN001', name: 'Basic All-Access Pass', targetClass: 'All Classes', targetSubject: 'All Subjects', price: 999, duration: 'Monthly', features: 'Access to Core Syllabus, 10 Mock Tests, Basic Doubt Solving', status: 'Active', subscribers: 2 },
  { id: 'PLAN002', name: 'Class 10 Math Mastery', targetClass: 'Class 10', targetSubject: 'Mathematics', price: 1499, duration: 'Quarterly', features: 'Access to Class 10 Math Syllabus, Unlimited Mock Tests, 24/7 AI Tutor', status: 'Active', subscribers: 2 },
  { id: 'PLAN003', name: 'Class 12 Physics Pro', targetClass: 'Class 12', targetSubject: 'Physics', price: 2999, duration: 'Yearly', features: 'Personal Live Mentorship, Dedicated Physics Teacher, Custom Study Kits', status: 'Active', subscribers: 1 },
  { id: 'PLAN004', name: 'Class 9 Science Special', targetClass: 'Class 9', targetSubject: 'Science', price: 1199, duration: 'Quarterly', features: 'Physics, Chemistry & Biology Modules, Interactive Quizzes, Doubt Support', status: 'Active', subscribers: 3 }
];

const initialSubscriptions = [
  { id: 'SUB001', studentName: 'Rahul Sharma', planName: 'Class 12 Physics Pro', targetClass: 'Class 12', targetSubject: 'Physics', duration: 'Yearly', price: 2999, purchaseDate: '2026-06-10', expiryDate: '2027-06-10', status: 'Active' },
  { id: 'SUB002', studentName: 'Priya Patel', planName: 'Class 10 Math Mastery', targetClass: 'Class 10', targetSubject: 'Mathematics', duration: 'Quarterly', price: 1499, purchaseDate: '2026-06-12', expiryDate: '2026-09-12', status: 'Active' },
  { id: 'SUB003', studentName: 'Amit Kumar', planName: 'Basic All-Access Pass', targetClass: 'All Classes', targetSubject: 'All Subjects', duration: 'Monthly', price: 999, purchaseDate: '2026-05-15', expiryDate: '2026-06-15', status: 'Expired' },
  { id: 'SUB004', studentName: 'Sneha Gupta', planName: 'Class 10 Math Mastery', targetClass: 'Class 10', targetSubject: 'Mathematics', duration: 'Quarterly', price: 1499, purchaseDate: '2026-06-18', expiryDate: '2026-09-18', status: 'Active' },
  { id: 'SUB005', studentName: 'Rohan Singh', planName: 'Class 9 Science Special', targetClass: 'Class 9', targetSubject: 'Science', duration: 'Quarterly', price: 1199, purchaseDate: '2026-07-01', expiryDate: '2026-10-01', status: 'Pending' }
];

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' or 'plans'
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [plans, setPlans] = useState(initialPlans);

  const [subjectPricing, setSubjectPricing] = useState(() => {
    const saved = localStorage.getItem('admin_subject_pricing');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved subject pricing', e);
      }
    }
    return {
      perSubjectMonthly: 499,
      perSubjectQuarterly: 1299,
      perSubjectYearly: 3999
    };
  });

  const [cycleSettings, setCycleSettings] = useState(() => {
    const saved = localStorage.getItem('admin_billing_cycle_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved cycle settings', e);
      }
    }
    return { quarterlyDiscount: 10, yearlyDiscount: 20 };
  });

  const handleSaveCycleSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_billing_cycle_settings', JSON.stringify(cycleSettings));
    toast.success('Global Billing Cycle Discounts updated successfully!', 'Settings Saved');
  };
  
  // Search & Filter (Subscriptions)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Search & Filter (Plans tab)
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [planClassFilter, setPlanClassFilter] = useState('All');
  const [planSubjectFilter, setPlanSubjectFilter] = useState('All');

  // Modals state (Subscriptions)
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [isDeleteSubModalOpen, setIsDeleteSubModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);

  // Modals state (Plans)
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Sub Form State
  const [subFormData, setSubFormData] = useState({
    studentName: '',
    planName: 'Basic All-Access Pass',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active'
  });

  // Plan Form State
  const [planFormData, setPlanFormData] = useState({
    name: '',
    targetClass: 'All Classes',
    targetSubject: 'All Subjects',
    price: '',
    duration: 'Monthly',
    features: '',
    status: 'Active'
  });

  const toast = useToast();

  // Reset Sub Form
  const resetSubForm = () => {
    setSubFormData({
      studentName: '',
      planName: plans[0]?.name || 'Basic All-Access Pass',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'Active'
    });
  };

  // Reset Plan Form
  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      targetClass: 'All Classes',
      targetSubject: 'All Subjects',
      price: '',
      duration: 'Monthly',
      features: '',
      status: 'Active'
    });
  };

  // Auto-calculate Expiry Date based on purchase date and selected plan
  const handlePurchaseDateOrPlanChange = (name, value, currentFormData) => {
    const updatedForm = { ...currentFormData, [name]: value };
    const selectedPlan = plans.find(p => p.name === updatedForm.planName);
    
    if (updatedForm.purchaseDate && selectedPlan) {
      const pDate = new Date(updatedForm.purchaseDate);
      if (selectedPlan.duration === 'Monthly') {
        pDate.setMonth(pDate.getMonth() + 1);
      } else if (selectedPlan.duration === 'Quarterly') {
        pDate.setMonth(pDate.getMonth() + 3);
      } else if (selectedPlan.duration === 'Yearly') {
        pDate.setFullYear(pDate.getFullYear() + 1);
      }
      updatedForm.expiryDate = pDate.toISOString().split('T')[0];
    }
    return updatedForm;
  };

  const handleSubInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchaseDate' || name === 'planName') {
      setSubFormData(prev => handlePurchaseDateOrPlanChange(name, value, prev));
    } else {
      setSubFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sub Handlers
  const handleAddSubSubmit = (e) => {
    e.preventDefault();
    if (!subFormData.studentName || !subFormData.purchaseDate || !subFormData.expiryDate) {
      toast.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...subscriptions.map(s => parseInt(s.id.replace('SUB', '')) || 0), 0) + 1;
    const formattedId = `SUB${String(nextIdNum).padStart(3, '0')}`;

    const selectedPlan = plans.find(p => p.name === subFormData.planName);
    const pricePaid = selectedPlan ? selectedPlan.price : 999;
    const duration = selectedPlan ? selectedPlan.duration : 'Monthly';
    const targetClass = selectedPlan ? (selectedPlan.targetClass || 'All Classes') : 'All Classes';
    const targetSubject = selectedPlan ? (selectedPlan.targetSubject || 'All Subjects') : 'All Subjects';

    const newSub = {
      id: formattedId,
      ...subFormData,
      targetClass,
      targetSubject,
      price: pricePaid,
      duration: duration
    };

    setSubscriptions(prev => [newSub, ...prev]);
    
    // Increment plan subscriber count
    if (selectedPlan) {
      setPlans(prevPlans => 
        prevPlans.map(p => p.id === selectedPlan.id ? { ...p, subscribers: p.subscribers + 1 } : p)
      );
    }

    setIsAddSubModalOpen(false);
    resetSubForm();
    toast.success(`Subscription for ${newSub.studentName} has been created.`, 'Subscription Created');
  };

  const handleEditSubClick = (sub) => {
    setCurrentSub(sub);
    setSubFormData({
      studentName: sub.studentName,
      planName: sub.planName,
      purchaseDate: sub.purchaseDate,
      expiryDate: sub.expiryDate,
      status: sub.status
    });
    setIsEditSubModalOpen(true);
  };

  const handleEditSubSubmit = (e) => {
    e.preventDefault();
    if (!subFormData.studentName || !subFormData.purchaseDate || !subFormData.expiryDate) {
      toast.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    const selectedPlan = plans.find(p => p.name === subFormData.planName);
    const pricePaid = selectedPlan ? selectedPlan.price : 999;
    const duration = selectedPlan ? selectedPlan.duration : 'Monthly';
    const targetClass = selectedPlan ? (selectedPlan.targetClass || 'All Classes') : 'All Classes';
    const targetSubject = selectedPlan ? (selectedPlan.targetSubject || 'All Subjects') : 'All Subjects';

    // Adjust subscriber counts if plan changed
    if (currentSub.planName !== subFormData.planName) {
      setPlans(prevPlans => 
        prevPlans.map(p => {
          if (p.name === currentSub.planName) return { ...p, subscribers: Math.max(0, p.subscribers - 1) };
          if (p.name === subFormData.planName) return { ...p, subscribers: p.subscribers + 1 };
          return p;
        })
      );
    }

    setSubscriptions(prev => 
      prev.map(s => s.id === currentSub.id ? { 
        ...s, 
        ...subFormData, 
        targetClass, 
        targetSubject, 
        price: pricePaid, 
        duration: duration 
      } : s)
    );
    setIsEditSubModalOpen(false);
    resetSubForm();
    toast.success(`Subscription details for ${subFormData.studentName} updated.`, 'Subscription Updated');
  };

  const handleDeleteSubClick = (sub) => {
    setCurrentSub(sub);
    setIsDeleteSubModalOpen(true);
  };

  const handleDeleteSubConfirm = () => {
    setSubscriptions(prev => prev.filter(s => s.id !== currentSub.id));
    
    // Decrement plan subscriber count
    setPlans(prevPlans => 
      prevPlans.map(p => p.name === currentSub.planName ? { ...p, subscribers: Math.max(0, p.subscribers - 1) } : p)
    );

    setIsDeleteSubModalOpen(false);
    toast.success(`Subscription ${currentSub.id} has been removed.`, 'Subscription Deleted');
    setCurrentSub(null);
  };

  // Plan Handlers
  const handleAddPlanSubmit = (e) => {
    e.preventDefault();
    if (!planFormData.name || !planFormData.price) {
      toast.error('Plan name and price are required.', 'Validation Error');
      return;
    }

    const nextIdNum = Math.max(...plans.map(p => parseInt(p.id.replace('PLAN', '')) || 0), 0) + 1;
    const formattedId = `PLAN${String(nextIdNum).padStart(3, '0')}`;

    const newPlan = {
      id: formattedId,
      name: planFormData.name,
      targetClass: planFormData.targetClass || 'All Classes',
      targetSubject: planFormData.targetSubject || 'All Subjects',
      price: parseFloat(planFormData.price),
      duration: planFormData.duration,
      features: planFormData.features,
      status: planFormData.status,
      subscribers: 0
    };

    setPlans(prev => [...prev, newPlan]);
    setIsAddPlanModalOpen(false);
    resetPlanForm();
    toast.success(`Plan "${newPlan.name}" for ${newPlan.targetClass} (${newPlan.targetSubject}) created.`, 'Plan Created');
  };

  const handleEditPlanClick = (plan) => {
    setCurrentPlan(plan);
    setPlanFormData({
      name: plan.name,
      targetClass: plan.targetClass || 'All Classes',
      targetSubject: plan.targetSubject || 'All Subjects',
      price: plan.price,
      duration: plan.duration,
      features: plan.features,
      status: plan.status
    });
    setIsEditPlanModalOpen(true);
  };

  const handleEditPlanSubmit = (e) => {
    e.preventDefault();
    if (!planFormData.name || !planFormData.price) {
      toast.error('Plan name and price are required.', 'Validation Error');
      return;
    }

    setPlans(prev => 
      prev.map(p => p.id === currentPlan.id ? { 
        ...p, 
        ...planFormData, 
        price: parseFloat(planFormData.price) 
      } : p)
    );
    setIsEditPlanModalOpen(false);
    resetPlanForm();
    toast.success(`Plan "${planFormData.name}" updated successfully.`, 'Plan Updated');
  };

  const handleDeletePlanClick = (plan) => {
    setCurrentPlan(plan);
    setIsDeletePlanModalOpen(true);
  };

  const handleDeletePlanConfirm = () => {
    setPlans(prev => prev.filter(p => p.id !== currentPlan.id));
    setIsDeletePlanModalOpen(false);
    toast.success(`Plan "${currentPlan.name}" has been deleted.`, 'Plan Deleted');
    setCurrentPlan(null);
  };

  // Helper date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter Logic (Subscriptions)
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = selectedPlanFilter === 'All' || sub.planName === selectedPlanFilter;
    const matchesStatus = selectedStatusFilter === 'All' || sub.status === selectedStatusFilter;
    const matchesClass = selectedClassFilter === 'All' || selectedClassFilter === 'All Classes' || sub.targetClass === selectedClassFilter;
    const matchesSubject = selectedSubjectFilter === 'All' || selectedSubjectFilter === 'All Subjects' || sub.targetSubject === selectedSubjectFilter;

    return matchesSearch && matchesPlan && matchesStatus && matchesClass && matchesSubject;
  });

  // Filter Logic (Plans)
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
      plan.features.toLowerCase().includes(planSearchTerm.toLowerCase());

    const matchesClass = planClassFilter === 'All' || planClassFilter === 'All Classes' || plan.targetClass === planClassFilter || plan.targetClass === 'All Classes';
    const matchesSubject = planSubjectFilter === 'All' || planSubjectFilter === 'All Subjects' || plan.targetSubject === planSubjectFilter || plan.targetSubject === 'All Subjects';

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Calculate statistics
  const totalSubscribers = subscriptions.length;
  const activeSubscribers = subscriptions.filter(s => s.status === 'Active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.price, 0);
  const pendingCount = subscriptions.filter(s => s.status === 'Pending').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Subscription Management</h1>
          <p className={styles.subtitle}>Manage customer pricing plans, subscriber states, billing cycles, and records.</p>
        </div>
        <div>
          {activeTab === 'subscriptions' ? (
            <button 
              className={styles.primaryButton}
              onClick={() => { resetSubForm(); setIsAddSubModalOpen(true); }}
            >
              <Plus size={18} />
              <span>Add Subscriber</span>
            </button>
          ) : (
            <button 
              className={styles.primaryButton}
              onClick={() => { resetPlanForm(); setIsAddPlanModalOpen(true); }}
            >
              <Plus size={18} />
              <span>Create Plan</span>
            </button>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#1B3A8C', backgroundColor: 'rgba(27, 58, 140, 0.08)' }}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Subscribers</span>
            <span className={styles.statValue}>{totalSubscribers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Subscriptions</span>
            <span className={styles.statValue}>{activeSubscribers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#7C5CFC', backgroundColor: 'rgba(124, 92, 252, 0.08)' }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Monthly Revenue (Active)</span>
            <span className={styles.statValue}>₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Approvals</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className={styles.tabSection}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'subscriptions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <Activity size={16} />
          <span>Subscriptions List</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'plans' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <Layers size={16} />
          <span>Subscription Plans</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'billing_cycles' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('billing_cycles')}
        >
          <Calendar size={16} />
          <span>Billing Cycle Rules</span>
        </button>
      </div>

      {/* Conditional Rendering based on selected tab */}
      {activeTab === 'subscriptions' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by student name or sub ID..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.controlsContainer}>
              <select 
                className={styles.filterSelect}
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
              >
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>{c === 'All Classes' ? 'All Classes' : c}</option>
                ))}
              </select>

              <select 
                className={styles.filterSelect}
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'All Subjects' ? 'All Subjects' : s}</option>
                ))}
              </select>

              <select 
                className={styles.filterSelect}
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
              >
                <option value="All">All Plans</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.name}>{plan.name}</option>
                ))}
              </select>

              <select 
                className={styles.filterSelect}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Student Name</th>
                  <th>Plan Details</th>
                  <th>Billing Cycle</th>
                  <th>Date Purchased</th>
                  <th>Expiry Date</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className={styles.cellId}>{sub.id}</td>
                      <td>
                        <span className={styles.studentName}>{sub.studentName}</span>
                      </td>
                      <td>
                        <div className={styles.planDetailsCell}>
                          <span className={styles.planNameText}>{sub.planName}</span>
                          <span className={styles.planBillingText}>₹{sub.price}</span>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span className={styles.scopeTagClass} style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <BookOpen size={10} /> {sub.targetClass || 'All Classes'}
                            </span>
                            <span className={styles.scopeTagSubject} style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <GraduationCap size={10} /> {sub.targetSubject || 'All Subjects'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.scopeTagClass} style={{ fontSize: '11px', padding: '3px 8px', fontWeight: '700', textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {sub.duration || 'Monthly'}
                        </span>
                      </td>
                      <td>{formatDate(sub.purchaseDate)}</td>
                      <td>{formatDate(sub.expiryDate)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          sub.status === 'Active' ? styles.statusActive : 
                          sub.status === 'Pending' ? styles.statusPending : 
                          styles.statusExpired
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.iconButton} 
                            onClick={() => handleEditSubClick(sub)}
                            title="Edit Subscription"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={`${styles.iconButton} ${styles.danger}`} 
                            onClick={() => handleDeleteSubClick(sub)}
                            title="Cancel/Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                      No subscriptions found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.paginationInfo}>
              Showing {filteredSubscriptions.length} of {subscriptions.length} subscribers
            </span>
            <div className={styles.paginationControls}>
              <button className={styles.pageButton} disabled>Previous</button>
              <button className={`${styles.pageButton} ${styles.activePage}`}>1</button>
              <button className={styles.pageButton} disabled>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab view */}
      {activeTab === 'plans' && (
        <div>

          <div className={styles.plansHeaderBar}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search plans by name or feature..." 
                className={styles.searchInput}
                value={planSearchTerm}
                onChange={(e) => setPlanSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.controlsContainer}>
              <select 
                className={styles.filterSelect}
                value={planClassFilter}
                onChange={(e) => setPlanClassFilter(e.target.value)}
              >
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>{c === 'All Classes' ? 'Class (All)' : c}</option>
                ))}
              </select>

              <select 
                className={styles.filterSelect}
                value={planSubjectFilter}
                onChange={(e) => setPlanSubjectFilter(e.target.value)}
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'All Subjects' ? 'Subject (All)' : s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.plansContainer}>
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <div key={plan.id} className={`${styles.planCard} ${plan.status !== 'Active' ? styles.planInactive : ''}`}>
                  <div className={styles.planCardHeader}>
                    <div className={styles.planBadge}>{plan.duration}</div>
                    <div className={styles.planActions}>
                      <button className={styles.planActionBtn} onClick={() => handleEditPlanClick(plan)} title="Edit Plan">
                        <Edit2 size={14} />
                      </button>
                      <button className={`${styles.planActionBtn} ${styles.planActionDanger}`} onClick={() => handleDeletePlanClick(plan)} title="Delete Plan">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className={styles.planName}>{plan.name}</h3>

                  <div className={styles.planScopeBadges}>
                    <span className={styles.scopeTagClass}>
                      <BookOpen size={13} /> {plan.targetClass || 'All Classes'}
                    </span>
                    <span className={styles.scopeTagSubject}>
                      <GraduationCap size={13} /> {plan.targetSubject || 'All Subjects'}
                    </span>
                  </div>
                  
                  <div className={styles.planPricing}>
                    <span className={styles.planCurrency}>₹</span>
                    <span className={styles.planAmount}>{plan.price.toLocaleString('en-IN')}</span>
                    <span className={styles.planSlash}>/</span>
                    <span className={styles.planDurationText}>{plan.duration.toLowerCase()}</span>
                  </div>
                  
                  <div className={styles.planStats}>
                    <span className={styles.planStatLabel}>Active Members:</span>
                    <span className={styles.planStatValue}>{plan.subscribers}</span>
                  </div>

                  <hr className={styles.planDivider} />
                  
                  <div className={styles.featuresList}>
                    <p className={styles.featuresHeading}>Included Features:</p>
                    <ul>
                      {plan.features.split(',').map((feat, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          <Check size={14} className={styles.featureIcon} />
                          <span>{feat.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.planCardFooter}>
                    <span className={`${styles.statusLabelBadge} ${plan.status === 'Active' ? styles.statusActive : styles.statusExpired}`}>
                      {plan.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                No subscription plans found for the selected class/subject filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Billing Cycles & Pricing Rules Tab view */}
      {activeTab === 'billing_cycles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Card 2: Global Billing Cycle Discount Percentage Rules */}
          <div className={styles.card} style={{ padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#1B3A8C" />
                Global Billing Cycle Discount Rules (%)
              </h3>
              <p style={{ color: '#64748B', fontSize: '13.5px', margin: '4px 0 0 0' }}>
                Configure platform-default discount percentages applied automatically to custom subject subscription calculations.
              </p>
            </div>

            <form onSubmit={handleSaveCycleSettings} style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Monthly Billing Cycle</label>
                <input 
                  type="text" 
                  disabled 
                  value="Standard Monthly Base Rate (0% Discount)" 
                  className={styles.formInput}
                  style={{ background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quarterly Billing Cycle Discount (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  required
                  className={styles.formInput}
                  value={cycleSettings.quarterlyDiscount}
                  onChange={(e) => setCycleSettings({ ...cycleSettings, quarterlyDiscount: Number(e.target.value) })}
                  placeholder="10"
                />
                <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Applied to 3-month total base price. Example: ₹500/mo × 3 = ₹1,500 - 10% = ₹1,350.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yearly Billing Cycle Discount (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  required
                  className={styles.formInput}
                  value={cycleSettings.yearlyDiscount}
                  onChange={(e) => setCycleSettings({ ...cycleSettings, yearlyDiscount: Number(e.target.value) })}
                  placeholder="20"
                />
                <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Applied to 12-month total base price. Example: ₹500/mo × 12 = ₹6,000 - 20% = ₹4,800.
                </span>
              </div>

              <div>
                <button type="submit" className={styles.primaryButton} style={{ marginTop: '8px' }}>
                  Save Billing Cycle Discounts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals for Subscriptions */}
      
      {/* Add Subscription Modal */}
      {isAddSubModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Student Subscription</h2>
              <button className={styles.closeButton} onClick={() => setIsAddSubModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Student Full Name *</label>
                  <input 
                    type="text" 
                    name="studentName" 
                    required 
                    placeholder="e.g. Rahul Sharma"
                    className={styles.formInput}
                    value={subFormData.studentName}
                    onChange={handleSubInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Subscription Plan *</label>
                  <select 
                    name="planName"
                    className={styles.formSelect}
                    value={subFormData.planName}
                    onChange={handleSubInputChange}
                  >
                    {plans.filter(p => p.status === 'Active').map(p => (
                      <option key={p.id} value={p.name}>{p.name} (₹{p.price} / {p.duration})</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Date *</label>
                    <input 
                      type="date" 
                      name="purchaseDate" 
                      required 
                      className={styles.formInput}
                      value={subFormData.purchaseDate}
                      onChange={handleSubInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Expiry Date *</label>
                    <input 
                      type="date" 
                      name="expiryDate" 
                      required 
                      className={styles.formInput}
                      value={subFormData.expiryDate}
                      onChange={handleSubInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Payment Status</label>
                  <select 
                    name="status"
                    className={styles.formSelect}
                    value={subFormData.status}
                    onChange={handleSubInputChange}
                  >
                    <option value="Active">Active / Paid</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsAddSubModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {isEditSubModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modify Subscription Details</h2>
              <button className={styles.closeButton} onClick={() => setIsEditSubModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Student Full Name *</label>
                  <input 
                    type="text" 
                    name="studentName" 
                    required 
                    className={styles.formInput}
                    value={subFormData.studentName}
                    onChange={handleSubInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subscription Plan *</label>
                  <select 
                    name="planName"
                    className={styles.formSelect}
                    value={subFormData.planName}
                    onChange={handleSubInputChange}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name} (₹{p.price} / {p.duration})</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Date *</label>
                    <input 
                      type="date" 
                      name="purchaseDate" 
                      required 
                      className={styles.formInput}
                      value={subFormData.purchaseDate}
                      onChange={handleSubInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Expiry Date *</label>
                    <input 
                      type="date" 
                      name="expiryDate" 
                      required 
                      className={styles.formInput}
                      value={subFormData.expiryDate}
                      onChange={handleSubInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subscription Status</label>
                  <select 
                    name="status"
                    className={styles.formSelect}
                    value={subFormData.status}
                    onChange={handleSubInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsEditSubModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subscription Modal */}
      {isDeleteSubModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Cancel Subscription</h2>
              <button className={styles.closeButton} onClick={() => setIsDeleteSubModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to cancel the subscription of student <strong>{currentSub?.studentName}</strong> (ID: {currentSub?.id})?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This action is simulated and will only affect local memory. The changes will reset on page reload.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeleteSubModalOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.primaryButton} 
                style={{ backgroundColor: 'var(--color-error)' }}
                onClick={handleDeleteSubConfirm}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Plans */}

      {/* Add Plan Modal */}
      {isAddPlanModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Subscription Plan</h2>
              <button className={styles.closeButton} onClick={() => setIsAddPlanModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPlanSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Pro Learn"
                    className={styles.formInput}
                    value={planFormData.name}
                    onChange={handlePlanInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Class *</label>
                    <select 
                      name="targetClass"
                      className={styles.formSelect}
                      value={planFormData.targetClass}
                      onChange={handlePlanInputChange}
                    >
                      {CLASS_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Subject *</label>
                    <select 
                      name="targetSubject"
                      className={styles.formSelect}
                      value={planFormData.targetSubject}
                      onChange={handlePlanInputChange}
                    >
                      {SUBJECT_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price (₹ INR) *</label>
                    <input 
                      type="number" 
                      name="price" 
                      required 
                      placeholder="e.g. 1999"
                      className={styles.formInput}
                      value={planFormData.price}
                      onChange={handlePlanInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Duration Cycle *</label>
                    <select 
                      name="duration"
                      className={styles.formSelect}
                      value={planFormData.duration}
                      onChange={handlePlanInputChange}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Included Features * (comma separated)</label>
                  <textarea 
                    name="features" 
                    required 
                    placeholder="Access to Syllabus, 10 Mock Tests, 24/7 AI Tutor"
                    rows="3"
                    className={styles.formInput}
                    style={{ resize: 'vertical' }}
                    value={planFormData.features}
                    onChange={handlePlanInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select 
                    name="status"
                    className={styles.formSelect}
                    value={planFormData.status}
                    onChange={handlePlanInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsAddPlanModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditPlanModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modify Plan Settings</h2>
              <button className={styles.closeButton} onClick={() => setIsEditPlanModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditPlanSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className={styles.formInput}
                    value={planFormData.name}
                    onChange={handlePlanInputChange}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Class *</label>
                    <select 
                      name="targetClass"
                      className={styles.formSelect}
                      value={planFormData.targetClass}
                      onChange={handlePlanInputChange}
                    >
                      {CLASS_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Target Subject *</label>
                    <select 
                      name="targetSubject"
                      className={styles.formSelect}
                      value={planFormData.targetSubject}
                      onChange={handlePlanInputChange}
                    >
                      {SUBJECT_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price (₹ INR) *</label>
                    <input 
                      type="number" 
                      name="price" 
                      required 
                      className={styles.formInput}
                      value={planFormData.price}
                      onChange={handlePlanInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Duration Cycle *</label>
                    <select 
                      name="duration"
                      className={styles.formSelect}
                      value={planFormData.duration}
                      onChange={handlePlanInputChange}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Included Features * (comma separated)</label>
                  <textarea 
                    name="features" 
                    required 
                    rows="3"
                    className={styles.formInput}
                    style={{ resize: 'vertical' }}
                    value={planFormData.features}
                    onChange={handlePlanInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select 
                    name="status"
                    className={styles.formSelect}
                    value={planFormData.status}
                    onChange={handlePlanInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsEditPlanModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Plan Modal */}
      {isDeletePlanModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: 'var(--color-error)' }}>Delete Plan</h2>
              <button className={styles.closeButton} onClick={() => setIsDeletePlanModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to completely delete the plan <strong>{currentPlan?.name}</strong>?</p>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                This plan currently has <strong>{currentPlan?.subscribers}</strong> active subscribers.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeletePlanModalOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.primaryButton} 
                style={{ backgroundColor: 'var(--color-error)' }}
                onClick={handleDeletePlanConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
