import React, { useState, useEffect, useRef } from 'react';
import WorkerLayout from './WorkerLayout';
import { safetyAPI, workerSettingsAPI } from '../api';
import './WorkerIncidentReport.css';

const INCIDENT_TYPES = [
  'Machine Hazard',
  'Public Safety',
  'Personal Protection Equipment',
  'Chemical / Fire Risk',
  'Electrical Hazard',
  'Slip / Fall Hazard',
  'Other',
];

const WorkerIncidentReport = () => {
  const user = JSON.parse(localStorage.getItem('user')) || null;

  const [supervisors, setSupervisors]       = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recording, setRecording]           = useState(false);
  const [transcript, setTranscript]         = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [error, setError]                   = useState(null);

  const recognitionRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Machine Hazard',
    location: '',
    description_bn: '',
    description_en: '',
    supervisor_id: '',
    severity: 'Major',
  });

  useEffect(() => {
    workerSettingsAPI.getSupervisors().then(res => {
      setSupervisors(res.data?.data || []);
    }).catch(err => {
      console.error('Failed to load supervisors:', err);
    });
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('ভয়েস রেকর্ডিং এই ব্রাউজারে সমর্থিত নয়। অনুগ্রহ করে Chrome বা Edge ব্যবহার করুন। (Voice recognition is supported in Chrome/Edge)');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setRecording(true);
    };

    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setTranscript(prev => prev + ' ' + final);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error', e);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const handleVoiceSend = async () => {
    if (!transcript.trim()) {
      alert('কোনো বার্তা রেকর্ড করা হয়নি। (No message recorded)');
      return;
    }
    setSubmitting(true);
    try {
      await safetyAPI.submitReport({
        title: 'ভয়েস রিপোর্ট — ' + new Date().toLocaleDateString('bn-BD'),
        category: 'Public Safety',
        severity: 'Major',
        location: 'Floor / কারখানা চত্বর',
        description_bn: transcript.trim(),
        description_en: '',
        reported_by: user?.id,
      });
      setShowVoiceModal(false);
      setTranscript('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      alert('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelVoice = () => {
    stopRecording();
    setTranscript('');
    setShowVoiceModal(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description_bn) {
      alert('শিরোনাম এবং বাংলা বিবরণ আবশ্যক। (Title and Bengali description required)');
      return;
    }
    setSubmitting(true);
    try {
      await safetyAPI.submitReport({
        ...form,
        reported_by: user?.id,
      });
      setForm({
        title: '', category: 'Machine Hazard', location: '',
        description_bn: '', description_en: '', supervisor_id: '', severity: 'Major',
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      alert('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <WorkerLayout>
        <div className="wir-page">
          <div className="wir-loading">Please log in to report incidents.</div>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="wir-page">
        {submitted && (
          <div className="wir-toast">
            <i className="fas fa-check-circle"></i>
            রিপোর্টটি সফলভাবে দাখিল হয়েছে! (Report submitted successfully!)
          </div>
        )}

        {error && (
          <div className="wir-error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        <div className="wir-page-header">
          <div>
            <h1 className="wir-page-title">
              <i className="fas fa-file-alt"></i> Incident Report — ঘটনার প্রতিবেদন
            </h1>
            <p className="wir-page-sub">
              Report workplace hazards or safety issues in Bengali or English.
            </p>
          </div>
        </div>

        {/* Voice Banner */}
        <div className="wir-voice-banner" onClick={() => setShowVoiceModal(true)}>
          <div className="wir-voice-icon-wrap">
            <div className="wir-voice-icon">
              <i className="fas fa-microphone"></i>
            </div>
            <div className="wir-voice-rings">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div className="wir-voice-text">
            <h3>ভয়েস রেকর্ডিং দিয়ে রিপোর্ট করুন</h3>
            <p>বাংলায় বলুন — আমরা শুনছি। Click to start voice recording.</p>
          </div>
          <div className="wir-voice-cta">
            <span><i className="fas fa-play-circle"></i> Start Recording</span>
          </div>
        </div>

        <div className="wir-divider">
          <span>— অথবা ফর্ম পূরণ করুন / Fill out the form below —</span>
        </div>

        {/* Incident Form */}
        <div className="wir-form-card">
          <div className="wir-form-header">
            <i className="fas fa-clipboard-list"></i>
            <h3>Incident Report Form — ঘটনার বিবরণ ফর্ম</h3>
          </div>

          <form className="wir-form" onSubmit={handleFormSubmit}>
            <div className="wir-form-grid">
              <div className="form-group">
                <label className="form-label">
                  Incident Type — ঘটনার ধরন <span className="wir-req">*</span>
                </label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value, title: e.target.value })}
                  required
                >
                  {INCIDENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Severity — মাত্রা <span className="wir-req">*</span>
                </label>
                <select
                  className="form-control"
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="Minor">Minor — সাধারণ</option>
                  <option value="Major">Major — গুরুত্বপূর্ণ</option>
                  <option value="Critical">Critical — জরুরী</option>
                </select>
              </div>

              <div className="form-group wir-full">
                <label className="form-label">
                  Incident Title — শিরোনাম <span className="wir-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: সুইং লাইনে খোলা বৈদ্যুতিক তার / Open wire on sewing line"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group wir-full">
                <label className="form-label">
                  Location — স্থান <span className="wir-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: লাইন ৩, পূর্ব পাশের সিঁড়ি / Line 3, East staircase"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group wir-full">
                <label className="form-label">
                  বাংলায় বিবরণ (Bengali Description) <span className="wir-req">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="কী ধরনের ঝুঁকি বা ত্রুটি দেখেছেন তা নিজের ভাষায় লিখুন…"
                  value={form.description_bn}
                  onChange={e => setForm({ ...form, description_bn: e.target.value })}
                  required
                />
              </div>

              <div className="form-group wir-full">
                <label className="form-label">
                  English Description <span className="wir-optional">(optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe the incident in English (optional)…"
                  value={form.description_en}
                  onChange={e => setForm({ ...form, description_en: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Assign Supervisor <span className="wir-optional">(optional)</span>
                </label>
                <select
                  className="form-control"
                  value={form.supervisor_id}
                  onChange={e => setForm({ ...form, supervisor_id: e.target.value })}
                >
                  <option value="">— Select supervisor —</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.employee_id}){s.line_name ? ` — ${s.line_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Attach Evidence <span className="wir-optional">(optional)</span>
                </label>
                <div className="wir-file-input">
                  <i className="fas fa-paperclip"></i>
                  <input type="file" accept="image/*,.pdf" />
                  <span>Choose image or file</span>
                </div>
              </div>
            </div>

            <div className="wir-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm({
                  title: '', category: 'Machine Hazard', location: '',
                  description_bn: '', description_en: '', supervisor_id: '', severity: 'Major',
                })}
              >
                <i className="fas fa-undo"></i> Clear Form
              </button>
              <button
                type="submit"
                className="wir-submit-btn"
                disabled={submitting}
              >
                <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                {submitting ? 'জমা হচ্ছে…' : 'Submit Report — জমা দিন'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="c2s-modal-overlay" onClick={handleCancelVoice}>
          <div className="c2s-modal-dialog wir-voice-modal" onClick={e => e.stopPropagation()}>
            <div className="c2s-modal-header">
              <h2><i className="fas fa-microphone"></i> ভয়েস রেকর্ডিং</h2>
              <button className="c2s-modal-close" onClick={handleCancelVoice}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              <div className="wir-mic-center">
                <div
                  className={`wir-mic-btn ${recording ? 'recording' : ''}`}
                  onClick={recording ? stopRecording : startRecording}
                >
                  <i className="fas fa-microphone"></i>
                </div>
                {recording && (
                  <div className="wir-waveform">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="wir-wave-bar" style={{ animationDelay: `${i * 0.08}s` }}></div>
                    ))}
                  </div>
                )}
                <p className="wir-mic-hint">
                  {recording
                    ? 'রেকর্ডিং চলছে… ক্লিক করে থামান (Recording… click to stop)'
                    : 'মাইক্রোফোনে ক্লিক করে কথা বলুন (Click microphone to speak)'}
                </p>
              </div>

              {transcript && (
                <div className="wir-transcript-box">
                  <p className="wir-transcript-label">আপনার বার্তা (Your message):</p>
                  <p className="wir-transcript-text">{transcript}</p>
                </div>
              )}

              <p className="wir-voice-tip">
                <i className="fas fa-info-circle"></i>
                বাংলায় কথা বলুন। Chrome বা Edge ব্রাউজারে ভয়েস রেকর্ডিং সবচেয়ে ভালো কাজ করে।
              </p>
            </div>
            <div className="c2s-modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelVoice}>
                বন্ধ করুন (Cancel)
              </button>
              <button
                className="wir-send-btn"
                onClick={handleVoiceSend}
                disabled={!transcript.trim() || submitting}
              >
                <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                পাঠান (Send)
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkerLayout>
  );
};

export default WorkerIncidentReport;
