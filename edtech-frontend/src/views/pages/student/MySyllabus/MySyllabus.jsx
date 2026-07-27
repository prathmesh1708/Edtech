import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, Zap, CheckSquare, Square, CreditCard, Lock, XCircle } from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useSyllabusController from '../../../../controllers/useSyllabusController';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';

const s = {
  header: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)',
    marginBottom: 'var(--space-6)'
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
    alignItems: 'center',
    marginTop: 'var(--space-4)'
  },
  select: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    outline: 'none',
    background: 'var(--color-surface)'
  },
  builderCard: {
    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    color: '#ffffff',
    marginBottom: 'var(--space-8)',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    overflow: 'hidden'
  },
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-8)'
  },
  planCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'all 0.3s'
  },
  grid: {
    width: '100%'
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px dashed var(--color-border)',
    marginTop: 'var(--space-4)'
  }
};

const MySyllabus = () => {
  const {
    selectedBoard,
    selectedClass,
    subjects,
    allSubjects,
    plans,
    selectedPlanId,
    currentPlan,
    subjectPricing,
    userSubscriptionStatus,
    paymentMessage,
    selectPlan,
    createCustomPlan,
    initiateRazorpayPayment,
    loading,
    selectBoard,
    selectClass,
    refreshSubjects
  } = useSyllabusController();
  const navigate = useNavigate();

  // Custom Builder State
  const [customSelectedSubjects, setCustomSelectedSubjects] = useState([]);
  const [customDuration, setCustomDuration] = useState('Monthly');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const handleSubjectToggle = (subjName) => {
    setCustomSelectedSubjects(prev => 
      prev.includes(subjName) ? prev.filter(s => s !== subjName) : [...prev, subjName]
    );
  };

  const handleSelectAllSubjects = () => {
    const allNames = (allSubjects || subjects).map(s => s.name);
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

  const activeRate = customDuration === 'Yearly'
    ? (subjectPricing?.perSubjectYearly || 3999)
    : customDuration === 'Quarterly'
    ? (subjectPricing?.perSubjectQuarterly || 1299)
    : (subjectPricing?.perSubjectMonthly || 499);

  const calculatedTotalPrice = customSelectedSubjects.length * activeRate;

  const handleActivateCustomPlan = () => {
    if (customSelectedSubjects.length === 0) return;
    createCustomPlan(customSelectedSubjects, customDuration);
  };

  const handleSubjectClick = (subjectId) => {
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const selectedBoardObj = BOARDS.find(b => b.id === selectedBoard) || { name: selectedBoard?.toUpperCase() };
  const selectedClassObj = CLASSES.find(c => String(c.id) === selectedClass) || { name: `Class ${selectedClass}` };
  const availableSubjectList = allSubjects && allSubjects.length > 0 ? allSubjects : subjects;

  return (
    <div>
      {/* Page Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Syllabus & Subscription Hub</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Choose a preset subscription plan or build a custom subject-wise plan tailored to your needs.
            </p>
          </div>
          <button
            onClick={refreshSubjects}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div style={s.filterRow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Board</span>
            <select
              style={s.select}
              value={selectedBoard}
              onChange={(e) => selectBoard(e.target.value)}
            >
              {BOARDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Class</span>
            <select
              style={s.select}
              value={selectedClass}
              onChange={(e) => selectClass(e.target.value)}
            >
              {CLASSES.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="primary" size="sm">ADMIN CURATED</Badge>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            Official Syllabus set & verified by <b>Academic Admin Council</b> for <b>{selectedBoardObj.name} {selectedClassObj.name}</b>
          </span>
        </div>
      </div>

      {/* Razorpay Payment Status Banner */}
      {paymentMessage && (
        <div style={{
          marginBottom: 'var(--space-6)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          background: userSubscriptionStatus === 'ACTIVE' 
            ? 'linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)' 
            : 'linear-gradient(90deg, #FEF2F2 0%, #FEE2E2 100%)',
          border: userSubscriptionStatus === 'ACTIVE' 
            ? '1.5px solid #22C55E' 
            : '1.5px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
        }}>
          {userSubscriptionStatus === 'ACTIVE' ? (
            <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: userSubscriptionStatus === 'ACTIVE' ? '#14532D' : '#7F1D1D' }}>
              {userSubscriptionStatus === 'ACTIVE' ? 'Razorpay Payment Successful' : 'Razorpay Payment Failed / Canceled'}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: userSubscriptionStatus === 'ACTIVE' ? '#166534' : '#991B1B' }}>
              {paymentMessage}
            </p>
          </div>
        </div>
      )}

      {/* Custom Subject-Wise Subscription Builder Section */}
      <div style={s.builderCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="warning" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#FDE047', border: '1px solid rgba(253, 224, 71, 0.4)' }}>
                CUSTOM PLAN BUILDER
              </Badge>
              <span style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: '500' }}>Subject-Wise Pricing Set by Admin</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
              Build Your Custom Subject Subscription ({selectedClassObj.name})
            </h3>
            <p style={{ fontSize: '13.5px', color: '#E2E8F0', marginTop: '6px', maxWidth: '640px', lineHeight: '1.5' }}>
              Select specific subjects from the dropdown below. Pricing is automatically calculated per subject based on Admin rate (<b>₹{activeRate}/{customDuration.toLowerCase()}</b> per subject).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'right' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#CBD5E1', fontWeight: '700', display: 'block' }}>CALCULATED TOTAL PRICE</span>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#86EFAC' }}>
              ₹{calculatedTotalPrice}
            </span>
            <span style={{ fontSize: '11px', color: '#E2E8F0', display: 'block' }}>
              ({customSelectedSubjects.length} {customSelectedSubjects.length === 1 ? 'subject' : 'subjects'} x ₹{activeRate})
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'rgba(0, 0, 0, 0.25)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          {/* Subject Dropdown Select */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#FFFFFF', display: 'block', marginBottom: '6px' }}>
              1. Select Subject from Dropdown:
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                background: '#1E1B4B',
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: '13px',
                outline: 'none'
              }}
              value=""
              onChange={handleSubjectDropdownSelect}
            >
              <option value="" disabled style={{ background: '#1E1B4B', color: '#FFFFFF' }}>-- Click to Select Subject --</option>
              <option value="ALL" style={{ background: '#1E1B4B', color: '#86EFAC' }}>✨ Select All Available Subjects ({availableSubjectList.length})</option>
              {availableSubjectList.map(subj => (
                <option key={subj.id || subj.name} value={subj.name} style={{ background: '#1E1B4B', color: '#FFFFFF' }}>
                  📚 {subj.name} ({subj.code || selectedClassObj.name})
                </option>
              ))}
            </select>
          </div>

          {/* Billing Cycle Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#FFFFFF', display: 'block', marginBottom: '6px' }}>
              2. Select Billing Cycle:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Monthly', 'Quarterly', 'Yearly'].map(cycle => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setCustomDuration(cycle)}
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: customDuration === cycle ? '#86EFAC' : 'rgba(255, 255, 255, 0.1)',
                    color: customDuration === cycle ? '#064E3B' : '#ffffff',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          {/* Activate Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              disabled={customSelectedSubjects.length === 0}
              onClick={handleActivateCustomPlan}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: customSelectedSubjects.length > 0 ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
                color: customSelectedSubjects.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: '800',
                fontSize: '13px',
                cursor: customSelectedSubjects.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: customSelectedSubjects.length > 0 ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={16} />
              {customSelectedSubjects.length > 0 
                ? `Pay ₹${calculatedTotalPrice} via Razorpay` 
                : 'Select at least 1 subject'}
            </button>
          </div>
        </div>

        {/* Selected Subject Chips / Quick Checkboxes */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#FFFFFF' }}>
              SELECTED SUBJECTS ({customSelectedSubjects.length}):
            </span>
            <button
              type="button"
              onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
              style={{ background: 'none', border: 'none', color: '#FDE047', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
            >
              {subjectDropdownOpen ? 'Hide Subject Checkboxes' : 'Toggle Quick Checkboxes'}
            </button>
          </div>

          {/* Selected Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {customSelectedSubjects.length === 0 ? (
              <span style={{ fontSize: '12.5px', color: '#CBD5E1', fontStyle: 'italic' }}>
                No subjects selected yet. Use the dropdown above or check boxes to select subjects.
              </span>
            ) : (
              customSelectedSubjects.map(sName => (
                <span
                  key={sName}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={13} color="#86EFAC" />
                  {sName}
                  <span
                    onClick={() => handleSubjectRemove(sName)}
                    style={{ cursor: 'pointer', color: '#FFFFFF', opacity: 0.9, paddingLeft: '4px', fontWeight: '800' }}
                  >
                    ×
                  </span>
                </span>
              ))
            )}
          </div>

          {/* Quick Checkboxes list */}
          {subjectDropdownOpen && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {availableSubjectList.map(subj => {
                const checked = customSelectedSubjects.includes(subj.name);
                return (
                  <div
                    key={subj.id || subj.name}
                    onClick={() => handleSubjectToggle(subj.name)}
                    style={{
                      background: checked ? 'rgba(134, 239, 172, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: checked ? '1px solid #86EFAC' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {checked ? <CheckSquare size={16} color="#86EFAC" /> : <Square size={16} color="rgba(255, 255, 255, 0.6)" />}
                    <span style={{ color: '#FFFFFF' }}>{subj.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Plans Section (4 Dynamic Cards from Admin Panel) */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-primary)" />
            Preset Subscription Plans (Admin Panel)
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Click to pay & activate plan via Razorpay
          </span>
        </div>

        <div style={s.planGrid}>
          {plans.map((plan) => {
            const planId = plan._id || plan.id;
            const isSelected = selectedPlanId === planId && userSubscriptionStatus === 'ACTIVE';
            const durationLower = (plan.duration || 'Monthly').toLowerCase();

            return (
              <div
                key={planId}
                style={{
                  ...s.planCard,
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border-light)',
                  boxShadow: isSelected ? '0 8px 24px rgba(79, 110, 247, 0.18)' : 'var(--shadow-sm)',
                  background: isSelected ? 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' : 'var(--color-surface)'
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
                    <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#4F6EF7', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {plan.targetClass || 'All Classes'}
                    </span>
                    <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
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

                  <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
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

      {/* Subjects Grid (Filtered by Selected Plan) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
            Unlocked Subjects ({selectedBoardObj.name} - {selectedClassObj.name})
          </h3>
          {currentPlan && userSubscriptionStatus === 'ACTIVE' && (
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>
              Filtered by Active Subscription: {currentPlan.name} ({currentPlan.targetSubject || 'All Subjects'})
            </span>
          )}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          {userSubscriptionStatus === 'FAILED' ? 0 : subjects.length} Subjects accessible
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading dynamic syllabus from backend...
        </div>
      ) : userSubscriptionStatus === 'FAILED' ? (
        <div style={{ ...s.emptyState, background: '#FEF2F2', borderColor: '#FCA5A5' }}>
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
        <div style={s.grid} className="responsive-grid-3">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              style={s.card}
              className="subject-card-hover"
              onClick={() => handleSubjectClick(subj.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `${subj.color}14`, color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--color-text-primary)' }}>{subj.name}</h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    {subj.chapterCount} {subj.chapterCount === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-tertiary)" />
            </div>
          ))}
        </div>
      ) : (
        <div style={s.emptyState}>
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
