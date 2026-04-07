import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteerDashboard.css";

const HIGH_CASE_VOLUNTEER_THRESHOLD = 10;

const SEVERITY_COLOR = {
    Low: "sev-low",
    Medium: "sev-med",
    High: "sev-high",
};

const canVolunteerTake = (report) => {
    if (report.severity === "Low" || report.severity === "Medium") return true;
    if (
        report.severity === "High" &&
        report.status !== "Resolved" &&
        (report.reportCount || 1) < HIGH_CASE_VOLUNTEER_THRESHOLD
    )
        return true;
    return false;
};

// ── Proof Upload Modal ──────────────────────────────────────────────────────
const ProofModal = ({ report, onConfirm, onCancel }) => {
    const [images, setImages] = useState([]);       // array of { file, preview }
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const addFiles = (files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (!valid.length) { setError("Only image files are accepted."); return; }
        setError("");
        const mapped = valid.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...mapped].slice(0, 5)); // max 5
    };

    const removeImage = (idx) => {
        setImages((prev) => {
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
            setError("⚠️ Please upload at least one proof image before resolving.");
            return;
        }
        // Pass preview URLs as proof (in real app you'd upload to a server)
        onConfirm({
            proofImages: images.map((i) => i.preview),
            resolveNote: note,
        });
    };

    return (
        <div className="proof-overlay">
            <div className="proof-modal">
                {/* Header */}
                <div className="proof-modal-header">
                    <div>
                        <h3 className="proof-modal-title">📸 Upload Proof of Resolution</h3>
                        <p className="proof-modal-sub">
                            Upload photos showing the issue has been fixed.
                            <strong> At least 1 image is required.</strong>
                        </p>
                    </div>
                </div>

                {/* Issue summary chip */}
                <div className="proof-issue-chip">
                    <span className={`vsev ${SEVERITY_COLOR[report.severity]}`}>{report.severity}</span>
                    <span>{report.issueType}</span>
                    <span className="chip-place">📍 {report.place || "Location not specified"}</span>
                </div>

                {/* Drop zone */}
                <div
                    className={`proof-dropzone ${dragging ? "dragging" : ""} ${images.length > 0 ? "has-images" : ""}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => addFiles(e.target.files)}
                    />
                    {images.length === 0 ? (
                        <div className="proof-dropzone-empty">
                            <span className="proof-upload-icon">📷</span>
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
                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div className="proof-thumb add-more">
                                    <span>+ Add more</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && <p className="proof-error">{error}</p>}

                {/* Optional note */}
                <textarea
                    className="proof-note"
                    placeholder="Optional: Add a note about what was done to fix this issue..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                />

                {/* Mandatory notice */}
                <div className="proof-mandatory-notice">
                    🔒 Image upload is <strong>mandatory</strong> to mark an issue as resolved.
                    This ensures accountability and transparency.
                </div>

                {/* Actions */}
                <div className="proof-actions">
                    <button className="proof-btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={`proof-btn-confirm ${images.length === 0 ? "disabled" : ""}`}
                        onClick={handleSubmit}
                    >
                        ✅ Confirm & Mark Resolved
                        {images.length > 0 && (
                            <span className="proof-img-count">{images.length} photo{images.length > 1 ? "s" : ""}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Dashboard ──────────────────────────────────────────────────────────
const VolunteerDashboard = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState("All");
    const [claimedIds, setClaimedIds] = useState([]);
    const [resolveTarget, setResolveTarget] = useState(null); // report being resolved
    const navigate = useNavigate();

    const volunteerName = localStorage.getItem("userName") || "Volunteer";

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role !== "volunteer") navigate("/");

        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const available = all.filter(
            (r) => r.status !== "Resolved" && canVolunteerTake(r)
        );
        const claimed = JSON.parse(localStorage.getItem("volunteerClaimed") || "[]");

        const id = requestAnimationFrame(() => {
            setReports(available);
            setClaimedIds(claimed);
        });
        return () => cancelAnimationFrame(id);
    }, [navigate]);

    const handleClaim = (id) => {
        const updated = [...claimedIds, id];
        setClaimedIds(updated);
        localStorage.setItem("volunteerClaimed", JSON.stringify(updated));

        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const patched = all.map((r) =>
            r.id === id ? { ...r, status: "In Progress", claimedBy: volunteerName } : r
        );
        localStorage.setItem("reports", JSON.stringify(patched));
        setReports((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status: "In Progress", claimedBy: volunteerName } : r
            )
        );
    };

    // Opens the proof modal
    const handleResolveClick = (report) => {
        setResolveTarget(report);
    };

    // Called when modal confirms with proof
    const handleProofConfirm = ({ proofImages, resolveNote }) => {
        const id = resolveTarget.id;
        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const patched = all.map((r) =>
            r.id === id
                ? {
                      ...r,
                      status: "Resolved",
                      resolvedBy: volunteerName,
                      resolvedAt: new Date().toLocaleString(),
                      proofImages,
                      resolveNote,
                  }
                : r
        );
        localStorage.setItem("reports", JSON.stringify(patched));
        setReports((prev) => prev.filter((r) => r.id !== id));
        const updatedClaimed = claimedIds.filter((c) => c !== id);
        setClaimedIds(updatedClaimed);
        localStorage.setItem("volunteerClaimed", JSON.stringify(updatedClaimed));
        setResolveTarget(null);
    };

    const filtered =
        filter === "All"
            ? reports
            : reports.filter((r) => r.severity === filter);

    const myCases = reports.filter((r) => claimedIds.includes(r.id));
    const availableCases = reports.filter((r) => !claimedIds.includes(r.id));

    return (
        <div className="vdash-wrap">

            {/* Proof Modal */}
            {resolveTarget && (
                <ProofModal
                    report={resolveTarget}
                    onConfirm={handleProofConfirm}
                    onCancel={() => setResolveTarget(null)}
                />
            )}

            <div className="vdash-header">
                <div>
                    <h2 className="vdash-title">Volunteer Dashboard</h2>
                    <p className="vdash-sub">Welcome, {volunteerName}</p>
                </div>
                <div className="vdash-stats">
                    <div className="vstat">
                        <p className="vstat-val">{myCases.length}</p>
                        <p className="vstat-label">My active cases</p>
                    </div>
                    <div className="vstat">
                        <p className="vstat-val">{availableCases.length}</p>
                        <p className="vstat-label">Available to claim</p>
                    </div>
                </div>
            </div>

            <div className="vdash-notice">
                <span className="notice-icon">ℹ</span>
                You can resolve <strong>Low</strong> and <strong>Moderate</strong> cases
                directly. <strong>High severity</strong> cases are shown only when they
                are unresolved and under-reported — government handles the rest.
            </div>

            {/* My claimed cases */}
            {myCases.length > 0 && (
                <div className="vsection">
                    <h3 className="vsection-title">My claimed cases</h3>
                    <div className="vcard-list">
                        {myCases.map((r) => (
                            <div className="vcard claimed" key={r.id}>
                                <div className="vcard-top">
                                    <span className={`vsev ${SEVERITY_COLOR[r.severity]}`}>
                                        {r.severity}
                                    </span>
                                    <span className="vcard-type">{r.issueType}</span>
                                </div>
                                <p className="vcard-place">📍 {r.place || "Location not specified"}</p>
                                <p className="vcard-date">Reported on {r.date}</p>
                                {r.description && (
                                    <p className="vcard-desc">{r.description}</p>
                                )}
                                <div className="vcard-actions">
                                    <span className="in-progress-badge">In progress</span>
                                    <button
                                        className="vbtn-resolve"
                                        onClick={() => handleResolveClick(r)}
                                    >
                                        📸 Mark as resolved
                                    </button>
                                </div>

                                {/* Proof reminder tag */}
                                <div className="proof-reminder">
                                    🔒 Photo proof required to resolve
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="vfilter-row">
                {["All", "Low", "Medium", "High"].map((f) => (
                    <button
                        key={f}
                        className={`vfilter-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Available cases */}
            <div className="vsection">
                <h3 className="vsection-title">Available cases</h3>
                {availableCases.length === 0 ? (
                    <div className="vempty">No cases available right now. Check back later!</div>
                ) : (
                    <div className="vcard-list">
                        {filtered
                            .filter((r) => !claimedIds.includes(r.id))
                            .map((r) => (
                                <div className="vcard" key={r.id}>
                                    <div className="vcard-top">
                                        <span className={`vsev ${SEVERITY_COLOR[r.severity]}`}>
                                            {r.severity}
                                        </span>
                                        <span className="vcard-type">{r.issueType}</span>
                                        {r.severity === "High" && (
                                            <span className="high-tag">Low count — volunteer eligible</span>
                                        )}
                                    </div>
                                    <p className="vcard-place">📍 {r.place || "Location not specified"}</p>
                                    <p className="vcard-date">Reported on {r.date}</p>
                                    {r.description && (
                                        <p className="vcard-desc">{r.description}</p>
                                    )}
                                    <div className="vcard-actions">
                                        <button
                                            className="vbtn-claim"
                                            onClick={() => handleClaim(r.id)}
                                        >
                                            Claim this case
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;