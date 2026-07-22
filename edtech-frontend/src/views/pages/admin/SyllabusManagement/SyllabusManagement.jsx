import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, BookOpen, Layers, X, Check, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import syllabusService from '../../../../models/services/syllabusService';
import { useSyllabusState } from '../../../../models/context/SyllabusContext';
import { useToast } from '../../../../views/components/common/Toast/Toast';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

const COLOR_OPTIONS = [
  '#4F6EF7', '#22C55E', '#F59E0B', '#EF4444', '#7C5CFC', '#3B82F6', '#10B981', '#EC4899', '#6366F1', '#14B8A6'
];

const s = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
    gap: 'var(--space-4)'
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
    alignItems: 'center',
    background: 'var(--color-surface)',
    padding: 'var(--space-4) var(--space-6)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-light)',
    marginBottom: 'var(--space-6)'
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
  subjectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 'var(--space-5)'
  },
  subjectCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '20px'
  },
  modalContent: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-2xl)',
    border: '1px solid var(--color-border-light)',
    padding: 'var(--space-6)'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: 'var(--space-4)'
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    outline: 'none'
  },
  chapterBox: {
    background: 'var(--color-bg)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 'var(--space-3)',
    border: '1px solid var(--color-border-light)'
  }
};

const SyllabusManagement = () => {
  const { selectedBoard, setSelectedBoard, selectedClass, setSelectedClass, refreshSubjects } = useSyllabusState();
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    board: 'cbse',
    class: '10',
    subjectName: '',
    subjectCode: '',
    description: '',
    color: '#4F6EF7',
    status: 'Published',
    chapters: []
  });

  const toast = useToast();

  const fetchSyllabusData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await syllabusService.getAllSyllabus({
        board: selectedBoard,
        class: selectedClass
      });
      setSyllabusList(res.data || []);
    } catch (err) {
      console.error('Error fetching syllabus data for admin:', err);
      toast?.error?.('Failed to load syllabus items.');
    } finally {
      setLoading(false);
    }
  }, [selectedBoard, selectedClass, toast]);

  useEffect(() => {
    fetchSyllabusData();
  }, [fetchSyllabusData]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      board: selectedBoard || 'cbse',
      class: selectedClass || '10',
      subjectName: '',
      subjectCode: '',
      description: '',
      color: '#4F6EF7',
      status: 'Published',
      chapters: [
        { title: 'Chapter 1: Overview & Intro', description: 'Basic fundamentals and core topics', progress: 0, topics: [{ name: 'Topic 1.1' }] }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      board: item.board || 'cbse',
      class: item.class || '10',
      subjectName: item.subjectName || '',
      subjectCode: item.subjectCode || '',
      description: item.description || '',
      color: item.color || '#4F6EF7',
      status: item.status || 'Published',
      chapters: item.chapters && item.chapters.length > 0 ? item.chapters.map(ch => ({
        title: ch.title || '',
        description: ch.description || '',
        progress: ch.progress || 0,
        topics: ch.topics && ch.topics.length > 0 ? ch.topics.map(t => ({ name: typeof t === 'string' ? t : t.name })) : [{ name: 'Topic 1' }]
      })) : [{ title: 'Chapter 1: Fundamentals', description: '', progress: 0, topics: [{ name: 'Topic 1' }] }]
    });
    setIsModalOpen(true);
  };

  const handleAddChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          title: `Chapter ${prev.chapters.length + 1}: New Chapter`,
          description: '',
          progress: 0,
          topics: [{ name: 'Topic 1' }]
        }
      ]
    }));
  };

  const handleRemoveChapter = (index) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }));
  };

  const handleChapterChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.chapters];
      updated[index][field] = value;
      return { ...prev, chapters: updated };
    });
  };

  const handleAddTopic = (chapterIndex) => {
    setFormData(prev => {
      const updated = [...prev.chapters];
      updated[chapterIndex].topics.push({ name: '' });
      return { ...prev, chapters: updated };
    });
  };

  const handleTopicChange = (chapterIndex, topicIndex, value) => {
    setFormData(prev => {
      const updated = [...prev.chapters];
      updated[chapterIndex].topics[topicIndex].name = value;
      return { ...prev, chapters: updated };
    });
  };

  const handleRemoveTopic = (chapterIndex, topicIndex) => {
    setFormData(prev => {
      const updated = [...prev.chapters];
      updated[chapterIndex].topics = updated[chapterIndex].topics.filter((_, i) => i !== topicIndex);
      return { ...prev, chapters: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName) {
      toast?.error?.('Subject Name is required.');
      return;
    }

    try {
      if (editingId) {
        await syllabusService.updateSyllabus(editingId, formData);
        toast?.success?.(`"${formData.subjectName}" updated successfully!`);
      } else {
        await syllabusService.createSyllabus(formData);
        toast?.success?.(`"${formData.subjectName}" added dynamically to backend!`);
      }
      setIsModalOpen(false);
      fetchSyllabusData();
      refreshSubjects();
    } catch (err) {
      console.error('Error saving syllabus:', err);
      toast?.error?.(err.response?.data?.message || 'Failed to save syllabus.');
    }
  };

  const handleDelete = async (id, subjectName) => {
    if (window.confirm(`Are you sure you want to delete "${subjectName}" syllabus from backend?`)) {
      try {
        await syllabusService.deleteSyllabus(id);
        toast?.success?.(`"${subjectName}" deleted successfully.`);
        fetchSyllabusData();
        refreshSubjects();
      } catch (err) {
        console.error('Error deleting syllabus:', err);
        toast?.error?.('Failed to delete syllabus item.');
      }
    }
  };

  const filteredList = syllabusList.filter(item => 
    item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subjectCode && item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={s.header}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Dynamic Syllabus Management
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Add, edit, or remove subjects and chapters in real-time for student access.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" iconLeft={<RefreshCw size={16} />} onClick={fetchSyllabusData}>
            Refresh
          </Button>
          <Button variant="primary" iconLeft={<Plus size={18} />} onClick={openAddModal}>
            Add Subject & Syllabus
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={s.filterRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Select Board</span>
            <select
              style={s.select}
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
            >
              {BOARDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>Select Class</span>
            <select
              style={s.select}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {CLASSES.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'var(--color-bg)', padding: '6px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Search size={16} color="var(--color-text-tertiary)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search subject by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
          Fetching syllabus data from database...
        </div>
      ) : filteredList.length > 0 ? (
        <div style={s.subjectGrid}>
          {filteredList.map(item => (
            <div key={item._id} style={s.subjectCard}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: `${item.color || '#4F6EF7'}18`, color: item.color || '#4F6EF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '16px' }}>{item.subjectName}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{item.subjectCode || 'No Code'}</span>
                    </div>
                  </div>
                  <Badge variant={item.status === 'Published' ? 'success' : 'neutral'} size="sm">
                    {item.status}
                  </Badge>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
                  {item.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}>
                  <Layers size={14} />
                  <span>{item.chapters ? item.chapters.length : 0} Chapters configured</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                <button
                  onClick={() => openEditModal(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.subjectName)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
          <AlertCircle size={36} color="var(--color-text-tertiary)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>No Subjects Found</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            There are no subjects configured for {selectedBoard.toUpperCase()} Class {selectedClass} yet.
          </p>
          <Button variant="primary" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            Add First Subject
          </Button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingId ? 'Edit Subject & Syllabus' : 'Add New Subject & Syllabus'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Education Board *</label>
                  <select
                    style={s.select}
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  >
                    {BOARDS.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div style={s.formGroup}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Academic Class *</label>
                  <select
                    style={s.select}
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  >
                    {CLASSES.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Applications"
                    style={s.input}
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CA-101"
                    style={s.input}
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  />
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of what students will learn in this subject..."
                  style={{ ...s.input, fontFamily: 'inherit' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Badge Color</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {COLOR_OPTIONS.map(c => (
                      <div
                        key={c}
                        onClick={() => setFormData({ ...formData, color: c })}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: formData.color === c ? '2px solid black' : 'none'
                        }}
                      >
                        {formData.color === c && <Check size={12} color="white" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.formGroup}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Status</label>
                  <select
                    style={s.select}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Published">Published (Visible to Students)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Chapters & Topics Section */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border-light)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Chapters & Topics Builder</h4>
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Chapter
                  </button>
                </div>

                {formData.chapters.map((ch, chIdx) => (
                  <div key={chIdx} style={s.chapterBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Chapter Title (e.g. Chapter 1: Algorithms)"
                        value={ch.title}
                        onChange={(e) => handleChapterChange(chIdx, 'title', e.target.value)}
                        style={{ ...s.input, width: '100%', fontWeight: '600' }}
                      />
                      {formData.chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(chIdx)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Chapter Description"
                      value={ch.description}
                      onChange={(e) => handleChapterChange(chIdx, 'description', e.target.value)}
                      style={{ ...s.input, width: '100%', fontSize: '12px', marginBottom: '8px' }}
                    />

                    {/* Topics Sub-list */}
                    <div style={{ marginLeft: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Topics:</span>
                      {ch.topics.map((t, tIdx) => (
                        <div key={tIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                          <input
                            type="text"
                            placeholder="Topic name"
                            value={t.name}
                            onChange={(e) => handleTopicChange(chIdx, tIdx, e.target.value)}
                            style={{ ...s.input, padding: '4px 8px', fontSize: '12px', flex: 1 }}
                          />
                          {ch.topics.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTopic(chIdx, tIdx)}
                              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddTopic(chIdx)}
                        style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px', fontWeight: '600' }}
                      >
                        + Add Topic
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingId ? 'Save Changes' : 'Publish Syllabus'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusManagement;
