import { useState, useEffect, useCallback, useRef } from 'react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    MapPin,
    Phone,
    User,
    Calendar,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Building2,
    Search,
    X,
    TrendingUp,
    Users,
    Bell,
    Camera,
    Upload
} from 'lucide-react';
import './AdminDashboard.css';
import { API_BASE } from '../services/api';

const DEPARTMENTS = [
    'All Departments',
    'Roads Department',
    'Sanitation',
    'Water Department',
    'Electrical Department',
    'General Administration'
];

const STATUSES = [
    'All Statuses',
    'Pending',
    'In Progress',
    'Resolved'
];

// ── Severity color helper ─────────────────────────────────────────────────
const SEVERITY_COLOR = { Low: 'sev-low', Medium: 'sev-med', High: 'sev-high' };

// ══════════════════════════════════════════════════════════════════════════
// PROOF UPLOAD MODAL
// ══════════════════════════════════════════════════════════════════════════
const ProofModal = ({ complaint, onConfirm, onCancel }) => {
    const [images, setImages]   = useState([]);   // { file, preview }[]
    const [note, setNote]       = useState('');
    const [error, setError]     = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const addFiles = (files) => {
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!valid.length) { setError('Only image files are accepted.'); return; }
        setError('');
        const mapped = valid.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...mapped].slice(0, 5));
    };

    const removeImage = (idx) => {
        setImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleSubmit = () => {
        if (images.length === 0) {
            setError('⚠️ Please upload at least one proof image before marking as resolved.');
            return;
        }
        onConfirm({
            proofImages: images.map(i => i.preview),
            resolveNote: note,
        });
    };

    return (
        <div className="proof-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="proof-modal">

                {/* Header */}
                <div className="proof-modal-header">
                    <div>
                        <h3 className="proof-modal-title">
                            <Camera size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                            Upload Proof of Resolution
                        </h3>
                        <p className="proof-modal-sub">
                            Photos confirming the issue is fixed are <strong>mandatory</strong> before marking as Resolved.
                        </p>
                    </div>
                    <button className="proof-close-x" onClick={onCancel}><X size={18} /></button>
                </div>

                {/* Issue summary chip */}
                <div className="proof-issue-chip">
                    <span className={`proof-sev-badge sev-${complaint.severity?.toLowerCase()}`}>
                        {complaint.severity}
                    </span>
                    <span className="proof-chip-type">{complaint.issue_type}</span>
                    <span className="proof-chip-place">
                        <MapPin size={12} style={{ display: 'inline', marginRight: 3 }} />
                        {complaint.area}, {complaint.city}
                    </span>
                    <span className="proof-chip-id">#{complaint.complaint_id}</span>
                </div>

                {/* Drop zone */}
                <div
                    className={`proof-dropzone ${dragging ? 'dragging' : ''} ${images.length > 0 ? 'has-images' : ''}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => addFiles(e.target.files)}
                    />

                    {images.length === 0 ? (
                        <div className="proof-dropzone-empty">
                            <Upload size={32} className="proof-upload-icon" />
                            <p className="proof-drop-text">Click or drag & drop images here</p>
                            <p className="proof-drop-hint">Accepts images only · Max 5 photos</p>
                        </div>
                    ) : (
                        <div className="proof-preview-grid">
                            {images.map((img, idx) => (
                                <div className="proof-thumb" key={idx}>
                                    <img src={img.preview} alt={`proof-${idx}`} />
                                    <button
                                        className="proof-thumb-remove"
                                        onClick={e => { e.stopPropagation(); removeImage(idx); }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div className="proof-thumb add-more">
                                    <span>+ Add<br />more</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && <p className="proof-error">{error}</p>}

                {/* Note */}
                <textarea
                    className="proof-note"
                    placeholder="Optional: Describe what was done to fix this issue..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                />

                {/* Mandatory notice */}
                <div className="proof-mandatory-notice">
                    🔒 Image upload is <strong>mandatory</strong>. This ensures accountability and
                    transparency across all departments.
                </div>

                {/* Actions */}
                <div className="proof-actions">
                    <button className="proof-btn-cancel" onClick={onCancel}>Cancel</button>
                    <button
                        className={`proof-btn-confirm ${images.length === 0 ? 'disabled' : ''}`}
                        onClick={handleSubmit}
                    >
                        <CheckCircle size={15} />
                        Confirm &amp; Mark Resolved
                        {images.length > 0 && (
                            <span className="proof-img-count">
                                {images.length} photo{images.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
    const [complaints, setComplaints]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [filters, setFilters]               = useState({ status: 'All Statuses', department: 'All Departments' });
    const [expandedComplaint, setExpandedComplaint] = useState(null);
    const [updating, setUpdating]             = useState({});
    const [activeAdminTab, setActiveAdminTab] = useState('complaints');
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);

    // ── Proof modal state ──
    const [resolveTarget, setResolveTarget]   = useState(null); // complaint being resolved

    // Fetch complaints
    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.status !== 'All Statuses')         params.append('status', filters.status);
            if (filters.department !== 'All Departments')  params.append('department', filters.department);

            const response = await fetch(`${API_BASE}/complaints?${params}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch complaints');

            const sortedComplaints = data.data.sort((a, b) => {
                const aCount = a.supporter_count || 1;
                const bCount = b.supporter_count || 1;
                if (bCount !== aCount) return bCount - aCount;
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setComplaints(sortedComplaints);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

    // Fetch grouped duplicates
    const fetchDuplicates = useCallback(async () => {
        setDuplicatesLoading(true);
        try {
            const response = await fetch(`${API_BASE}/complaints/grouped-duplicates`);
            const data = await response.json();
            if (response.ok) setDuplicateGroups(data.data || []);
        } catch (err) {
            console.error('Failed to fetch duplicates:', err);
        } finally {
            setDuplicatesLoading(false);
        }
    }, []);

    useEffect(() => { fetchDuplicates(); }, [fetchDuplicates]);

    // Update complaint status (generic — used for Pending → In Progress)
    const updateStatus = async (id, newStatus) => {
        setUpdating(prev => ({ ...prev, [id]: true }));
        try {
            const response = await fetch(`${API_BASE}/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to update status');
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    // Resolve with proof — called after modal confirms
    const handleProofConfirm = async ({ proofImages, resolveNote }) => {
        const complaint = resolveTarget;
        const id = complaint.id;

        setUpdating(prev => ({ ...prev, [id]: true }));
        try {
            const response = await fetch(`${API_BASE}/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Resolved',
                    resolveNote,
                    // In production you'd upload images to storage and send URLs
                    // For now we attach count as metadata
                    proofImageCount: proofImages.length,
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to resolve complaint');

            setComplaints(prev =>
                prev.map(c => c.id === id
                    ? { ...c, status: 'Resolved', proofImages, resolveNote }
                    : c
                )
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
            setResolveTarget(null);
        }
    };

    // Assign department
    const assignDepartment = async (id, department) => {
        setUpdating(prev => ({ ...prev, [id]: true }));
        try {
            const response = await fetch(`${API_BASE}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaintId: id.toString(), department })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to assign department');
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, department } : c));
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':     return <Clock className="status-icon pending" />;
            case 'In Progress': return <AlertCircle className="status-icon in-progress" />;
            case 'Resolved':    return <CheckCircle className="status-icon resolved" />;
            default:            return null;
        }
    };

    const getStatusClass  = (status) => status.toLowerCase().replace(' ', '-');
    const toggleExpand    = (id) => setExpandedComplaint(prev => prev === id ? null : id);

    return (
        <div className="admin-dashboard">

            {/* ── Proof Modal ── */}
            {resolveTarget && (
                <ProofModal
                    complaint={resolveTarget}
                    onConfirm={handleProofConfirm}
                    onCancel={() => setResolveTarget(null)}
                />
            )}

            <div className="admin-dashboard__container">
                {/* Header */}
                <div className="admin-dashboard__header">
                    <div className="header-title">
                        <Building2 className="header-icon" />
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage and track citizen complaints</p>
                        </div>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={() => { fetchComplaints(); fetchDuplicates(); }}
                        disabled={loading}
                    >
                        <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <span className="stat-value">{complaints.length}</span>
                        <span className="stat-label">Total Complaints</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">{complaints.filter(c => c.status === 'Pending').length}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card in-progress">
                        <span className="stat-value">{complaints.filter(c => c.status === 'In Progress').length}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                    <div className="stat-card resolved">
                        <span className="stat-value">{complaints.filter(c => c.status === 'Resolved').length}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                    <div
                        className="stat-card duplicate"
                        onClick={() => setActiveAdminTab('duplicates')}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="stat-value">{duplicateGroups.length}</span>
                        <span className="stat-label">🔁 Duplicate Groups</span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeAdminTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setActiveAdminTab('complaints')}
                    >
                        All Complaints
                    </button>
                    <button
                        className={`admin-tab ${activeAdminTab === 'duplicates' ? 'active' : ''}`}
                        onClick={() => setActiveAdminTab('duplicates')}
                    >
                        <Bell size={16} />
                        Duplicate Reports
                        {duplicateGroups.length > 0 && (
                            <span className="admin-tab-badge">{duplicateGroups.length}</span>
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <Filter className="filter-icon" />
                        <select
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                            className="filter-select"
                        >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <Building2 className="filter-icon" />
                        <select
                            value={filters.department}
                            onChange={e => setFilters({ ...filters, department: e.target.value })}
                            className="filter-select"
                        >
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="dashboard-error">
                        <AlertCircle className="error-icon" />
                        <p>{error}</p>
                    </div>
                )}

                {/* ── DUPLICATES TAB ── */}
                {activeAdminTab === 'duplicates' && (
                    <div className="duplicates-panel">
                        <div className="duplicates-header">
                            <Bell size={20} className="dup-header-icon" />
                            <div>
                                <h3>Duplicate Issue Alerts</h3>
                                <p>These issues have been reported by 2 or more citizens in the same area. Consider prioritising them for faster resolution.</p>
                            </div>
                        </div>

                        {duplicatesLoading ? (
                            <div className="loading-state">
                                <RefreshCw className="loading-icon spinning" />
                                <p>Loading duplicate groups...</p>
                            </div>
                        ) : duplicateGroups.length === 0 ? (
                            <div className="dup-empty">
                                <span>✅</span>
                                <p>No duplicate reports found. All issues appear to be unique!</p>
                            </div>
                        ) : (
                            <div className="dup-list">
                                {duplicateGroups.map((group, idx) => (
                                    <div
                                        key={idx}
                                        className={`dup-card severity-${group.highest_severity || 'medium'}`}
                                    >
                                        <div className="dup-card-left">
                                            <div className="dup-count-badge">
                                                <Users size={18} />
                                                <span>{group.report_count}</span>
                                            </div>
                                            <div className="dup-info">
                                                <div className="dup-issue-type">{group.issue_type}</div>
                                                <div className="dup-location">
                                                    <MapPin size={13} />
                                                    {group.area}, {group.city}
                                                </div>
                                                <div className="dup-ids">Report IDs: {group.complaint_ids}</div>
                                            </div>
                                        </div>
                                        <div className="dup-card-right">
                                            <div className="dup-stat">
                                                <span className="dup-stat-val">{group.total_supporters || group.report_count}</span>
                                                <span className="dup-stat-label">Total Supporters</span>
                                            </div>
                                            <span className={`dup-severity-badge severity-${group.highest_severity || 'medium'}`}>
                                                {group.highest_severity || 'medium'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── COMPLAINTS TAB ── */}
                {activeAdminTab === 'complaints' && (
                    <div className="complaints-list">
                        {loading ? (
                            <div className="loading-state">
                                <RefreshCw className="loading-icon spinning" />
                                <p>Loading complaints...</p>
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="empty-state">
                                <Search className="empty-icon" />
                                <p>No complaints found</p>
                                <span>Try adjusting your filters</span>
                            </div>
                        ) : (
                            complaints.map(complaint => (
                                <div
                                    key={complaint.id}
                                    className={`complaint-card ${expandedComplaint === complaint.id ? 'expanded' : ''}`}
                                >
                                    {/* Card header (click to expand) */}
                                    <div className="complaint-header" onClick={() => toggleExpand(complaint.id)}>
                                        <div className="complaint-id">
                                            <span className="id-label">ID</span>
                                            <span className="id-value">{complaint.complaint_id}</span>
                                        </div>

                                        <div className="complaint-info">
                                            <span className="issue-type">{complaint.issue_type}</span>
                                            <span className="location">{complaint.area}, {complaint.city}</span>
                                        </div>

                                        <div className={`status-badge ${getStatusClass(complaint.status)}`}>
                                            {getStatusIcon(complaint.status)}
                                            <span>{complaint.status}</span>
                                        </div>

                                        {complaint.supporter_count > 1 && (
                                            <div className="department-tag" style={{ backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fca5a5' }}>
                                                <TrendingUp className="dept-icon" size={16} />
                                                <span style={{ fontWeight: 600 }}>High Demand ({complaint.supporter_count})</span>
                                            </div>
                                        )}

                                        <div className="department-tag">
                                            <Building2 className="dept-icon" />
                                            <span>{complaint.department}</span>
                                        </div>

                                        <button className="expand-btn">
                                            {expandedComplaint === complaint.id ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                    </div>

                                    {/* Expanded details */}
                                    {expandedComplaint === complaint.id && (
                                        <div className="complaint-details">
                                            <div className="details-grid">
                                                <div className="detail-section">
                                                    <h4>Reporter Information</h4>
                                                    <div className="detail-item">
                                                        <User className="detail-icon" />
                                                        <span>{complaint.name}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Phone className="detail-icon" />
                                                        <span>{complaint.phone}</span>
                                                    </div>
                                                    {complaint.email && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Email:</span>
                                                            <span>{complaint.email}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="detail-section">
                                                    <h4>Location Details</h4>
                                                    <div className="detail-item">
                                                        <MapPin className="detail-icon" />
                                                        <span>{complaint.area}, {complaint.city}</span>
                                                    </div>
                                                    {complaint.landmark && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Landmark:</span>
                                                            <span>{complaint.landmark}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="detail-section full-width">
                                                    <h4>Issue Description</h4>
                                                    <p>{complaint.description}</p>

                                                    {complaint.image_url && (
                                                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                                            <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                                Attached Evidence
                                                            </h4>
                                                            <img
                                                                src={`${API_BASE.replace('/api', '')}${complaint.image_url}`}
                                                                alt="Complaint evidence"
                                                                style={{ maxWidth: '400px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Show resolution proof if already resolved */}
                                                    {complaint.status === 'Resolved' && complaint.proofImages?.length > 0 && (
                                                        <div className="proof-resolved-section">
                                                            <h4 className="proof-resolved-title">
                                                                <CheckCircle size={14} style={{ display: 'inline', marginRight: 6, color: '#16a34a' }} />
                                                                Resolution Proof ({complaint.proofImages.length} photo{complaint.proofImages.length > 1 ? 's' : ''})
                                                            </h4>
                                                            <div className="proof-resolved-grid">
                                                                {complaint.proofImages.map((src, i) => (
                                                                    <img key={i} src={src} alt={`proof-${i}`} className="proof-resolved-img" />
                                                                ))}
                                                            </div>
                                                            {complaint.resolveNote && (
                                                                <p className="proof-resolved-note">
                                                                    📝 {complaint.resolveNote}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="meta-tags">
                                                        <span className={`severity-tag severity-${complaint.severity}`}>
                                                            {complaint.severity} severity
                                                        </span>
                                                        <span className="date-tag">
                                                            <Calendar className="date-icon" />
                                                            {new Date(complaint.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action bar */}
                                            <div className="action-bar">
                                                <div className="action-group">
                                                    <label>Assign to Department:</label>
                                                    <select
                                                        value={complaint.department}
                                                        onChange={e => assignDepartment(complaint.id, e.target.value)}
                                                        disabled={updating[complaint.id]}
                                                        className="action-select"
                                                    >
                                                        {DEPARTMENTS.filter(d => d !== 'All Departments').map(dept => (
                                                            <option key={dept} value={dept}>{dept}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="action-group">
                                                    {complaint.status === 'Resolved' ? (
                                                        <span className="resolved-badge">
                                                            <CheckCircle size={16} />
                                                            Resolved
                                                        </span>
                                                    ) : complaint.status === 'In Progress' ? (
                                                        /* "Mark as Resolved" — opens proof modal */
                                                        <button
                                                            className="update-btn resolved proof-required-btn"
                                                            onClick={() => setResolveTarget(complaint)}
                                                            disabled={updating[complaint.id]}
                                                        >
                                                            <Camera size={15} />
                                                            {updating[complaint.id] ? 'Updating...' : 'Mark as Resolved'}
                                                            <span className="proof-req-tag">Photo proof required</span>
                                                        </button>
                                                    ) : (
                                                        /* "Mark as In Progress" — direct, no proof needed */
                                                        <button
                                                            className="update-btn in-progress"
                                                            onClick={() => updateStatus(complaint.id, 'In Progress')}
                                                            disabled={updating[complaint.id]}
                                                        >
                                                            {updating[complaint.id] ? 'Updating...' : 'Mark as In Progress'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;