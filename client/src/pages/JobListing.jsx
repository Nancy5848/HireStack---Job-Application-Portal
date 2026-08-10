import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../utils/constants';

export default function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    sort: '',
    page: 1
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="hs-container py-5">
      <h2 className="fw-bold mb-4">Browse open roles</h2>

      <div className="hs-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="hs-input"
              placeholder="Search title, skill, keyword…"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input
              className="hs-input"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select className="hs-input" value={filters.jobType} onChange={(e) => updateFilter('jobType', e.target.value)}>
              <option value="">All types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="hs-input" value={filters.experienceLevel} onChange={(e) => updateFilter('experienceLevel', e.target.value)}>
              <option value="">All levels</option>
              {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="hs-input" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary-high">Salary: high to low</option>
              <option value="salary-low">Salary: low to high</option>
            </select>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--hs-text-dim)' }}>{pagination.total} roles found</p>

      <div className="row g-4 mb-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div className="col-md-4" key={i}>
              <div className="hs-skeleton" style={{ height: 220 }} />
            </div>
          ))}

        {!loading && jobs.length === 0 && (
          <div className="col-12 text-center py-5" style={{ color: 'var(--hs-text-dim)' }}>
            No jobs match your filters yet. Try widening your search.
          </div>
        )}

        {!loading && jobs.map((job) => (
          <div className="col-md-4" key={job._id}>
            <JobCard job={job} />
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              className="hs-btn hs-btn-outline"
              style={{
                padding: '8px 14px',
                background: pagination.page === i + 1 ? 'var(--hs-accent-grad)' : undefined,
                color: pagination.page === i + 1 ? '#fff' : undefined
              }}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
