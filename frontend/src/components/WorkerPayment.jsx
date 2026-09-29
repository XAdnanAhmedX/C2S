import React, { useState, useEffect } from 'react';
import WorkerLayout from './WorkerLayout';
import { workerPaymentAPI } from '../api';
import './WorkerPayment.css';

const METHOD_ICONS = {
  'bKash':         { icon: 'fas fa-mobile-alt', color: '#e40066', bg: '#fce4ed' },
  'Nagad':         { icon: 'fas fa-mobile-alt', color: '#f2711c', bg: '#fde8d8' },
  'Rocket':        { icon: 'fas fa-rocket',     color: '#7c3aed', bg: '#ede9fe' },
  'Bank Transfer': { icon: 'fas fa-university', color: '#1d4ed8', bg: '#dbeafe' },
};

const maskAccount = (num) => {
  if (!num || num.length < 5) return num;
  return '•••• ' + num.slice(-4);
};

const formatTaka = (amount) =>
  '৳' + (parseFloat(amount) || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusClass = { paid: 'status-paid', pending: 'status-pending', processing: 'status-processing' };

const WorkerPayment = () => {
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userId = user?.id;

  const [payslips, setPayslips]           = useState([]);
  const [methods, setMethods]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [addForm, setAddForm] = useState({
    method_type: 'bKash',
    account_number: '',
    account_name: '',
    is_primary: false,
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ps, ms] = await Promise.all([
        workerPaymentAPI.getPayslips(userId),
        workerPaymentAPI.getPaymentMethods(userId),
      ]);
      setPayslips(ps.data?.data || []);
      setMethods(ms.data?.data || []);
    } catch (err) {
      setError('Failed to load payment data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.account_number.trim()) {
      alert('Account number is required.');
      return;
    }
    setAddSubmitting(true);
    try {
      await workerPaymentAPI.addPaymentMethod({ user_id: userId, ...addForm });
      setShowAddModal(false);
      setAddForm({ method_type: 'bKash', account_number: '', account_name: '', is_primary: false });
      loadAll();
    } catch (err) {
      alert('Failed to add payment method. Please try again.');
      console.error(err);
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleSetPrimary = async (methodId) => {
    try {
      await workerPaymentAPI.setPrimary({ user_id: userId, method_id: methodId });
      loadAll();
    } catch (err) {
      alert('Failed to update primary method. Please try again.');
      console.error(err);
    }
  };

  const currentPayslip = payslips[0] || null;
  const historyPayslips = payslips.slice(1);

  if (!user) {
    return (
      <WorkerLayout>
        <div className="wp-page">
          <div className="wp-loading">Please log in to view your payment information.</div>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="wp-page">
        {loading && <div className="wp-loading"><i className="fas fa-spinner fa-spin"></i> Loading payment data…</div>}

        {error && (
          <div className="wp-error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Current Month Payslip */}
            <div className="wp-payslip-card">
              <div className="wp-payslip-header">
                <div className="wp-payslip-title">
                  <i className="fas fa-file-invoice-dollar"></i>
                  <div>
                    <h2>Current Month Payslip</h2>
                    <p>{currentPayslip?.pay_period
                      ? new Date(currentPayslip.pay_period + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                      : new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                    }</p>
                  </div>
                </div>
                <span className={`wp-status-tag ${statusClass[currentPayslip?.status] || 'status-pending'}`}>
                  {currentPayslip?.status || 'Pending'}
                </span>
              </div>

              <div className="wp-payslip-body">
                <div className="wp-payslip-rows">
                  <div className="wp-pay-row">
                    <span>Base Salary</span>
                    <span>{formatTaka(currentPayslip?.base_salary)}</span>
                  </div>
                  <div className="wp-pay-row positive">
                    <span><i className="fas fa-plus-circle"></i> Attendance Bonus</span>
                    <span>+ {formatTaka(currentPayslip?.attendance_bonus)}</span>
                  </div>
                  <div className="wp-pay-row positive">
                    <span><i className="fas fa-plus-circle"></i> Performance Bonus</span>
                    <span>+ {formatTaka(currentPayslip?.performance_bonus)}</span>
                  </div>
                  <div className="wp-pay-row positive">
                    <span><i className="fas fa-plus-circle"></i> Overtime Pay</span>
                    <span>+ {formatTaka(currentPayslip?.overtime_pay)}</span>
                  </div>
                  <div className="wp-pay-row negative">
                    <span><i className="fas fa-minus-circle"></i> Deductions (PF)</span>
                    <span>− {formatTaka(currentPayslip?.deductions)}</span>
                  </div>
                  <div className="wp-pay-row wp-total-row">
                    <span>Net Salary</span>
                    <span className="wp-net-amount">{formatTaka(currentPayslip?.net_salary)}</span>
                  </div>
                </div>

                <div className="wp-payslip-chart">
                  <h4>Breakdown</h4>
                  {[
                    { label: 'Base',        value: parseFloat(currentPayslip?.base_salary),        color: '#1A5653' },
                    { label: 'Att. Bonus',  value: parseFloat(currentPayslip?.attendance_bonus),   color: '#7BC47F' },
                    { label: 'Perf. Bonus', value: parseFloat(currentPayslip?.performance_bonus),  color: '#F5C518' },
                    { label: 'Overtime',    value: parseFloat(currentPayslip?.overtime_pay),       color: '#f59e0b' },
                  ].map(item => {
                    const net = parseFloat(currentPayslip?.net_salary) || 1;
                    const pct = Math.min(100, (item.value / net) * 100);
                    return (
                      <div key={item.label} className="wp-chart-bar-row">
                        <span className="wp-chart-label">{item.label}</span>
                        <div className="wp-chart-track">
                          <div className="wp-chart-fill" style={{ width: `${pct}%`, background: item.color }}></div>
                        </div>
                        <span className="wp-chart-val">{formatTaka(item.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentPayslip?.method_type && (
                <div className="wp-payslip-footer">
                  <i className="fas fa-paper-plane"></i>
                  Payment via <strong>{currentPayslip.method_type}</strong> · {maskAccount(currentPayslip.account_number)}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="wp-section-header">
              <h3><i className="fas fa-wallet"></i> Payment Methods</h3>
              <button className="wp-add-btn" onClick={() => setShowAddModal(true)}>
                <i className="fas fa-plus"></i> Add New Payment Method
              </button>
            </div>

            <div className="wp-methods-row">
              {methods.length === 0 ? (
                <div className="wp-empty-methods">
                  <i className="fas fa-wallet"></i>
                  <p>No payment methods added yet.</p>
                  <button className="wp-add-btn-sm" onClick={() => setShowAddModal(true)}>
                    <i className="fas fa-plus"></i> Add Method
                  </button>
                </div>
              ) : (
                methods.map(m => {
                  const meta = METHOD_ICONS[m.method_type] || METHOD_ICONS['Bank Transfer'];
                  return (
                    <div key={m.id} className={`wp-method-card ${m.is_primary ? 'primary' : ''}`}>
                      <div className="wp-method-icon" style={{ background: meta.bg, color: meta.color }}>
                        <i className={meta.icon}></i>
                      </div>
                      <div className="wp-method-info">
                        <span className="wp-method-type">{m.method_type}</span>
                        <span className="wp-method-acc">{maskAccount(m.account_number)}</span>
                        <span className="wp-method-name">{m.account_name}</span>
                      </div>
                      <div className="wp-method-actions">
                        {m.is_primary
                          ? <span className="wp-primary-tag">Primary</span>
                          : <button className="wp-set-primary" onClick={() => handleSetPrimary(m.id)}>
                              Set Primary
                            </button>
                        }
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment History */}
            <div className="wp-section-header" style={{ marginTop: '0.5rem' }}>
              <h3><i className="fas fa-history"></i> Payment History</h3>
              <span className="wp-record-count">{historyPayslips.length} Records</span>
            </div>

            <div className="wp-history-card">
              <div className="wp-table-wrap">
                <table className="wp-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Base Salary</th>
                      <th>Bonuses</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Via</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="wp-empty-row">No older payment history yet.</td>
                      </tr>
                    ) : historyPayslips.map((ps, i) => (
                      <tr key={ps.id || i} className={i % 2 === 0 ? 'row-white' : 'row-teal'}>
                        <td>
                          <strong>
                            {new Date(ps.pay_period + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </strong>
                        </td>
                        <td>{formatTaka(ps.base_salary)}</td>
                        <td>
                          {formatTaka(
                            (parseFloat(ps.attendance_bonus) || 0) +
                            (parseFloat(ps.performance_bonus) || 0) +
                            (parseFloat(ps.overtime_pay) || 0)
                          )}
                        </td>
                        <td>− {formatTaka(ps.deductions)}</td>
                        <td><strong>{formatTaka(ps.net_salary)}</strong></td>
                        <td>{ps.method_type || '—'}</td>
                        <td>
                          <span className={`wp-status-tag ${statusClass[ps.status] || 'status-pending'}`}>
                            {ps.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Add Payment Method */}
      {showAddModal && (
        <div className="c2s-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="c2s-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header">
              <h2><i className="fas fa-plus-circle"></i> Add New Payment Method</h2>
              <button className="c2s-modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="c2s-modal-body">
                <div className="form-group">
                  <label className="form-label">Payment Method Type</label>
                  <div className="wp-method-types">
                    {Object.keys(METHOD_ICONS).map(type => {
                      const meta = METHOD_ICONS[type];
                      return (
                        <button
                          type="button"
                          key={type}
                          className={`wp-type-btn ${addForm.method_type === type ? 'active' : ''}`}
                          style={addForm.method_type === type ? { borderColor: meta.color, background: meta.bg } : {}}
                          onClick={() => setAddForm({ ...addForm, method_type: type })}
                        >
                          <i className={meta.icon} style={{ color: meta.color }}></i>
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account / Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={addForm.method_type === 'Bank Transfer' ? 'e.g. 1234567890123456' : 'e.g. 01712345678'}
                    value={addForm.account_number}
                    onChange={e => setAddForm({ ...addForm, account_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name on the account"
                    value={addForm.account_name}
                    onChange={e => setAddForm({ ...addForm, account_name: e.target.value })}
                  />
                </div>

                <label className="wp-primary-check">
                  <input
                    type="checkbox"
                    checked={addForm.is_primary}
                    onChange={e => setAddForm({ ...addForm, is_primary: e.target.checked })}
                  />
                  <span>Set as primary payment method</span>
                </label>
              </div>
              <div className="c2s-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="wp-submit-btn" disabled={addSubmitting}>
                  <i className={`fas ${addSubmitting ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                  {addSubmitting ? 'Saving…' : 'Save Payment Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkerLayout>
  );
};

export default WorkerPayment;
