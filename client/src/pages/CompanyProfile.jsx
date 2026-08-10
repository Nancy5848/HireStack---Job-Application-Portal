import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function CompanyProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', isAnonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const [companyRes, jobsRes, reviewsRes] = await Promise.allSettled([
      api.get(`/companies/${id}`),
      api.get('/jobs', { params: { limit: 6 } }),
      api.get(`/reviews/${id}`)
    ]);
    if (companyRes.status === 'fulfilled') setCompany(companyRes.value.data.company);
    if (jobsRes.status === 'fulfilled') {
      setJobs(jobsRes.value.data.jobs.filter((j) => j.company?._id === id));
    }
    if (reviewsRes.status === 'fulfilled') {
      setReviews(reviewsRes.value.data.reviews);
      setAvgRating(reviewsRes.value.data.avgRating);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      setMessage('Review submitted — thank you!');
      setReviewForm({ rating: 5, title: '', comment: '', isAnonymous: false });
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="hs-container py-5"><div className="hs-skeleton" style={{ height: 260, borderRadius: 20 }} /></div>;
  }

  if (!company) {
    return (
      <div className="hs-container py-5 text-center">
        <h3>Company not found</h3>
        <Link to="/jobs" className="hs-btn hs-btn-outline mt-3">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="hs-container py-5">
      <div className="hs-card p-4 mb-4">
        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 fw-bold fs-3"
            style={{ width: 72, height: 72, background: 'var(--hs-surface-2)' }}
          >
            {company.logo ? (
              <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
            ) : (
              company.name.charAt(0)
            )}
          </div>
          <div>
            <h2 className="fw-bold mb-1">{company.name}</h2>
            <p className="mb-0" style={{ color: 'var(--hs-text-dim)' }}>
              {company.industry} · {company.headquarters}
            </p>
          </div>
          {avgRating > 0 && (
            <div className="ms-auto hs-badge" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-star-fill me-1" style={{ color: 'var(--hs-warning)' }} />
              {avgRating} ({reviews.length} reviews)
            </div>
          )}
        </div>
        <p style={{ color: 'var(--hs-text-dim)' }}>{company.description || 'This company has not added a description yet.'}</p>
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" className="hs-gradient-text small">
            Visit website <i className="bi bi-box-arrow-up-right" />
          </a>
        )}
      </div>

      {company.gallery?.length > 0 && (
        <div className="hs-card p-4 mb-4">
          <h5 className="fw-semibold mb-3">Culture & Office</h5>
          <div className="row g-3">
            {company.gallery.map((g, i) => (
              <div className="col-md-4" key={i}>
                <img src={g.url} alt={g.caption} className="rounded-3 w-100" style={{ height: 160, objectFit: 'cover' }} />
                {g.caption && <div className="small mt-1" style={{ color: 'var(--hs-text-dim)' }}>{g.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mb-4">
          <h5 className="fw-semibold mb-3">Open roles at {company.name}</h5>
          <div className="row g-4">
            {jobs.map((job) => (
              <div className="col-md-4" key={job._id}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hs-card p-4">
        <h5 className="fw-semibold mb-3">Reviews</h5>

        {reviews.length === 0 && <p style={{ color: 'var(--hs-text-dim)' }}>No reviews yet — be the first to share your experience.</p>}

        <div className="d-flex flex-column gap-3 mb-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-3" style={{ borderBottom: '1px solid var(--hs-border)' }}>
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">{r.title || 'Review'}</span>
                <span>
                  {'★'.repeat(r.rating)}
                  <span style={{ color: 'var(--hs-border)' }}>{'★'.repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="small mb-1" style={{ color: 'var(--hs-text-dim)' }}>{r.comment}</p>
              <div className="small" style={{ color: 'var(--hs-text-dim)', fontSize: '0.75rem' }}>— {r.reviewer}</div>
            </div>
          ))}
        </div>

        {user?.role === 'student' && (
          <form onSubmit={submitReview}>
            <h6 className="fw-semibold mb-2">Leave a review</h6>
            {message && <div className="alert alert-info py-2 small">{message}</div>}
            <div className="mb-2">
              <select
                className="hs-input"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
            </div>
            <div className="mb-2">
              <input
                className="hs-input"
                placeholder="Review title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <textarea
                className="hs-input"
                rows={3}
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              />
            </div>
            <label className="d-flex align-items-center gap-2 small mb-3" style={{ color: 'var(--hs-text-dim)' }}>
              <input
                type="checkbox"
                checked={reviewForm.isAnonymous}
                onChange={(e) => setReviewForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
              />
              Post anonymously
            </label>
            <button className="hs-btn hs-btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
