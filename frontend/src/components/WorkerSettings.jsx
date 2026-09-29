import React, { useState, useEffect } from 'react';
import WorkerLayout from './WorkerLayout';
import { workerSettingsAPI } from '../api';
import './WorkerSettings.css';

const WorkerSettings = () => {
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userId = user?.id;

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [profile, setProfile]         = useState(null);
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwError, setPwError]         = useState('');

  const [language, setLanguage]       = useState('bn');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workerSettingsAPI.getProfile(userId);
      const data = res.data?.data || {};
      setProfile(data);
      setName(data.full_name || data.user_full_name || '');
      setPhone(data.phone || '');
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await workerSettingsAPI.updateProfile({
        user_id: userId,
        full_name: name,
        phone: phone,
      });
      const updatedUser = { ...user, full_name: name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch (err) {
      alert('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError('');
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await workerSettingsAPI.changePassword({
        user_id: userId,
        new_password: newPassword,
      });
      setPwSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3500);
    } catch (err) {
      setPwError('Failed to change password. Please try again.');
      console.error(err);
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) {
    return (
      <WorkerLayout>
        <div className="ws-page">
          <div className="ws-loading">Please log in to view settings.</div>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="ws-page">
        {loading && <div className="ws-loading"><i className="fas fa-spinner fa-spin"></i> Loading settings…</div>}

        {error && (
          <div className="ws-error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Header Profile Summary */}
            <div className="ws-profile-hero">
              <div className="ws-avatar-lg">
                {(name || 'W').charAt(0).toUpperCase()}
              </div>
              <div className="ws-hero-info">
                <h2>{name}</h2>
                <p className="ws-hero-sub">
                  <span><i className="fas fa-id-card"></i> {profile?.employee_id || '—'}</span>
                  <span><i className="fas fa-industry"></i> {profile?.department || '—'}</span>
                  <span><i className="fas fa-user-tag"></i> {profile?.position || '—'}</span>
                </p>
              </div>
            </div>

            <div className="ws-cards-grid">
              {/* Personal Info */}
              <div className="ws-card">
                <div className="ws-card-header">
                  <i className="fas fa-user-edit"></i>
                  <h3>Personal Information</h3>
                </div>
                <form onSubmit={handleProfileSave} className="ws-card-body">
                  {profileSuccess && (
                    <div className="ws-alert-success">
                      <i className="fas fa-check-circle"></i> Profile details updated successfully!
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile?.email || ''}
                      disabled
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </div>

                  <div className="ws-form-actions">
                    <button type="submit" className="ws-btn-save" disabled={profileSaving}>
                      <i className={`fas ${profileSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                      {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="ws-card">
                <div className="ws-card-header">
                  <i className="fas fa-shield-alt"></i>
                  <h3>Change Password</h3>
                </div>
                <form onSubmit={handlePasswordSave} className="ws-card-body">
                  {pwSuccess && (
                    <div className="ws-alert-success">
                      <i className="fas fa-check-circle"></i> Password updated successfully!
                    </div>
                  )}
                  {pwError && (
                    <div className="ws-alert-error">
                      <i className="fas fa-exclamation-circle"></i> {pwError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ws-form-actions">
                    <button type="submit" className="ws-btn-save" disabled={pwSaving}>
                      <i className={`fas ${pwSaving ? 'fa-spinner fa-spin' : 'fa-key'}`}></i>
                      {pwSaving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preferences */}
              <div className="ws-card ws-card-wide">
                <div className="ws-card-header">
                  <i className="fas fa-sliders-h"></i>
                  <h3>Preferences &amp; Notifications</h3>
                </div>
                <div className="ws-card-body">
                  <div className="ws-pref-row">
                    <div>
                      <strong>Portal Language / পোর্টালের ভাষা</strong>
                      <p>Select your preferred display language for announcements and interface</p>
                    </div>
                    <div className="ws-lang-toggle">
                      <button
                        type="button"
                        className={`ws-lang-btn ${language === 'bn' ? 'active' : ''}`}
                        onClick={() => setLanguage('bn')}
                      >
                        বাংলা (Bangla)
                      </button>
                      <button
                        type="button"
                        className={`ws-lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '1rem 0' }} />

                  <div className="ws-pref-row">
                    <div>
                      <strong>SMS Salary &amp; Shift Alerts</strong>
                      <p>Receive SMS alerts when payslips are generated or shift timings change</p>
                    </div>
                    <label className="ws-switch">
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={e => setSmsAlerts(e.target.checked)}
                      />
                      <span className="ws-slider"></span>
                    </label>
                  </div>

                  <div className="ws-pref-row" style={{ marginTop: '0.75rem' }}>
                    <div>
                      <strong>Safety Incident Notifications</strong>
                      <p>Get notified when your submitted incident reports are reviewed</p>
                    </div>
                    <label className="ws-switch">
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={e => setEmailAlerts(e.target.checked)}
                      />
                      <span className="ws-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerSettings;
