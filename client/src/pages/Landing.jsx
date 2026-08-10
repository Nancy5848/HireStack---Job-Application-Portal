import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import JobCard from '../components/JobCard';

const STATS = [
  { label: 'Active job seekers', value: '12,400+' },
  { label: 'Companies hiring', value: '850+' },
  { label: 'Jobs filled monthly', value: '2,100+' },
  { label: 'Avg. time to hire', value: '9 days' }
];

const FEATURES = [
  { icon: 'bi-lightning-charge', title: 'AI Resume Score', desc: 'Get instant feedback on profile completeness before you apply.' },
  { icon: 'bi-bullseye', title: 'Skill Match Meter', desc: 'See exactly how well your skills line up with each role.' },
  { icon: 'bi-clock-history', title: 'Application Timeline', desc: 'Track every stage from applied to selected in real time.' },
  { icon: 'bi-bell', title: 'Smart Notifications', desc: 'Never miss a shortlist, interview, or new job alert.' }
];

const TESTIMONIALS = [
  { name: 'Ananya R.', role: 'Frontend Developer', quote: 'Hirestack surfaced roles I actually matched with — no more scrolling through irrelevant listings.' },
  { name: 'Karan M.', role: 'Recruiter, Series A startup', quote: 'The applicant dashboard cut our screening time in half. The skill match meter alone is worth it.' },
  { name: 'Priya S.', role: 'MCA Graduate', quote: 'My resume completeness score told me exactly what to fix before I applied. Landed my first offer in three weeks.' }
];

export default function Landing() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/jobs/featured')
      .then(({ data }) => setFeaturedJobs(data.jobs))
      .catch(() => setFeaturedJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hs-container py-5 py-md-5" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="text-center mx-auto hs-fade-up" style={{ maxWidth: 720 }}>
          <span className="hs-badge mb-4">Built for developers, designers & builders</span>
          <h1 className="display-4 fw-bold mb-4">
            Hiring that moves at <span className="hs-gradient-text">your speed</span>
          </h1>
          <p className="fs-5 mb-5" style={{ color: 'var(--hs-text-dim)' }}>
            Hirestack matches candidates to roles using real skill data — not keyword guessing.
            Build a profile once, apply everywhere, track everything.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="hs-btn hs-btn-primary">
              Create your profile <i className="bi bi-arrow-right" />
            </Link>
            <Link to="/jobs" className="hs-btn hs-btn-outline">
              Browse open roles
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="hs-container mb-5">
        <div className="row g-3">
          {STATS.map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="hs-card p-4 text-center">
                <div className="fs-3 fw-bold hs-gradient-text">{s.value}</div>
                <div style={{ color: 'var(--hs-text-dim)', fontSize: '0.85rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="hs-container mb-5" style={{ paddingTop: 40 }}>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold">Featured roles</h2>
            <p style={{ color: 'var(--hs-text-dim)' }}>Hand-picked openings from companies actively hiring</p>
          </div>
          <Link to="/jobs" className="hs-btn hs-btn-outline d-none d-md-inline-flex">View all</Link>
        </div>

        <div className="row g-4">
          {loading &&
            [1, 2, 3].map((i) => (
              <div className="col-md-4" key={i}>
                <div className="hs-skeleton" style={{ height: 220 }} />
              </div>
            ))}

          {!loading && featuredJobs.length === 0 && (
            <div className="col-12 text-center py-5" style={{ color: 'var(--hs-text-dim)' }}>
              No featured jobs yet — check back soon, or <Link to="/jobs" className="hs-gradient-text">browse all open roles</Link>.
            </div>
          )}

          {!loading &&
            featuredJobs.map((job) => (
              <div className="col-md-4" key={job._id}>
                <JobCard job={job} />
              </div>
            ))}
        </div>
      </section>

      {/* Features */}
      <section className="hs-container mb-5" style={{ paddingTop: 40 }}>
        <h2 className="fw-bold text-center mb-5">Everything you need to hire — or get hired</h2>
        <div className="row g-4">
          {FEATURES.map((f) => (
            <div className="col-md-3 col-6" key={f.title}>
              <div className="hs-card p-4 h-100">
                <i className={`bi ${f.icon} fs-2 mb-3 d-block`} style={{ color: 'var(--hs-accent)' }} />
                <h6 className="fw-semibold">{f.title}</h6>
                <p style={{ color: 'var(--hs-text-dim)', fontSize: '0.85rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="hs-container mb-5" style={{ paddingTop: 40 }}>
        <h2 className="fw-bold text-center mb-5">Trusted by candidates and recruiters</h2>
        <div className="row g-4">
          {TESTIMONIALS.map((t) => (
            <div className="col-md-4" key={t.name}>
              <div className="hs-card p-4 h-100">
                <i className="bi bi-quote fs-3" style={{ color: 'var(--hs-accent-2)' }} />
                <p className="mb-4">{t.quote}</p>
                <div className="fw-semibold">{t.name}</div>
                <div style={{ color: 'var(--hs-text-dim)', fontSize: '0.85rem' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hs-container" style={{ paddingTop: 20, paddingBottom: 60 }}>
        <div
          className="rounded-4 p-5 text-center"
          style={{ background: 'var(--hs-accent-grad)', color: '#fff' }}
        >
          <h2 className="fw-bold mb-3">Ready to build your next chapter?</h2>
          <p className="mb-4" style={{ opacity: 0.9 }}>Join thousands of candidates already building profiles on Hirestack.</p>
          <Link to="/register" className="hs-btn" style={{ background: '#fff', color: 'var(--hs-accent)' }}>
            Get started for free
          </Link>
        </div>
      </section>
    </div>
  );
}
