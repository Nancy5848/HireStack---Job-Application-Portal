import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { STATUS_COLORS } from '../utils/constants';

export default function StudentDashboard() {
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [profileRes, appsRes, savedRes, scoreRes] = await Promise.allSettled([
      api.get('/students/profile'),
      api.get('/applications/mine'),
      api.get('/students/saved-jobs'),
      api.get('/students/resume-score')
    ]);
    if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.student);
    if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.applications);
    if (savedRes.status === 'fulfilled') setSavedJobs(savedRes.value.data.savedJobs);
    if (scoreRes.status === 'fulfilled') setResumeScore(scoreRes.value.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setSaving(true);
    try {
      await api.post('/students/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!skillInput.trim() || !profile) return;
    const skills = [...(profile.skills || []), skillInput.trim()];
    setSaving(true);
    try {
      const { data } = await api.put('/students/profile', { skills });
      setProfile(data.student);
      setSkillInput('');
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = async (skill) => {
    const skills = profile.skills.filter((s) => s !== skill);
    const { data } = await api.put('/students/profile', { skills });
    setProfile(data.student);
  };

  if (loading) {
    return (
      <div className="hs-container py-5">
        <div className="hs-skeleton" style={{ height: 300, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div className="hs-container py-5">
      <h2 className="fw-bold mb-4">Welcome back, {profile?.user?.name?.split(' ')[0] || 'there'}</h2>

      <div className="row g-3 mb-4">
        {[
          { label: 'Jobs Applied', value: applications.length, icon: 'bi-send' },
          { label: 'Interviews', value: applications.filter((a) => a.status === 'Interview').length, icon: 'bi-camera-video' },
          { label: 'Saved Jobs', value: savedJobs.length, icon: 'bi-bookmark' },
          { label: 'Profile Completion', value: `${profile?.profileCompletion || 0}%`, icon: 'bi-person-check' }
        ].map((c) => (
          <div className="col-6 col-md-3" key={c.label}>
            <div className="hs-card p-3">
              <i className={`bi ${c.icon} mb-2 d-block fs-5`} style={{ color: 'var(--hs-accent)' }} />
              <div className="fs-4 fw-bold">{c.value}</div>
              <div className="small" style={{ color: 'var(--hs-text-dim)' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['overview', 'profile', 'resume', 'applications', 'saved'].map((t) => (
          <button
            key={t}
            className="hs-btn"
            style={{
              background: tab === t ? 'var(--hs-accent-grad)' : 'var(--hs-surface-2)',
              color: tab === t ? '#fff' : 'var(--hs-text)',
              textTransform: 'capitalize'
            }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && resumeScore && (
        <div className="hs-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-semibold mb-0">Resume completeness</h5>
            <span className="fw-bold hs-gradient-text fs-5">{resumeScore.percentage}%</span>
          </div>
          <div className="progress mb-3" style={{ height: 8, background: 'var(--hs-surface-2)' }}>
            <div
              className="progress-bar"
              style={{ width: `${resumeScore.percentage}%`, background: 'var(--hs-accent-grad)' }}
            />
          </div>
          {resumeScore.suggestions.length > 0 && (
            <ul className="mb-0">
              {resumeScore.suggestions.map((s) => (
                <li key={s} style={{ color: 'var(--hs-text-dim)' }}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'profile' && profile && (
        <div className="hs-card p-4">
          <h5 className="fw-semibold mb-3">Skills</h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(profile.skills || []).map((s) => (
              <span key={s} className="hs-badge">
                {s} <i className="bi bi-x ms-1" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
              </span>
            ))}
          </div>
          <div className="d-flex gap-2 mb-4">
            <input
              className="hs-input"
              placeholder="Add a skill (e.g. React.js)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <button className="hs-btn hs-btn-primary" onClick={addSkill} disabled={saving}>Add</button>
          </div>

          <p style={{ color: 'var(--hs-text-dim)' }}>
            For education, experience, projects, and certificates, use the profile edit form (extend this tab with additional
            fields as needed — the backend already supports all of these via <code>PUT /api/students/profile</code>).
          </p>
        </div>
      )}

      {tab === 'resume' && (
        <div className="hs-card p-4">
          <h5 className="fw-semibold mb-3">Resume</h5>
          {profile?.resume?.fileName ? (
            <div className="d-flex align-items-center justify-content-between hs-card p-3 mb-3">
              <div>
                <i className="bi bi-file-earmark-text me-2" style={{ color: 'var(--hs-accent)' }} />
                {profile.resume.fileName}
              </div>
              <a href={`${api.defaults.baseURL}/students/resume/download`} className="hs-btn hs-btn-outline">
                Download
              </a>
            </div>
          ) : (
            <p style={{ color: 'var(--hs-text-dim)' }}>No resume uploaded yet.</p>
          )}
          <input type="file" accept=".pdf,.doc,.docx" className="hs-input" onChange={handleResumeUpload} disabled={saving} />
          <div className="form-text" style={{ color: 'var(--hs-text-dim)' }}>PDF, DOC or DOCX. Max 5MB.</div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="d-flex flex-column gap-3">
          {applications.length === 0 && <p style={{ color: 'var(--hs-text-dim)' }}>No applications yet.</p>}
          {applications.map((app) => (
            <div className="hs-card p-4" key={app._id}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h6 className="fw-semibold mb-1">{app.job?.title}</h6>
                  <p className="small mb-0" style={{ color: 'var(--hs-text-dim)' }}>{app.job?.company?.name}</p>
                </div>
                <span className="hs-badge" style={{ borderColor: STATUS_COLORS[app.status], color: STATUS_COLORS[app.status] }}>
                  {app.status}
                </span>
              </div>
              <div className="mt-3 d-flex flex-wrap gap-2">
                {app.timeline.map((t, i) => (
                  <span key={i} className="hs-badge">{t.status}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'saved' && (
        <div className="row g-3">
          {savedJobs.length === 0 && <p style={{ color: 'var(--hs-text-dim)' }}>No saved jobs yet.</p>}
          {savedJobs.map((job) => (
            <div className="col-md-4" key={job._id}>
              <Link to={`/jobs/${job._id}`} className="hs-card d-block p-3">
                <div className="fw-semibold">{job.title}</div>
                <div className="small" style={{ color: 'var(--hs-text-dim)' }}>{job.company?.name}</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
