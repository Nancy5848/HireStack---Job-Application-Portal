/**
 * Seed script — populates the database with realistic demo data so the app
 * doesn't look empty on first run.
 *
 * Run with: npm run seed        (from the server/ folder)
 * Wipe and reseed with: npm run seed -- --fresh
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Review = require('./models/Review');

const RECRUITERS = [
  {
    name: 'Aditi Sharma',
    email: 'recruiter@nimbuscloud.io',
    company: {
      name: 'NimbusCloud',
      industry: 'Cloud Infrastructure',
      companySize: '51-200',
      foundedYear: 2019,
      headquarters: 'Bengaluru, India',
      description:
        'NimbusCloud builds developer-first infrastructure tooling for teams shipping at scale. We are a remote-friendly, engineering-led company backed by top-tier investors.',
      website: 'https://example.com/nimbuscloud'
    }
  },
  {
    name: 'Rohan Verma',
    email: 'recruiter@pixelforge.dev',
    company: {
      name: 'PixelForge Studios',
      industry: 'Design & Product',
      companySize: '11-50',
      foundedYear: 2021,
      headquarters: 'Pune, India',
      description:
        'PixelForge is a product design and engineering studio partnering with early-stage startups to launch polished, production-ready apps fast.',
      website: 'https://example.com/pixelforge'
    }
  },
  {
    name: 'Meera Iyer',
    email: 'recruiter@datalynx.ai',
    company: {
      name: 'DataLynx AI',
      industry: 'Artificial Intelligence',
      companySize: '201-500',
      foundedYear: 2017,
      headquarters: 'Hyderabad, India',
      description:
        'DataLynx AI builds machine learning platforms for enterprise analytics. Our customers include Fortune 500 retail and logistics companies.',
      website: 'https://example.com/datalynx'
    }
  }
];

const JOB_TEMPLATES = [
  {
    title: 'Frontend Developer (React)',
    description:
      'We are looking for a Frontend Developer to build fast, accessible, and delightful user interfaces. You will work closely with design and backend teams to ship features end to end.',
    responsibilities: [
      'Build reusable React components and maintain a shared design system',
      'Collaborate with designers to translate Figma mockups into pixel-accurate UI',
      'Optimize application performance and Core Web Vitals',
      'Write unit and integration tests for critical user flows'
    ],
    requiredSkills: ['React', 'JavaScript', 'CSS', 'REST APIs', 'Git'],
    category: 'Engineering',
    jobType: 'Full Time',
    experienceLevel: '1-3 Years',
    salaryMin: 600000,
    salaryMax: 1200000,
    isRemote: true,
    isFeatured: true
  },
  {
    title: 'Backend Engineer (Node.js)',
    description:
      'Join our platform team to design and scale the APIs powering our core product. You will own services from design through deployment and monitoring.',
    responsibilities: [
      'Design and implement REST APIs using Node.js and Express',
      'Model data and write efficient MongoDB queries',
      'Set up authentication, authorization, and rate limiting',
      'Participate in on-call rotation and incident response'
    ],
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Docker'],
    category: 'Engineering',
    jobType: 'Full Time',
    experienceLevel: '1-3 Years',
    salaryMin: 700000,
    salaryMax: 1400000,
    isRemote: true,
    isFeatured: true
  },
  {
    title: 'MERN Stack Developer Intern',
    description:
      'A 6-month internship for students who want hands-on experience building a production MERN application. Mentorship provided by senior engineers.',
    responsibilities: [
      'Build features across the MERN stack under senior engineer guidance',
      'Fix bugs and write tests for existing modules',
      'Participate in code review and daily standups'
    ],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    category: 'Engineering',
    jobType: 'Internship',
    experienceLevel: 'Fresher',
    salaryMin: 150000,
    salaryMax: 300000,
    isRemote: false,
    isFeatured: true
  },
  {
    title: 'UI/UX Designer',
    description:
      'We need a designer who thinks in systems, not screens. You will own the end-to-end design process from research to high-fidelity prototypes.',
    responsibilities: [
      'Conduct user research and translate insights into design decisions',
      'Design and maintain our component library in Figma',
      'Partner with engineers during implementation for design QA'
    ],
    requiredSkills: ['Figma', 'UI Design', 'Prototyping', 'Design Systems'],
    category: 'Design',
    jobType: 'Full Time',
    experienceLevel: '3-5 Years',
    salaryMin: 800000,
    salaryMax: 1600000,
    isRemote: true,
    isFeatured: false
  },
  {
    title: 'Product Designer (Contract)',
    description: 'Short-term contract to help redesign our onboarding flow. Great opportunity for designers who like fast, focused engagements.',
    responsibilities: ['Redesign onboarding flow end to end', 'Run 2 rounds of usability testing', 'Deliver final assets and handoff docs'],
    requiredSkills: ['Figma', 'User Research', 'Interaction Design'],
    category: 'Design',
    jobType: 'Part Time',
    experienceLevel: '1-3 Years',
    salaryMin: 300000,
    salaryMax: 500000,
    isRemote: true,
    isFeatured: false
  },
  {
    title: 'Machine Learning Engineer',
    description:
      'Build and deploy ML models that power recommendation and forecasting systems used by enterprise clients across retail and logistics.',
    responsibilities: [
      'Develop and train models using Python and PyTorch',
      'Build data pipelines for feature engineering',
      'Deploy models to production with monitoring for drift'
    ],
    requiredSkills: ['Python', 'PyTorch', 'SQL', 'MLOps', 'Statistics'],
    category: 'Data & AI',
    jobType: 'Full Time',
    experienceLevel: '3-5 Years',
    salaryMin: 1200000,
    salaryMax: 2400000,
    isRemote: false,
    isFeatured: true
  },
  {
    title: 'Data Analyst',
    description: 'Support our analytics team by turning raw data into dashboards and insights that drive product and business decisions.',
    responsibilities: ['Build dashboards in our internal BI tool', 'Write SQL queries against large datasets', 'Present findings to stakeholders'],
    requiredSkills: ['SQL', 'Excel', 'Python', 'Data Visualization'],
    category: 'Data & AI',
    jobType: 'Full Time',
    experienceLevel: '0-1 Years',
    salaryMin: 500000,
    salaryMax: 900000,
    isRemote: false,
    isFeatured: false
  },
  {
    title: 'DevOps Engineer',
    description: 'Own our CI/CD pipelines and cloud infrastructure. You will help us scale from hundreds to millions of requests per day.',
    responsibilities: ['Manage Kubernetes clusters and CI/CD pipelines', 'Improve infrastructure-as-code with Terraform', 'Set up observability and alerting'],
    requiredSkills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    category: 'Engineering',
    jobType: 'Full Time',
    experienceLevel: '3-5 Years',
    salaryMin: 1000000,
    salaryMax: 2000000,
    isRemote: true,
    isFeatured: false
  },
  {
    title: 'QA Engineer (Manual + Automation)',
    description: 'Ensure product quality across web and mobile surfaces. Build automated test suites and manage our release QA process.',
    responsibilities: ['Write and maintain automated test suites', 'Perform manual regression testing before releases', 'Log and triage bugs with engineering'],
    requiredSkills: ['Selenium', 'Cypress', 'Manual Testing', 'JavaScript'],
    category: 'Engineering',
    jobType: 'Full Time',
    experienceLevel: '1-3 Years',
    salaryMin: 500000,
    salaryMax: 900000,
    isRemote: false,
    isFeatured: false
  },
  {
    title: 'Junior Full Stack Developer',
    description: 'Great first role for recent graduates who want to work across the stack in a small, high-ownership engineering team.',
    responsibilities: ['Build features across frontend and backend', 'Fix bugs reported by users and QA', 'Participate in sprint planning and code review'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL'],
    category: 'Engineering',
    jobType: 'Full Time',
    experienceLevel: 'Fresher',
    salaryMin: 400000,
    salaryMax: 700000,
    isRemote: false,
    isFeatured: true
  }
];

const LOCATIONS = ['Bengaluru, India', 'Pune, India', 'Hyderabad, India', 'Remote', 'Gurugram, India', 'Chandigarh, India'];

const DEMO_STUDENT = {
  name: 'Demo Candidate',
  email: 'student@demo.com',
  password: 'Password123',
  role: 'student'
};

const DEMO_PASSWORD = 'Password123';

async function seed() {
  await connectDB();
  const fresh = process.argv.includes('--fresh');

  if (fresh) {
    console.log('Wiping existing data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Review.deleteMany({})
    ]);
  }

  const existingJobs = await Job.countDocuments();
  if (existingJobs > 0 && !fresh) {
    console.log(`Database already has ${existingJobs} jobs. Run "npm run seed -- --fresh" to wipe and reseed.`);
    process.exit(0);
  }

  console.log('Creating recruiters and companies...');
  const companies = [];
  for (const r of RECRUITERS) {
    let user = await User.findOne({ email: r.email });
    if (!user) {
      user = await User.create({ name: r.name, email: r.email, password: DEMO_PASSWORD, role: 'recruiter' });
    }
    let company = await Company.findOne({ recruiter: user._id });
    if (!company) {
      company = await Company.create({ recruiter: user._id, ...r.company });
    }
    companies.push({ user, company });
  }

  console.log('Creating demo student account...');
  let studentUser = await User.findOne({ email: DEMO_STUDENT.email });
  if (!studentUser) {
    studentUser = await User.create(DEMO_STUDENT);
  }
  let student = await Student.findOne({ user: studentUser._id });
  if (!student) {
    student = await Student.create({
      user: studentUser._id,
      headline: 'Aspiring Full Stack Developer',
      bio: 'MCA student passionate about building web applications end to end.',
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express'],
      location: 'Chandigarh, India'
    });
  }

  console.log('Creating job listings...');
  let created = 0;
  for (let i = 0; i < JOB_TEMPLATES.length; i++) {
    const template = JOB_TEMPLATES[i];
    const { user, company } = companies[i % companies.length];
    const location = LOCATIONS[i % LOCATIONS.length];

    await Job.create({
      ...template,
      recruiter: user._id,
      company: company._id,
      location: template.isRemote ? 'Remote' : location
    });
    created += 1;
  }

  console.log('Adding a sample company review...');
  const existingReview = await Review.findOne({ company: companies[0].company._id, student: student._id });
  if (!existingReview) {
    await Review.create({
      company: companies[0].company._id,
      student: student._id,
      rating: 5,
      title: 'Great engineering culture',
      comment: 'Interview process was transparent and the team was very responsive throughout.',
      isAnonymous: false
    });
  }

  console.log('\nSeed complete.');
  console.log(`  ${companies.length} recruiter accounts (password: ${DEMO_PASSWORD})`);
  companies.forEach((c) => console.log(`    - ${c.user.email}`));
  console.log(`  1 demo student account: ${DEMO_STUDENT.email} (password: ${DEMO_PASSWORD})`);
  console.log(`  ${created} jobs created`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
