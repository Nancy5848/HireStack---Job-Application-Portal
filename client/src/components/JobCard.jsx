import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `₹${(job.salaryMin / 1000).toFixed(0)}k - ₹${(job.salaryMax / 1000).toFixed(0)}k`
      : 'Not disclosed';

  return (
    <Link to={`/jobs/${job._id}`} className="hs-card d-block p-4 h-100 hs-fade-up">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: 48, height: 48, background: 'var(--hs-surface-2)', fontWeight: 700 }}
        >
          {job.company?.logo ? (
            <img src={job.company.logo} alt={job.company?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
          ) : (
            job.company?.name?.charAt(0) || 'H'
          )}
        </div>
        {job.isFeatured && <span className="hs-badge">Featured</span>}
      </div>

      <h5 className="mb-1">{job.title}</h5>
      <p className="mb-2" style={{ color: 'var(--hs-text-dim)', fontSize: '0.9rem' }}>
        {job.company?.name || 'Hirestack Partner'}
      </p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="hs-badge"><i className="bi bi-geo-alt me-1" />{job.location}</span>
        <span className="hs-badge">{job.jobType}</span>
        {job.isRemote && <span className="hs-badge">Remote</span>}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <span style={{ color: 'var(--hs-accent-2)', fontWeight: 600, fontSize: '0.9rem' }}>{salary}</span>
        <span style={{ color: 'var(--hs-text-dim)', fontSize: '0.8rem' }}>{job.experienceLevel}</span>
      </div>
    </Link>
  );
}
