import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  CheckSquare, 
  Square, 
  CreditCard, 
  Lock, 
  XCircle 
} from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useSyllabusController from '../../../../controllers/useSyllabusController';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import styles from './MySyllabus.module.css';

const MySyllabus = () => {
  const navigate = useNavigate();
  const {
    subjects,
    allSubjects,
    plans,
    currentPlan,
    loading,
    selectedBoard,
    selectedClass,
    selectedPlanId,
    userSubscriptionStatus,
    paymentMessage,
    subjectPricing,
    cycleSettings,
    selectBoard,
    selectClass,
    selectPlan,
    createCustomPlan,
    initiateRazorpayPayment,
    refreshSubjects
  } = useSyllabusController();

  // Custom Builder Local State
  const [customSelectedSubjects, setCustomSelectedSubjects] = useState([]);
  const [customDuration, setCustomDuration] = useState('Monthly');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const handleSubjectToggle = (subjName) => {
    setCustomSelectedSubjects(prev => 
      prev.includes(subjName) ? prev.filter(s => s !== subjName) : [...prev, subjName]
    );
  };

  const handleSelectAllSubjects = () => {
    const allNames = (allSubjects || subjects || []).map(s => s.name || s.subjectName);
    setCustomSelectedSubjects(allNames);
  };

  const handleSubjectDropdownSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (val === 'ALL') {
      handleSelectAllSubjects();
    } else if (!customSelectedSubjects.includes(val)) {
      setCustomSelectedSubjects(prev => [...prev, val]);
    }
  };

  const handleSubjectRemove = (subjName) => {
    setCustomSelectedSubjects(prev => prev.filter(s => s !== subjName));
  };

  // Dynamic Subject-Wise Pricing Calculation based on backend & admin rules
  const baseMonthlyPrice = subjectPricing?.perSubjectMonthly || 499;
  const qDiscount = cycleSettings?.quarterlyDiscount || 10;
  const yDiscount = cycleSettings?.yearlyDiscount || 20;

  const count = (customSelectedSubjects || []).length;
  let grossPrice = 0;
  let calculatedTotalPrice = 0;
  let savingsAmount = 0;
  let activeDiscountLabel = '';

  if (customDuration === 'Yearly') {
    grossPrice = count * baseMonthlyPrice * 12;
    const discAmount = grossPrice * (yDiscount / 100);
    calculatedTotalPrice = Math.round(grossPrice - discAmount);
    savingsAmount = Math.round(discAmount);
    activeDiscountLabel = `${yDiscount}% Admin Yearly Discount`;
  } else if (customDuration === 'Quarterly') {
    grossPrice = count * baseMonthlyPrice * 3;
    const discAmount = grossPrice * (qDiscount / 100);
    calculatedTotalPrice = Math.round(grossPrice - discAmount);
    savingsAmount = Math.round(discAmount);
    activeDiscountLabel = `${qDiscount}% Admin Quarterly Discount`;
  } else {
    grossPrice = count * baseMonthlyPrice;
    calculatedTotalPrice = grossPrice;
    savingsAmount = 0;
    activeDiscountLabel = 'Standard Monthly Rate';
  }

  const handleActivateCustomPlan = () => {
    if (customSelectedSubjects.length === 0) return;
    createCustomPlan(customSelectedSubjects, customDuration);
  };

  const isSubscribed = userSubscriptionStatus === 'ACTIVE';

  const handleSubjectClick = (subjectId) => {
    if (!isSubscribed) {
      alert('Subscription plan required to access course content! Please select and purchase a plan below.');
      const plansSection = document.getElementById('subscription-plans-section');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const selectedBoardObj = BOARDS.find(b => b.id === selectedBoard) || { name: selectedBoard?.toUpperCase() };
  const selectedClassObj = CLASSES.find(c => String(c.id) === selectedClass) || { name: `Class ${selectedClass}` };
  const availableSubjectList = allSubjects && allSubjects.length > 0 ? allSubjects : subjects;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.headerTitle}>Syllabus & Subscription Hub</h2>
            <p className={styles.headerSubtitle}>
              Choose a preset subscription plan or build a custom subject-wise plan tailored to your needs.
            </p>
          </div>

          <button
            onClick={refreshSubjects}
            className={styles.refreshButton}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>BOARD</span>
            <select
              className={styles.filterSelect}
              value={selectedBoard}
              onChange={(e) => selectBoard(e.target.value)}
            >
              {BOARDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>CLASS</span>
            <select
              className={styles.filterSelect}
              value={selectedClass}
              onChange={(e) => selectClass(e.target.value)}
            >
              {CLASSES.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Status Banner */}
      {paymentMessage && (
        <div className={`${styles.paymentBanner} ${userSubscriptionStatus === 'ACTIVE' ? styles.paymentBannerSuccess : styles.paymentBannerError}`}>
          {userSubscriptionStatus === 'ACTIVE' ? (
            <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <h4 className={styles.paymentBannerTitle} style={{ color: userSubscriptionStatus === 'ACTIVE' ? '#14532D' : '#7F1D1D' }}>
              {userSubscriptionStatus === 'ACTIVE' ? 'Razorpay Payment Successful' : 'Razorpay Payment Failed / Canceled'}
            </h4>
            <p className={styles.paymentBannerText} style={{ color: userSubscriptionStatus === 'ACTIVE' ? '#166534' : '#991B1B' }}>
              {paymentMessage}
            </p>
          </div>
        </div>
      )}

      {/* Custom Subject-Wise Subscription Builder Section */}
      <div className={styles.builderCard}>
        <div className={styles.builderTop}>
          <div className={styles.builderInfo}>
            <div className={styles.builderBadgeRow}>
              <Badge variant="warning" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#FDE047', border: '1px solid rgba(253, 224, 71, 0.4)' }}>
                CUSTOM PLAN BUILDER
              </Badge>
              <span className={styles.builderSubText}>Subject-Wise Pricing Set by Admin</span>
            </div>
            <h3 className={styles.builderTitle}>
              Build Your Custom Subject Subscription ({selectedClassObj.name})
            </h3>
            <p className={styles.builderDesc}>
              Select specific subjects from the dropdown below. Base Rate: <b>₹{baseMonthlyPrice}/mo</b> per subject. Discounts configured by Admin: <b>{qDiscount}% OFF Quarterly</b> & <b>{yDiscount}% OFF Yearly</b>.
            </p>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.priceBoxLabel}>CALCULATED TOTAL PRICE</span>
            <div className={styles.priceRow}>
              {savingsAmount > 0 && (
                <span className={styles.priceGross}>
                  ₹{grossPrice}
                </span>
              )}
              <span className={styles.priceNet}>
                ₹{calculatedTotalPrice}
              </span>
            </div>
            {savingsAmount > 0 ? (
              <span className={styles.priceSavings}>
                🔥 SAVE ₹{savingsAmount} ({activeDiscountLabel})
              </span>
            ) : (
              <span className={styles.priceStandard}>
                {customSelectedSubjects.length} {customSelectedSubjects.length === 1 ? 'subject' : 'subjects'} (Standard Rate)
              </span>
            )}
          </div>
        </div>

        <div className={styles.builderForm}>
          {/* Subject Dropdown Select */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              1. Select Subject from Dropdown:
            </label>
            <select
              className={styles.subjectSelect}
              value=""
              onChange={handleSubjectDropdownSelect}
            >
              <option value="" disabled style={{ background: '#1E1B4B', color: '#FFFFFF' }}>-- Click to Select Subject --</option>
              <option value="ALL" style={{ background: '#1E1B4B', color: '#86EFAC' }}>✨ Select All Available Subjects ({availableSubjectList.length})</option>
              {availableSubjectList.map(subj => {
                const sName = subj.name || subj.subjectName;
                return (
                  <option key={subj.id || subj._id || sName} value={sName} style={{ background: '#1E1B4B', color: '#FFFFFF' }}>
                    📚 {sName} ({subj.code || subj.subjectCode || selectedClassObj.name})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Billing Cycle Selector */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              2. Select Billing Cycle:
            </label>
            <div className={styles.billingCycles}>
              {[
                { id: 'Monthly', label: 'Monthly', badge: 'Base Rate' },
                { id: 'Quarterly', label: 'Quarterly', badge: `${qDiscount}% OFF` },
                { id: 'Yearly', label: 'Yearly', badge: `${yDiscount}% OFF` }
              ].map(cycle => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setCustomDuration(cycle.id)}
                  className={`${styles.cycleBtn} ${customDuration === cycle.id ? styles.cycleBtnActive : ''}`}
                >
                  <span>{cycle.label}</span>
                  <span className={styles.cycleBadge}>
                    {cycle.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Activate Button */}
          <div className={styles.activateBtnWrap}>
            <button
              type="button"
              disabled={customSelectedSubjects.length === 0}
              onClick={handleActivateCustomPlan}
              className={`${styles.activateBtn} ${customSelectedSubjects.length > 0 ? styles.activateBtnEnabled : styles.activateBtnDisabled}`}
            >
              <CreditCard size={16} />
              {customSelectedSubjects.length > 0 
                ? `Pay ₹${calculatedTotalPrice} via Razorpay` 
                : 'Select at least 1 subject'}
            </button>
          </div>
        </div>

        {/* Selected Subject Chips / Quick Checkboxes */}
        <div className={styles.selectedContainer}>
          <div className={styles.selectedHeader}>
            <span className={styles.selectedHeading}>
              SELECTED SUBJECTS ({customSelectedSubjects.length}):
            </span>
            <button
              type="button"
              onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
              className={styles.toggleCheckboxBtn}
            >
              {subjectDropdownOpen ? 'Hide Subject Checkboxes' : 'Toggle Quick Checkboxes'}
            </button>
          </div>

          {/* Selected Pills */}
          <div className={styles.selectedPills}>
            {customSelectedSubjects.length === 0 ? (
              <span className={styles.emptyPillsText}>
                No subjects selected yet. Use the dropdown above or check boxes to select subjects.
              </span>
            ) : (
              customSelectedSubjects.map(sName => (
                <span
                  key={sName}
                  className={styles.subjectChip}
                >
                  <CheckCircle2 size={13} color="#86EFAC" />
                  {sName}
                  <span
                    onClick={() => handleSubjectRemove(sName)}
                    className={styles.removeChipBtn}
                  >
                    ×
                  </span>
                </span>
              ))
            )}
          </div>

          {/* Quick Checkboxes list */}
          {subjectDropdownOpen && (
            <div className={styles.checkboxesGrid}>
              {availableSubjectList.map(subj => {
                const sName = subj.name || subj.subjectName;
                const checked = customSelectedSubjects.includes(sName);
                return (
                  <div
                    key={subj.id || subj._id || sName}
                    onClick={() => handleSubjectToggle(sName)}
                    className={`${styles.checkboxCard} ${checked ? styles.checkboxCardActive : ''}`}
                  >
                    {checked ? <CheckSquare size={16} color="#86EFAC" /> : <Square size={16} color="rgba(255, 255, 255, 0.6)" />}
                    <span style={{ color: '#FFFFFF' }}>{sName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Plans Section (Dynamic Cards from Admin Panel) */}
      <div id="subscription-plans-section" style={{ marginBottom: 'var(--space-8)' }}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <ShieldCheck size={20} color="var(--color-primary)" />
            Preset Subscription Plans (Admin Panel)
          </h3>
          <span className={styles.sectionSubtitle}>
            Click to pay & activate plan via Razorpay
          </span>
        </div>

        <div className={styles.planGrid}>
          {plans && plans.map((plan) => {
            const planId = plan._id || plan.id;
            const isSelected = selectedPlanId === planId && userSubscriptionStatus === 'ACTIVE';
            const durationLower = (plan.duration || 'Monthly').toLowerCase();

            return (
              <div
                key={planId}
                className={styles.planCard}
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border-light)',
                  boxShadow: isSelected ? '0 8px 24px rgba(56, 189, 248, 0.18)' : 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Badge variant={durationLower.includes('year') ? 'primary' : durationLower.includes('quarter') ? 'warning' : 'neutral'} size="sm">
                      {(plan.duration || 'Monthly').toUpperCase()}
                    </Badge>
                    {isSelected && (
                      <Badge variant="success" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> ACTIVE PLAN
                      </Badge>
                    )}
                  </div>

                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                    {plan.name}
                  </h4>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {plan.targetClass || 'All Classes'}
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {plan.targetSubject || 'All Subjects'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      ₹{plan.price}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                      / {durationLower}
                    </span>
                  </div>

                  <div style={{ background: 'var(--color-bg)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Members:</span>
                    <b>{plan.subscribers || 1}</b>
                  </div>

                  {plan.features && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                        INCLUDED FEATURES:
                      </span>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {String(plan.features).split(',').map((feat, idx) => (
                          <li key={idx} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={13} color="var(--color-success)" />
                            <span>{feat.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  style={{ width: '100%', marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => initiateRazorpayPayment(plan)}
                >
                  <CreditCard size={14} />
                  {isSelected ? 'Active Plan (Pay to Extend)' : `Pay ₹${plan.price} via Razorpay`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>
            Unlocked Subjects ({selectedBoardObj.name} - {selectedClassObj.name})
          </h3>
          {currentPlan && userSubscriptionStatus === 'ACTIVE' && (
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>
              Filtered by Active Subscription: {currentPlan.name} ({currentPlan.targetSubject || 'All Subjects'})
            </span>
          )}
        </div>
        <span className={styles.sectionSubtitle}>
          {userSubscriptionStatus === 'FAILED' ? 0 : subjects.length} Subjects accessible
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          Loading dynamic syllabus from backend...
        </div>
      ) : userSubscriptionStatus === 'FAILED' ? (
        <div className={styles.emptyState} style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <Lock size={40} color="#DC2626" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '800', color: '#991B1B', marginBottom: '6px' }}>Subjects Locked — Razorpay Payment Required</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: '#B91C1C', maxWidth: '480px', margin: '0 auto 16px auto' }}>
            Your recent payment attempt failed or was canceled. Subjects remain locked until a valid Razorpay subscription payment is completed.
          </p>
          <Button variant="primary" style={{ background: '#DC2626', border: 'none' }} onClick={() => initiateRazorpayPayment(currentPlan || plans[0])}>
            Retry Razorpay Payment (₹{currentPlan?.price || 999})
          </Button>
        </div>
      ) : subjects.length > 0 ? (
        <div className={styles.subjectsGrid}>
          {subjects.map((subj) => (
            <div
              key={subj.id || subj._id}
              className={styles.subjectCard}
              onClick={() => handleSubjectClick(subj.id || subj._id)}
            >
              <div className={styles.subjectInfo}>
                <div 
                  className={styles.subjectIconWrap} 
                  style={{ background: `${subj.color || '#1A73E8'}14`, color: subj.color || '#1A73E8' }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className={styles.subjectName}>{subj.name || subj.subjectName}</h4>
                  <span className={styles.subjectCount}>
                    {subj.chapterCount || 0} {subj.chapterCount === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isSubscribed && (
                  <div className={styles.lockTag}>
                    <Lock size={12} />
                    <span>Locked</span>
                  </div>
                )}
                {isSubscribed ? (
                  <ChevronRight size={18} color="#94A3B8" />
                ) : (
                  <Lock size={18} color="#DC2626" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <AlertCircle size={36} color="var(--color-text-tertiary)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>No Subjects Included In This Plan</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            The selected plan (<b>{currentPlan?.name}</b>) target subject is <b>{currentPlan?.targetSubject}</b>. Switch to <b>Basic All-Access Pass</b> or another plan to view all subjects for {selectedBoardObj.name} {selectedClassObj.name}.
          </p>
          <Button variant="primary" size="sm" onClick={() => selectPlan('PLAN001')}>
            Switch to All-Access Pass
          </Button>
        </div>
      )}
    </div>
  );
};

export default MySyllabus;
