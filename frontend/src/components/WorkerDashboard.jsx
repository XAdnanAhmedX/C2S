import React, { useState, useEffect } from 'react';
import WorkerLayout from './WorkerLayout';
import { workerDashboardAPI } from '../api';
import './WorkerDashboard.css';

const RANKS = [
  {
    grade: 'A+', label: 'A+', minScore: 95, color: '#22c55e', badgeBg: '#fce7f3',
    stars: 5,
    tips: [
      'Maintain 98%+ attendance consistently',
      'Complete all training modules on time',
      'Exceed daily production targets by 10%',
      'Zero safety violations or incidents',
    ],
  },
  {
    grade: 'A',  label: 'A',  minScore: 88, color: '#16a34a', badgeBg: '#fce7f3',
    stars: 5,
    tips: [
      'Keep attendance above 95%',
      'Complete assigned training within deadlines',
      'Meet daily production targets consistently',
    ],
  },
  {
    grade: 'A-', label: 'A-', minScore: 80, color: '#4ade80', badgeBg: '#fce7f3',
    stars: 4,
    tips: [
      'Improve attendance to 90%+',
      'Finish any pending training assignments',
      'Aim to meet 95% of daily targets',
    ],
  },
  {
    grade: 'B',  label: 'B',  minScore: 70, color: '#f59e0b', badgeBg: '#fef9c3',
    stars: 3,
    tips: [
      'Attendance needs to reach at least 85%',
      'Enroll in any available upskilling programs',
      'Discuss performance goals with your supervisor',
    ],
  },
  {
    grade: 'C',  label: 'C',  minScore: 60, color: '#f97316', badgeBg: '#fef3c7',
    stars: 2,
    tips: [
      'Address frequent absences with HR',
      'Complete overdue training assignments',
      'Seek mentorship from senior workers',
    ],
  },
  {
    grade: 'D',  label: 'D',  minScore: 0,  color: '#ef4444', badgeBg: '#fee2e2',
    stars: 1,
    tips: [
      'Attend a performance improvement session',
      'Reduce absenteeism immediately',
      'Work closely with line supervisor on targets',
      'Complete all mandatory safety training',
    ],
  },
];

const gradeStatus = (grade, currentGrade) => {
  const order = ['A+','A','A-','B','C','D'];
  const ci = order.indexOf(currentGrade);
  const gi = order.indexOf(grade);
  if (gi < ci) return 'needed';
  if (gi === ci) return 'current';
  return 'completed';
};

const StatusPill = ({ status }) => {
  const map = {
    current:   { label: 'Current',   cls: 'pill-current' },
    needed:    { label: 'Needed',    cls: 'pill-needed' },
    completed: { label: 'Completed', cls: 'pill-completed' },
  };
  const s = map[status] || map.completed;
  return <span className={`wd-pill ${s.cls}`}>{s.label}</span>;
};

const Stars = ({ count }) => (
  <span className="wd-stars">
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`fas fa-star ${i <= count ? 'star-on' : 'star-off'}`}></i>
    ))}
  </span>
);

const WorkerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userId = user?.id;

  const [profile, setProfile]     = useState(null);
  const [chart, setChart]         = useState([]);
  const [recentAtt, setRecentAtt] = useState([]);
  const [rating, setRating]       = useState(null);
  const [bonus, setBonus]         = useState(null);
  const [overtime, setOvertime]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [showPerf,         setShowPerf]         = useState(false);
  const [showImprovement,  setShowImprovement]  = useState(false);
  const [showOvertimeModal,setShowOvertimeModal] = useState(false);
  const [showBonusDetail,  setShowBonusDetail]  = useState(false);
  const [selectedRank,     setSelectedRank]     = useState(null);

  const [otForm, setOtForm] = useState({
    requested_date: new Date().toISOString().slice(0, 10),
    overtime_hours: 2,
    reason: '',
  });
  const [otSubmitting, setOtSubmitting] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, ra, rt, b, ot] = await Promise.all([
        workerDashboardAPI.getProfile(userId),
        workerDashboardAPI.getAttendanceChart(userId),
        workerDashboardAPI.getRecentAttendance(userId),
        workerDashboardAPI.getConsistencyRating(userId),
        workerDashboardAPI.getBonusEligibility(userId),
        workerDashboardAPI.getOvertimeStatus(userId),
      ]);
      setProfile(p.data?.data || null);
      setChart(c.data?.data || []);
      setRecentAtt(ra.data?.data || []);
      setRating(rt.data?.data || null);
      setBonus(b.data?.data || null);
      setOvertime(ot.data?.data || null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();
    setOtSubmitting(true);
    try {
      await workerDashboardAPI.requestOvertime({ user_id: userId, ...otForm });
      setShowOvertimeModal(false);
      alert('Overtime request submitted successfully!');
      loadAll();
    } catch (err) {
      alert('Failed to submit overtime request. Please try again.');
      console.error(err);
    } finally {
      setOtSubmitting(false);
    }
  };

  const w = profile?.worker || {};
  const attRate = profile?.attendance_rate ?? 0;
  const otHours = profile?.total_ot_hours ?? 0;
  const todayOutput = profile?.today_output ?? 0;
  const currentGrade = rating?.grade || '—';

  if (!user) {
    return (
      <WorkerLayout>
        <div className="wd-page">
          <div className="wd-loading">Please log in to view your dashboard.</div>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="wd-page">
        {loading && <div className="wd-loading"><i className="fas fa-spinner fa-spin"></i> Loading your dashboard…</div>}

        {error && (
          <div className="wd-error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Profile Header Card */}
            <div className="wd-profile-card">
              <div className="wd-profile-avatar">
                {(w.full_name || user.full_name || 'W').charAt(0).toUpperCase()}
              </div>
              <div className="wd-profile-info">
                <h2 className="wd-profile-name">{w.full_name || user.full_name || 'Worker'}</h2>
                <p className="wd-profile-sub">
                  <span className="wd-profile-id">
                    <i className="fas fa-id-badge"></i> {w.employee_id || '—'}
                  </span>
                  <span className="wd-profile-dept">
                    <i className="fas fa-building"></i> {w.department || '—'}
                  </span>
                  <span className="wd-profile-line">
                    <i className="fas fa-stream"></i> {w.line_name || '—'}
                  </span>
                </p>
              </div>
              <div className="wd-profile-contacts">
                <div className="wd-contact-chip">
                  <i className="fas fa-envelope"></i>
                  <span>{w.email || user.email || '—'}</span>
                </div>
                <div className="wd-contact-chip">
                  <i className="fas fa-phone"></i>
                  <span>{w.phone || '—'}</span>
                </div>
                <div className="wd-contact-chip">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Hired: {w.hire_date ? new Date(w.hire_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="wd-kpi-row">
              <div className="wd-kpi-card">
                <div className="wd-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="fas fa-boxes"></i>
                </div>
                <div className="wd-kpi-body">
                  <span className="wd-kpi-label">Today's Output</span>
                  <span className="wd-kpi-value">{todayOutput} <small>units</small></span>
                </div>
              </div>

              <div className="wd-kpi-card">
                <div className="wd-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="wd-kpi-body">
                  <span className="wd-kpi-label">Attendance Rate</span>
                  <span className="wd-kpi-value">{attRate.toFixed(1)}<small>%</small></span>
                </div>
              </div>

              {/* Consistency Rating — clickable */}
              <div
                className="wd-kpi-card wd-kpi-clickable"
                onClick={() => setShowPerf(true)}
                title="Click to view Performance Rating"
              >
                <div className="wd-kpi-icon" style={{ background: '#fef9c3', color: '#d97706' }}>
                  <i className="fas fa-star"></i>
                </div>
                <div className="wd-kpi-body">
                  <span className="wd-kpi-label">Consistency Rating</span>
                  <span className="wd-kpi-value">
                    <span className="wd-grade-badge">{currentGrade}</span>
                  </span>
                  <span className="wd-kpi-hint"><i className="fas fa-mouse-pointer"></i> Click for details</span>
                </div>
              </div>

              <div className="wd-kpi-card">
                <div className="wd-kpi-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className="wd-kpi-body">
                  <span className="wd-kpi-label">Overtime (This Month)</span>
                  <span className="wd-kpi-value">{otHours.toFixed(1)} <small>hrs</small></span>
                </div>
              </div>
            </div>

            {/* Bonus Alert Banner */}
            {bonus && (
              <div className={`wd-bonus-banner ${bonus.eligible ? 'eligible' : 'ineligible'}`}>
                <div className="wd-bonus-left">
                  <i className={`fas ${bonus.eligible ? 'fa-gift' : 'fa-exclamation-triangle'}`}></i>
                  <div>
                    <strong>
                      {bonus.eligible
                        ? `You are eligible for a monthly performance bonus of ৳${bonus.bonus_amount?.toFixed(2)}!`
                        : 'You are currently NOT eligible for the monthly performance bonus.'}
                    </strong>
                    <p>{bonus.eligible ? 'Eligible based on consistent attendance & clean safety record.' : bonus.reasons?.[0] || 'See details for more information.'}</p>
                  </div>
                </div>
                <button className="wd-details-btn" onClick={() => setShowBonusDetail(true)}>
                  Click For Details
                </button>
              </div>
            )}

            {/* Attendance Chart */}
            <div className="wd-card wd-chart-card">
              <div className="wd-card-header">
                <h3><i className="fas fa-chart-area"></i> Attendance — Last 7 Days</h3>
              </div>
              <div className="wd-chart-wrap">
                <div className="wd-chart-days">
                  {chart.map((d, i) => (
                    <div key={i} className={`wd-chart-day ${d.present ? 'present' : 'absent'}`}>
                      <div className="wd-day-bar" style={{ height: d.present ? '64px' : '20px' }}></div>
                      <span className="wd-day-label">{d.day}</span>
                      <span className="wd-day-status">{d.present ? '✓' : '✗'}</span>
                    </div>
                  ))}
                  {chart.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No attendance data available.</p>
                  )}
                </div>
                <div className="wd-chart-legend">
                  <span className="wd-legend-item present"><span></span>Present</span>
                  <span className="wd-legend-item absent"><span></span>Absent</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance Table */}
            <div className="wd-card">
              <div className="wd-card-header">
                <h3><i className="fas fa-list-alt"></i> Recent Attendance Records</h3>
                <span className="wd-badge">{recentAtt.length} Records</span>
              </div>
              <div className="wd-table-wrap">
                <table className="wd-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Overtime</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAtt.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:'2rem' }}>No attendance records found.</td></tr>
                    ) : recentAtt.map((r, i) => (
                      <tr key={r.id || i} className={i % 2 === 0 ? 'row-white' : 'row-teal'}>
                        <td>{r.date}</td>
                        <td style={{ textTransform: 'capitalize' }}>{r.shift}</td>
                        <td>{r.check_in || '—'}</td>
                        <td>{r.check_out || '—'}</td>
                        <td>{r.overtime_hours > 0 ? `${r.overtime_hours}h` : '—'}</td>
                        <td>
                          <span className={`wd-status-badge status-${r.status}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Request Overtime CTA */}
            <div className="wd-overtime-cta">
              <div className="wd-overtime-info">
                <i className="fas fa-business-time"></i>
                <div>
                  <strong>Need to work overtime?</strong>
                  <p>Submit an overtime request for supervisor approval.</p>
                </div>
              </div>
              <button className="wd-overtime-btn" onClick={() => setShowOvertimeModal(true)}>
                <i className="fas fa-plus-circle"></i> Request Overtime
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL A — Performance Rating */}
      {showPerf && (
        <div className="c2s-modal-overlay" onClick={() => setShowPerf(false)}>
          <div className="c2s-modal-dialog large wd-modal" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header wd-modal-header">
              <div className="wd-modal-title-row">
                <h2>Performance Rating</h2>
                <span className="wd-grade-badge-lg">{currentGrade}</span>
              </div>
              <button className="c2s-modal-close" onClick={() => setShowPerf(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              <div className="wd-rating-meta">
                <div className="wd-rating-score-item">
                  <i className="fas fa-calendar-check"></i>
                  <span>Attendance</span>
                  <strong>{rating?.attendance_rate?.toFixed(1)}%</strong>
                </div>
                <div className="wd-rating-score-item">
                  <i className="fas fa-book"></i>
                  <span>Training</span>
                  <strong>{rating?.train_rate?.toFixed(1)}%</strong>
                </div>
                <div className="wd-rating-score-item">
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Efficiency</span>
                  <strong>{rating?.efficiency?.toFixed(1)}%</strong>
                </div>
                <div className="wd-rating-score-item wd-total">
                  <i className="fas fa-chart-bar"></i>
                  <span>Overall Score</span>
                  <strong>{rating?.score?.toFixed(1)}</strong>
                </div>
              </div>

              <p className="wd-table-note">Click any rank to see improvement details</p>

              <table className="wd-table wd-rank-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Min Score</th>
                    <th>Stars</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RANKS.map((rk) => {
                    const status = gradeStatus(rk.grade, currentGrade);
                    return (
                      <tr
                        key={rk.grade}
                        className={`wd-rank-row ${status === 'current' ? 'rank-current' : ''}`}
                        onClick={() => { setSelectedRank(rk); setShowImprovement(true); }}
                      >
                        <td>
                          <span className="wd-rank-badge" style={{ background: rk.badgeBg, color: rk.color }}>
                            {rk.grade}
                          </span>
                        </td>
                        <td>{rk.minScore}+</td>
                        <td><Stars count={rk.stars} /></td>
                        <td><StatusPill status={status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="c2s-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPerf(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B — Improvement Details */}
      {showImprovement && selectedRank && (
        <div className="c2s-modal-overlay" onClick={() => setShowImprovement(false)}>
          <div className="c2s-modal-dialog wd-modal" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header wd-modal-header">
              <h2>Improvement Details — Rank {selectedRank.grade}</h2>
              <button className="c2s-modal-close" onClick={() => setShowImprovement(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              <div className="wd-improvement-header">
                <span
                  className="wd-rank-badge-xl"
                  style={{ background: selectedRank.badgeBg, color: selectedRank.color }}
                >
                  {selectedRank.grade}
                </span>
                <div>
                  <p className="wd-improvement-desc">{selectedRank.description}</p>
                  <Stars count={selectedRank.stars} />
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                    Required score: {selectedRank.minScore}+
                  </p>
                </div>
              </div>

              {gradeStatus(selectedRank.grade, currentGrade) === 'current' && (
                <div className="wd-current-banner">
                  <i className="fas fa-trophy"></i> This is your current rank!
                </div>
              )}

              <h4 style={{ marginBottom: '0.75rem', color: '#334155' }}>
                <i className="fas fa-lightbulb" style={{ color: '#f59e0b' }}></i> Tips to Reach / Maintain {selectedRank.grade}
              </h4>
              <ul className="wd-tips-list">
                {selectedRank.tips.map((tip, i) => (
                  <li key={i}><i className="fas fa-check-circle"></i> {tip}</li>
                ))}
              </ul>
            </div>
            <div className="c2s-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImprovement(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL C — Overtime Request */}
      {showOvertimeModal && (
        <div className="c2s-modal-overlay" onClick={() => setShowOvertimeModal(false)}>
          <div className="c2s-modal-dialog wd-modal" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header wd-modal-header">
              <h2><i className="fas fa-business-time"></i> Overtime Request</h2>
              <button className="c2s-modal-close" onClick={() => setShowOvertimeModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              {overtime && !overtime.eligible ? (
                <div className="wd-ineligible-alert">
                  <div className="wd-ineligible-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <h3>You Are Not Eligible for Overtime</h3>
                  <p>
                    You must have been present for at least 5 of the last 7 working days.
                    Currently you have been present for <strong>{overtime.recent_present}</strong> days.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>Please maintain consistent attendance to become eligible.</p>
                </div>
              ) : (
                <form onSubmit={handleOvertimeSubmit}>
                  <div className="wd-eligible-badge">
                    <i className="fas fa-check-circle"></i> You are eligible to request overtime
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Requested Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={otForm.requested_date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => setOtForm({ ...otForm, requested_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Overtime Hours Requested</label>
                    <select
                      className="form-control"
                      value={otForm.overtime_hours}
                      onChange={e => setOtForm({ ...otForm, overtime_hours: parseFloat(e.target.value) })}
                    >
                      {[1, 1.5, 2, 2.5, 3, 4].map(h => (
                        <option key={h} value={h}>{h} hour{h !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason / Task Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe the work you will be doing during overtime…"
                      value={otForm.reason}
                      onChange={e => setOtForm({ ...otForm, reason: e.target.value })}
                      required
                    />
                  </div>
                  <div className="c2s-modal-footer" style={{ padding: '0', border: 'none', background: 'none', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowOvertimeModal(false)}>Close</button>
                    <button type="submit" className="wd-btn-teal" disabled={otSubmitting}>
                      <i className={`fas ${otSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                      {otSubmitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
              {overtime?.eligible === false && (
                <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
                  <button className="btn btn-secondary" onClick={() => setShowOvertimeModal(false)}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL D — Bonus Details */}
      {showBonusDetail && bonus && (
        <div className="c2s-modal-overlay" onClick={() => setShowBonusDetail(false)}>
          <div className="c2s-modal-dialog wd-modal" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header wd-modal-header">
              <h2><i className="fas fa-gift"></i> Bonus Eligibility Details</h2>
              <button className="c2s-modal-close" onClick={() => setShowBonusDetail(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              {bonus.eligible ? (
                <div className="wd-eligible-big">
                  <i className="fas fa-trophy"></i>
                  <h3>Congratulations! You're Eligible</h3>
                  <p>Your performance bonus of <strong>৳{bonus.bonus_amount?.toFixed(2)}</strong> will be credited to your monthly payslip.</p>
                </div>
              ) : (
                <>
                  <div className="wd-ineligible-alert">
                    <div className="wd-ineligible-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Not Currently Eligible</h3>
                    <p>You do not meet one or more of the bonus eligibility criteria.</p>
                  </div>

                  <div className="wd-criteria-grid">
                    <div className={`wd-criteria-item ${bonus.attendance_rate >= 85 ? 'met' : 'not-met'}`}>
                      <i className={`fas ${bonus.attendance_rate >= 85 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      <div>
                        <strong>Attendance ≥ 85%</strong>
                        <span>Your rate: {bonus.attendance_rate?.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className={`wd-criteria-item ${bonus.safety_issues === 0 ? 'met' : 'not-met'}`}>
                      <i className={`fas ${bonus.safety_issues === 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      <div>
                        <strong>Zero Safety Violations</strong>
                        <span>Open reports: {bonus.safety_issues}</span>
                      </div>
                    </div>
                  </div>

                  {bonus.reasons?.length > 0 && (
                    <ul className="wd-tips-list" style={{ marginTop: '1rem' }}>
                      {bonus.reasons.map((r, i) => (
                        <li key={i}><i className="fas fa-arrow-right"></i> {r}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
            <div className="c2s-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBonusDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </WorkerLayout>
  );
};

export default WorkerDashboard;
