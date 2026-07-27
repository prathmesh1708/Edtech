import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useSyllabusController from '../../../../controllers/useSyllabusController';

const MySyllabus = () => {
  const {
    selectedBoard,
    selectedClass,
    subjects,
    loading,
    selectBoard,
    selectClass,
    refreshSubjects
  } = useSyllabusController();
  const navigate = useNavigate();

  // Custom Plan Builder State
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly', 'Quarterly', 'Yearly'
  const [showQuickCheckboxes, setShowQuickCheckboxes] = useState(true);

  const handleSubjectClick = (subjectId) => {
    navigate(generateRoute(ROUTES.SUBJECT_DETAIL, { subjectId }));
  };

  const selectedBoardObj = BOARDS.find(b => b.id === selectedBoard) || { name: selectedBoard?.toUpperCase() || 'CBSE' };
  const selectedClassObj = CLASSES.find(c => String(c.id) === selectedClass) || { name: `Class ${selectedClass || 10}` };

  const globalCycleSettings = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('admin_billing_cycle_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { quarterlyDiscount: 10, yearlyDiscount: 20 };
  }, []);

  // Available subjects for current board & class
  const availableSubjects = subjects.map(s => ({
    ...s,
    price: s.price && s.price > 0 ? s.price : 499,
    quarterlyDiscount: s.quarterlyDiscount !== undefined && s.quarterlyDiscount !== null ? s.quarterlyDiscount : globalCycleSettings.quarterlyDiscount,
    yearlyDiscount: s.yearlyDiscount !== undefined && s.yearlyDiscount !== null ? s.yearlyDiscount : globalCycleSettings.yearlyDiscount
  }));

  // Toggle subject selection
  const toggleSubjectSelection = (subjectId) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  // Dropdown add subject
  const handleDropdownSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (!selectedSubjectIds.includes(val)) {
      setSelectedSubjectIds(prev => [...prev, val]);
    }
  };

  // Calculate pricing
  const selectedSubjectsList = availableSubjects.filter(s => selectedSubjectIds.includes(s._id || s.id));
  
  const calculateTotal = () => {
    if (selectedSubjectsList.length === 0) return { rawTotal: 0, finalTotal: 0, savings: 0, months: 1 };

    let totalBase = 0;
    let finalTotal = 0;
    let months = 1;

    if (billingCycle === 'Monthly') {
      months = 1;
      totalBase = selectedSubjectsList.reduce((acc, s) => acc + s.price, 0) * 1;
      finalTotal = totalBase;
    } else if (billingCycle === 'Quarterly') {
      months = 3;
      totalBase = selectedSubjectsList.reduce((acc, s) => acc + (s.price * 3), 0);
      finalTotal = selectedSubjectsList.reduce((acc, s) => {
        const discount = (s.quarterlyDiscount || 10) / 100;
        return acc + Math.round(s.price * 3 * (1 - discount));
      }, 0);
    } else if (billingCycle === 'Yearly') {
      months = 12;
      totalBase = selectedSubjectsList.reduce((acc, s) => acc + (s.price * 12), 0);
      finalTotal = selectedSubjectsList.reduce((acc, s) => {
        const discount = (s.yearlyDiscount || 20) / 100;
        return acc + Math.round(s.price * 12 * (1 - discount));
      }, 0);
    }

    const savings = Math.max(0, totalBase - finalTotal);

    return {
      rawTotal: totalBase,
      finalTotal: Math.round(finalTotal),
      savings: Math.round(savings),
      months
    };
  };

  const { finalTotal, savings, months } = calculateTotal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Syllabus & Subscription Hub</h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px', margin: 0 }}>
              Choose a preset subscription plan or build a custom subject-wise plan tailored to your needs.
            </p>
          </div>

          <button
            onClick={refreshSubjects}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '700' }}>BOARD</span>
            <select
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
                minWidth: '140px'
              }}
              value={selectedBoard}
              onChange={(e) => selectBoard(e.target.value)}
            >
              {BOARDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '700' }}>CLASS</span>
            <select
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
                minWidth: '140px'
              }}
              value={selectedClass}
              onChange={(e) => selectClass(e.target.value)}
            >
              {CLASSES.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            ADMIN CURATED
          </span>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Official Syllabus set & verified by <strong>Academic Admin Council</strong> for {selectedBoardObj.name} {selectedClassObj.name}
          </span>
        </div>
      </div>

      {/* 2. Custom Plan Builder (Dark Blue Card) */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #2E1065 100%)',
        borderRadius: '20px',
        padding: '28px',
        color: '#FFFFFF',
        boxShadow: '0 12px 30px rgba(46, 16, 101, 0.25)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#FBBF24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontSize: '11px',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              CUSTOM PLAN BUILDER — Subject-Wise Pricing Set by Admin
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px', marginBottom: '6px' }}>
              Build Your Custom Subject Subscription ({selectedClassObj.name})
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Select specific subjects from the dropdown or checkboxes below. Pricing is automatically calculated per subject based on Admin rates.
            </p>
          </div>

          {/* Calculated Total Price Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '16px 24px',
            textAlign: 'right',
            minWidth: '220px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: '#94A3B8', textTransform: 'uppercase' }}>
              CALCULATED TOTAL PRICE
            </span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#34D399', margin: '4px 0' }}>
              ₹{finalTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
              ({selectedSubjectsList.length} {selectedSubjectsList.length === 1 ? 'subject' : 'subjects'} • {billingCycle})
            </div>
            {savings > 0 && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#FBBF24', fontWeight: '700' }}>
                🎉 You save ₹{savings.toLocaleString('en-IN')} ({billingCycle === 'Quarterly' ? '10%' : '20%'} Off)!
              </div>
            )}
          </div>
        </div>

        {/* Form Controls Row */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Step 1: Select Subject Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#94A3B8', marginBottom: '6px' }}>
              1. SELECT SUBJECT FROM DROPDOWN:
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none'
              }}
              onChange={handleDropdownSelect}
              value=""
            >
              <option value="" disabled>-- Click to Select Subject --</option>
              {availableSubjects.map(subj => (
                <option key={subj._id || subj.id} value={subj._id || subj.id}>
                  {subj.subjectName || subj.name} (₹{subj.price}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Billing Cycle */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#94A3B8', marginBottom: '6px' }}>
              2. SELECT BILLING CYCLE:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Monthly', 'Quarterly', 'Yearly'].map(cycle => {
                const isActive = billingCycle === cycle;
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
                      background: isActive ? '#34D399' : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#0F172A' : '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cycle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Checkout Action */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              disabled={selectedSubjectsList.length === 0}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: selectedSubjectsList.length > 0 ? '#2563EB' : 'rgba(255, 255, 255, 0.1)',
                color: selectedSubjectsList.length > 0 ? '#FFFFFF' : '#94A3B8',
                fontSize: '14px',
                fontWeight: '800',
                cursor: selectedSubjectsList.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selectedSubjectsList.length > 0 ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
                marginTop: '18px'
              }}
            >
              {selectedSubjectsList.length > 0 ? `Subscribe Now — ₹${finalTotal.toLocaleString('en-IN')}` : 'Select at least 1 subject'}
            </button>
          </div>
        </div>

        {/* Selected Subjects Quick Checkboxes */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '600' }}>
              SELECTED SUBJECTS ({selectedSubjectsList.length}):
            </span>
            <button 
              type="button" 
              onClick={() => setShowQuickCheckboxes(!showQuickCheckboxes)}
              style={{ background: 'none', border: 'none', color: '#FBBF24', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
            >
              {showQuickCheckboxes ? 'Hide Quick Checkboxes' : 'Toggle Quick Checkboxes'}
            </button>
          </div>

          {showQuickCheckboxes && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {availableSubjects.map(s => {
                const sId = s._id || s.id;
                const isSelected = selectedSubjectIds.includes(sId);
                return (
                  <label
                    key={sId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      border: isSelected ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#34D399' : '#CBD5E1',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSubjectSelection(sId)}
                      style={{ accentColor: '#34D399', cursor: 'pointer' }}
                    />
                    <span>{s.subjectName || s.name} (₹{s.price}/mo)</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Subjects Grid (Existing Syllabus Finder view) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
          Available Subjects ({selectedBoardObj.name} - {selectedClassObj.name})
        </h3>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {availableSubjects.length} {availableSubjects.length === 1 ? 'Subject' : 'Subjects'} available
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          Loading dynamic syllabus from backend...
        </div>
      ) : availableSubjects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {availableSubjects.map((subj) => {
            const sId = subj._id || subj.id;
            const isSelected = selectedSubjectIds.includes(sId);
            return (
              <div
                key={sId}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleSubjectClick(sId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${subj.color || '#1A73E8'}14`,
                    color: subj.color || '#1A73E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A', margin: '0 0 2px 0' }}>
                      {subj.subjectName || subj.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700' }}>
                      ₹{subj.price} / month
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color="#94A3B8" />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px dashed #CBD5E1'
        }}>
          <AlertCircle size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>No Subjects Found</h4>
          <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
            No active subjects registered for {selectedBoardObj.name} {selectedClassObj.name} yet. An Admin can add subjects in Subject Management.
          </p>
        </div>
      )}
    </div>
  );
};

export default MySyllabus;
