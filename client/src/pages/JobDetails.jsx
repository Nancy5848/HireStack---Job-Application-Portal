import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Confetti from '../components/Confetti';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data.job)).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return setMessage('Only candidate accounts can apply to jobs.');

    setApplying(true);
    setMessage('');
    try {
      await api.post(`/applications/${id}`);
      setApplied(true);
      setShowConfetti(true);
      showToast('Application submitted successfully!');
    } catch (err) {
      setMessage(err.message);
      showToast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/students/saved-jobs/${id}`);
      showToast(data.message);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="hs-container py-5">
        <div className="hs-skeleton" style={{ height: 300, borderRadius: 20 }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="hs-container py-5 text-center">
        <h3>Job not found</h3>
        <Link to="/jobs" className="hs-btn hs-btn-outline mt-3">Back to jobs</Link>
      </div>
    );
  }

  const salary =
    job.salaryMin && job.salaryMax ? `₹${(job.salaryMin / 1000).toFixed(0)}k - ₹${(job.salaryMax / 1000).toFixed(0)}k / year` : 'Not disclosed';

  return (
    <div className="hs-container py-5">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="hs-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-1">{job.title}</h2>
                <p style={{ color: 'var(--hs-text-dim)' }}>{job.company?.name} · {job.location}</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className="hs-badge">{job.jobType}</span>
                <span className="hs-badge">{job.experienceLevel}</span>
                {job.isRemote && <span className="hs-badge">Remote</span>}
              </div>
            </div>

            <hr style={{ borderColor: 'var(--hs-border)' }} />

            <h5 className="fw-semibold mb-2">About this role</h5>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--hs-text-dim)' }}>{job.description}</p>

            {job.responsibilities?.length > 0 && (
              <>
                <h5 className="fw-semibold mt-4 mb-2">Responsibilities</h5>
                <ul>
                  {job.responsibilities.map((r, i) => <li key={i} style={{ color: 'var(--hs-text-dim)' }}>{r}</li>)}
                </ul>
              </>
            )}

            {job.requiredSkills?.length > 0 && (
              <>
                <h5 className="fw-semibold mt-4 mb-2">Required skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => <span key={s} className="hs-badge">{s}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hs-card p-4 mb-3" style={{ position: 'sticky', top: 100 }}>
            <div className="mb-3">
              <div className="small" style={{ color: 'var(--hs-text-dim)' }}>Salary</div>
              <div className="fw-semibold fs-5">{salary}</div>
            </div>

            {message && <div className="alert alert-info py-2 small">{message}</div>}

            <button className="hs-btn hs-btn-primary w-100 mb-2" onClick={handleApply} disabled={applying || applied}>
              {applied ? 'Applied ✓' : applying ? 'Submitting…' : 'Apply now'}
            </button>
            <button className="hs-btn hs-btn-outline w-100" onClick={handleSave}>
              <i className="bi bi-bookmark" /> Save job
            </button>
          </div>

          {job.company && (
            <div className="hs-card p-4">
              <h6 className="fw-semibold mb-2">About {job.company.name}</h6>
              <p style={{ color: 'var(--hs-text-dim)', fontSize: '0.9rem' }}>{job.company.description || 'No description provided yet.'}</p>
              <Link to={`/companies/${job.company._id}`} className="small hs-gradient-text d-block mb-2">
                View company profile & reviews <i className="bi bi-arrow-right" />
              </Link>
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noreferrer" className="small hs-gradient-text">
                  Visit website <i className="bi bi-box-arrow-up-right" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
