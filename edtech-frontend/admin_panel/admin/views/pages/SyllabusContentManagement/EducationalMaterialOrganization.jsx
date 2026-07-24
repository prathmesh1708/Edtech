import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, X, Download, Eye, FileText, 
  Video, Image as ImageIcon, FileCode, Music, HelpCircle, History, ExternalLink 
} from 'lucide-react';
import { useToast } from '../../../../../src/views/components/common/Toast/Toast';
import syllabusManagementService from '../../../../../src/models/services/syllabusManagementService';
import styles from './SyllabusContentManagement.module.css';

const EducationalMaterialOrganization = () => {
  const toast = useToast();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formData, setFormData] = useState({
    materialTitle: '',
    materialType: 'PDF Notes',
    fileUrl: '',
    fileSize: '2.5 MB',
    description: '',
    board: 'CBSE',
    classId: 'Class 10',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Real Numbers',
    tagsStr: 'NCERT, Exam Prep',
    language: 'English',
    status: 'Pending Review',
    visibility: 'Public',
    updateNotes: ''
  });

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await syllabusManagementService.getEducationalMaterials();
      setMaterials(res.data || []);
    } catch (err) {
      toast.error('Failed to load educational material repository.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleOpenAdd = () => {
    setCurrentItem(null);
    setFormData({
      materialTitle: '',
      materialType: 'PDF Notes',
      fileUrl: '',
      fileSize: '2.5 MB',
      description: '',
      board: 'CBSE',
      classId: 'Class 10',
      subject: 'Mathematics',
      chapter: 'Chapter 1: Real Numbers',
      tagsStr: 'NCERT, Solutions',
      language: 'English',
      status: 'Pending Review',
      visibility: 'Public',
      updateNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      materialTitle: item.materialTitle,
      materialType: item.materialType || 'PDF Notes',
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || '2.5 MB',
      description: item.description || '',
      board: item.board || 'CBSE',
      classId: item.classId || 'Class 10',
      subject: item.subject || 'Mathematics',
      chapter: item.chapter || 'Chapter 1: Real Numbers',
      tagsStr: (item.tags || []).join(', '),
      language: item.language || 'English',
      status: item.status || 'Pending Review',
      visibility: item.visibility || 'Public',
      updateNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialTitle.trim()) {
      toast.error('Material Title is required.', 'Validation Error');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    };

    setIsLoading(true);
    try {
      if (currentItem) {
        await syllabusManagementService.updateEducationalMaterial(currentItem._id, payload);
        toast.success(`Educational material "${formData.materialTitle}" updated.`, 'Material Updated');
      } else {
        await syllabusManagementService.createEducationalMaterial(payload);
        toast.success(`Educational material "${formData.materialTitle}" uploaded.`, 'Material Created');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to save material asset.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setIsLoading(true);
    try {
      await syllabusManagementService.deleteEducationalMaterial(currentItem._id);
      toast.success(`Material "${currentItem.materialTitle}" removed.`, 'Deleted');
      setIsDeleteOpen(false);
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = materials.filter(m => {
    const matchesSearch = m.materialTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (m.chapter && m.chapter.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || m.materialType === selectedType;
    const matchesVisibility = selectedVisibility === 'All' || m.visibility === selectedVisibility;
    return matchesSearch && matchesType && matchesVisibility;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Videos': return <Video size={16} color="#EC4899" />;
      case 'Images': return <ImageIcon size={16} color="#A855F7" />;
      case 'Quizzes': return <HelpCircle size={16} color="#22C55E" />;
      case 'Audio': return <Music size={16} color="#EAB308" />;
      default: return <FileText size={16} color="#1A73E8" />;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Educational Material Organization</h1>
          <p className={styles.subtitle}>Upload, preview, organize, and version PDF notes, videos, worksheets & exam papers.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Upload Educational Material</span>
        </button>
      </header>

      {/* Type Summary Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1A73E8' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{materials.filter(m => m.materialType === 'PDF Notes').length} PDF Notes</div>
            <div className={styles.kpiLabel}>Documents & Solutions</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
            <Video size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{materials.filter(m => m.materialType === 'Videos').length} Video Tutorials</div>
            <div className={styles.kpiLabel}>HD Animated Videos</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{materials.filter(m => m.materialType === 'Quizzes').length} Quizzes</div>
            <div className={styles.kpiLabel}>Practice Tests</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search material title, subject, or chapter..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.controlsContainer}>
            <select 
              className={styles.filterSelect}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Asset Types</option>
              <option value="PDF Notes">PDF Notes</option>
              <option value="Videos">Videos</option>
              <option value="Images">Images</option>
              <option value="PPT">PPT Presentations</option>
              <option value="Documents">Documents</option>
              <option value="Audio">Audio</option>
              <option value="Assignments">Assignments</option>
              <option value="Worksheets">Worksheets</option>
              <option value="Sample Papers">Sample Papers</option>
              <option value="Previous Year Papers">Previous Year Papers</option>
              <option value="Quizzes">Quizzes</option>
              <option value="External Links">External Links</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
            >
              <option value="All">All Visibilities</option>
              <option value="Public">Public</option>
              <option value="Student Only">Student Only</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Material Title</th>
                <th>Type</th>
                <th>Subject & Chapter</th>
                <th>Version</th>
                <th>Visibility</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading material repository...</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className={styles.cellName}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getTypeIcon(item.materialType)}
                        <span>{item.materialTitle}</span>
                      </div>
                    </td>
                    <td><span className={styles.typeTag}>{item.materialType}</span></td>
                    <td>
                      <div>{item.subject}</div>
                      <div className={styles.subText}>{item.chapter} ({item.board})</div>
                    </td>
                    <td><span className={styles.versionTag}>{item.version || 'v1.0'}</span></td>
                    <td>{item.visibility}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[(item.status || 'pending').toLowerCase().replace(' ', '')]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.iconButton} onClick={() => { setCurrentItem(item); setIsPreviewOpen(true); }} title="Preview / Download Material">
                          <Eye size={14} />
                        </button>
                        <button className={styles.iconButton} onClick={() => { setCurrentItem(item); setIsHistoryOpen(true); }} title="Version History">
                          <History size={14} />
                        </button>
                        <button className={styles.iconButton} onClick={() => handleOpenEdit(item)} title="Edit Material">
                          <Edit2 size={14} />
                        </button>
                        <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} title="Delete Material">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>
                    No educational materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{currentItem ? 'Edit Material Asset' : 'Upload Educational Material'}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Material Title *</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.materialTitle}
                      onChange={(e) => setFormData({ ...formData, materialTitle: e.target.value })}
                      placeholder="e.g. Real Numbers NCERT Solutions PDF"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Material Type</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.materialType}
                      onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                    >
                      <option value="PDF Notes">PDF Notes</option>
                      <option value="Videos">Videos</option>
                      <option value="Images">Images</option>
                      <option value="PPT">PPT Presentations</option>
                      <option value="Documents">Documents</option>
                      <option value="Audio">Audio</option>
                      <option value="Assignments">Assignments</option>
                      <option value="Worksheets">Worksheets</option>
                      <option value="Sample Papers">Sample Papers</option>
                      <option value="Previous Year Papers">Previous Year Papers</option>
                      <option value="Quizzes">Quizzes</option>
                      <option value="External Links">External Links</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English Literature">English Literature</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Board & Class</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className={styles.formSelect}
                        value={formData.board}
                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="IB">IB</option>
                      </select>
                      <select 
                        className={styles.formSelect}
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      >
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chapter Mapping</label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="e.g. Chapter 1: Real Numbers"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>File / Asset URL Link</label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://cloud-storage.com/file.pdf or video URL"
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tags (Comma separated)</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.tagsStr}
                      onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                      placeholder="NCERT, Solutions, Exam Prep"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Visibility</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    >
                      <option value="Public">Public</option>
                      <option value="Student Only">Student Only</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>

                {currentItem && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Version Release Notes (If updating file)</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={formData.updateNotes}
                      onChange={(e) => setFormData({ ...formData, updateNotes: e.target.value })}
                      placeholder="e.g. Updated solutions for 2026 exam syllabus"
                    />
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{currentItem ? 'Update Material' : 'Save Material'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Material Preview</h2>
              <button className={styles.closeButton} onClick={() => setIsPreviewOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <h3>{currentItem?.materialTitle}</h3>
              <p className={styles.subtitle}>{currentItem?.subject} • {currentItem?.chapter} ({currentItem?.board})</p>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '12px' }}>
                <p><strong>Type:</strong> {currentItem?.materialType}</p>
                <p><strong>Version:</strong> {currentItem?.version}</p>
                <p><strong>Visibility:</strong> {currentItem?.visibility}</p>
                <p><strong>File Link:</strong> <a href={currentItem?.fileUrl || '#'} target="_blank" rel="noreferrer" style={{ color: '#1A73E8' }}>{currentItem?.fileUrl || 'No file link attached'} <ExternalLink size={12} /></a></p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsPreviewOpen(false)}>Close Preview</button>
              {currentItem?.fileUrl && (
                <a href={currentItem.fileUrl} download target="_blank" rel="noreferrer" className={styles.primaryButton} style={{ textDecoration: 'none' }}>
                  <Download size={14} /> Download File
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {isHistoryOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Version Release History</h2>
              <button className={styles.closeButton} onClick={() => setIsHistoryOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <h4>{currentItem?.materialTitle}</h4>
              <div className={styles.historyList}>
                {currentItem?.versionHistory && currentItem.versionHistory.length > 0 ? (
                  currentItem.versionHistory.map((ver, idx) => (
                    <div key={idx} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span>Version <strong>{ver.version}</strong></span>
                        <span>{new Date(ver.updatedAt).toLocaleString()}</span>
                      </div>
                      <div className={styles.historyRemarks}>{ver.notes || 'Updated version release'}</div>
                    </div>
                  ))
                ) : (
                  <p className={styles.subtitle}>No version history logged.</p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsHistoryOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className={styles.modalBody}>
              <h3 className={styles.modalTitle}>Delete Educational Material?</h3>
              <p className={styles.subtitle} style={{ marginTop: '8px' }}>
                Are you sure you want to delete <strong>{currentItem?.materialTitle}</strong>?
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsDeleteOpen(false)}>Cancel</button>
              <button type="button" className={`${styles.primaryButton} ${styles.dangerButton}`} onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalMaterialOrganization;
