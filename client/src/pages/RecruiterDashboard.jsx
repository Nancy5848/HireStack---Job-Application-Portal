import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { JOB_TYPES, EXPERIENCE_LEVELS, STATUS_COLORS } from '../utils/constants';

const EMPTY_JOB = {
  title: '', description: '', location: '', jobType: 'Full Time', experienceLevel: 'Fresher',
  category: '', salaryMin: '', salaryMax: '', isRemote: false, requiredSkills: ''
};

export default function RecruiterDashboard() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_JOB);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [jobsRes, analyticsRes] = await Promise.allSettled([
      api.get('/jobs/recruiter/mine'),
      api.get('/analytics/recruiter')
    ]);
    if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.jobs);
    if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/jobs', {
        ...form,
        salaryMin: Number(form.salaryMin) || undefined,
        salaryMax: Number(form.salaryMax) || undefined,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      });
      setShowForm(false);
      setForm(EMPTY_JOB);
      loadAll();
      showToast('Job posted successfully!');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    await api.delete(`/jobs/${id}`);
    loadAll();
    showToast('Job deleted');
  };

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/applications/job/${job._id}`);
    setApplicants(data.applications);
    setTab('applicants');
  };

  const updateStatus = async (appId, status) => {
    await api.put(`/applications/${appId}/status`, { status });
    showToast(`Application marked as ${status}`);
    if (selectedJob) {
      const { data } = await api.get(`/applications/job/${selectedJob._id}`);
      setApplicants(data.applications);
    }
  };

  if (loading) {
    return <div className="hs-container py-5"><div className="hs-skeleton" style={{ height: 300, borderRadius: 20 }} /></div>;
  }

  return (
    <div className="hs-container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">Recruiter dashboard</h2>
        <button className="hs-btn hs-btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Post a job'}
        </button>
      </div>

      {analytics && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Jobs Posted', value: analytics.jobsPosted, icon: 'bi-briefcase' },
            { label: 'Total Applications', value: analytics.totalApplications, icon: 'bi-people' },
            { label: 'Acceptance Rate', value: `${analytics.acceptanceRate}%`, icon: 'bi-graph-up' }
          ].map((c) => (
            <div className="col-6 col-md-4" key={c.label}>
              <div className="hs-card p-3">
                <i className={`bi ${c.icon} mb-2 d-block fs-5`} style={{ color: 'var(--hs-accent)' }} />
                <div className="fs-4 fw-bold">{c.value}</div>
                <div className="small" style={{ color: 'var(--hs-text-dim)' }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateJob} className="hs-card p-4 mb-4">
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Job title</label>
              <input className="hs-input" name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Location</label>
              <input className="hs-input" name="location" value={form.location} onChange={handleFormChange} required />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Description</label>
              <textarea className="hs-input" name="description" rows={4} value={form.description} onChange={handleFormChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Job type</label>
              <select className="hs-input" name="jobType" value={form.jobType} onChange={handleFormChange}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Experience level</label>
              <select className="hs-input" name="experienceLevel" value={form.experienceLevel} onChange={handleFormChange}>
                {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Category</label>
              <input className="hs-input" name="category" value={form.category} onChange={handleFormChange} placeholder="e.g. Engineering" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Salary min (₹/yr)</label>
              <input className="hs-input" type="number" name="salaryMin" value={form.salaryMin} onChange={handleFormChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Salary max (₹/yr)</label>
              <input className="hs-input" type="number" name="salaryMax" value={form.salaryMax} onChange={handleFormChange} />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <label className="d-flex align-items-center gap-2">
                <input type="checkbox" name="isRemote" checked={form.isRemote} onChange={handleFormChange} /> Remote friendly
              </label>
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Required skills (comma separated)</label>
              <input className="hs-input" name="requiredSkills" value={form.requiredSkills} onChange={handleFormChange} placeholder="React, Node.js, MongoDB" />
            </div>
          </div>
          <button className="hs-btn hs-btn-primary mt-4" type="submit">Publish job</button>
        </form>
      )}

      <div className="d-flex gap-2 mb-4">
        <button
          className="hs-btn"
          style={{ background: tab === 'jobs' ? 'var(--hs-accent-grad)' : 'var(--hs-surface-2)', color: tab === 'jobs' ? '#fff' : 'var(--hs-text)' }}
          onClick={() => setTab('jobs')}
        >
          My jobs
        </button>
        {selectedJob && (
          <button
            className="hs-btn"
            style={{ background: tab === 'applicants' ? 'var(--hs-accent-grad)' : 'var(--hs-surface-2)', color: tab === 'applicants' ? '#fff' : 'var(--hs-text)' }}
            onClick={() => setTab('applicants')}
          >
            Applicants — {selectedJob.title}
          </button>
        )}
      </div>

      {tab === 'jobs' && (
        <div className="d-flex flex-column gap-3">
          {jobs.length === 0 && <p style={{ color: 'var(--hs-text-dim)' }}>You haven't posted any jobs yet.</p>}
          {jobs.map((job) => (
            <div className="hs-card p-4 d-flex justify-content-between align-items-center flex-wrap gap-2" key={job._id}>
              <div>
                <h6 className="fw-semibold mb-1">{job.title}</h6>
                <p className="small mb-0" style={{ color: 'var(--hs-text-dim)' }}>
                  {job.location} · {job.jobType} · {job.applicationsCount} applicants · {job.views} views
                </p>
              </div>
              <div className="d-flex gap-2">
                <button className="hs-btn hs-btn-outline" onClick={() => viewApplicants(job)}>View applicants</button>
                <button className="hs-btn hs-btn-outline" style={{ borderColor: 'var(--hs-danger)', color: 'var(--hs-danger)' }} onClick={() => handleDeleteJob(job._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'applicants' && (
        <div className="d-flex flex-column gap-3">
          {applicants.length === 0 && <p style={{ color: 'var(--hs-text-dim)' }}>No applicants yet for this role.</p>}
          {applicants.map((app) => (
            <div className="hs-card p-4" key={app._id}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h6 className="fw-semibold mb-1">{app.student?.user?.name}</h6>
                  <p className="small mb-0" style={{ color: 'var(--hs-text-dim)' }}>{app.student?.user?.email}</p>
                </div>
                <span className="hs-badge">{app.skillMatchPercentage}% match</span>
              </div>

              <div className="d-flex gap-2 mt-3 flex-wrap">
                <a href={`${api.defaults.baseURL}/students/${app.student?._id}/resume/download`} className="hs-btn hs-btn-outline">
                  Download resume
                </a>
                {['Shortlisted', 'Interview', 'Selected', 'Rejected'].map((s) => (
                  <button
                    key={s}
                    className="hs-btn"
                    style={{
                      background: app.status === s ? STATUS_COLORS[s] : 'var(--hs-surface-2)',
                      color: app.status === s ? '#fff' : 'var(--hs-text)'
                    }}
                    onClick={() => updateStatus(app._id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
