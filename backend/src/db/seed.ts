import 'dotenv/config';
import * as crypto from 'crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ── SEED DATA ────────────────────────────────────────────────────────────────

const EMPLOYEES: Array<{
  name: string;
  email: string;
  location: string;
  summary: string;
  yearsTotal: number;
  skills: Array<{
    name: string;
    category: 'language' | 'framework' | 'platform' | 'tool' | 'domain';
    proficiency: 'novice' | 'intermediate' | 'expert';
    yearsExperience: number | null;
    inferred?: boolean;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
}> = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@company.com',
    location: 'Pune',
    summary: 'Senior frontend engineer with 5+ years building real-time web applications using React and WebSockets. Led the frontend for two fintech products handling 50k daily active users. Strong in TypeScript, performance optimisation, and component architecture.',
    yearsTotal: 5.5,
    skills: [
      { name: 'React', category: 'framework', proficiency: 'expert', yearsExperience: 5 },
      { name: 'TypeScript', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'WebSockets', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Socket.IO', category: 'framework', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Next.js', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 5, inferred: true },
    ],
    projects: [
      { title: 'Real-time Trading Dashboard', description: 'Built a WebSocket-driven trading dashboard with live price feeds and order book updates for 50k DAU.', technologies: ['React', 'Socket.IO', 'TypeScript', 'Redis'] },
      { title: 'Component Design System', description: 'Architected a reusable design system adopted across 4 internal products, reducing UI dev time by 40%.', technologies: ['React', 'Storybook', 'TypeScript', 'Tailwind CSS'] },
    ],
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@company.com',
    location: 'Mumbai',
    summary: 'Backend engineer specialising in Java and payment systems with 6 years of experience. Built and maintained payment gateway integrations with Razorpay, Stripe, and PayU. Deep expertise in Spring Boot microservices and distributed transaction patterns.',
    yearsTotal: 6,
    skills: [
      { name: 'Java', category: 'language', proficiency: 'expert', yearsExperience: 6 },
      { name: 'Spring Boot', category: 'framework', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Razorpay', category: 'platform', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Stripe', category: 'platform', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'PostgreSQL', category: 'platform', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Kafka', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Spring', category: 'framework', proficiency: 'expert', yearsExperience: 5, inferred: true },
    ],
    projects: [
      { title: 'Payment Gateway Integration Layer', description: 'Designed an abstraction layer unifying Razorpay, Stripe, and PayU under a single API, handling ₹2Cr daily transactions.', technologies: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'] },
      { title: 'Subscription Billing Engine', description: 'Built a recurring billing engine with retry logic, dunning management, and webhook handling for 80k subscribers.', technologies: ['Java', 'Spring Boot', 'Stripe', 'Redis'] },
    ],
  },
  {
    name: 'Arjun Menon',
    email: 'arjun.menon@company.com',
    location: 'Bangalore',
    summary: 'Full-stack engineer with 4 years building product features end-to-end. Comfortable owning both the Node.js API and the React frontend. Recent focus on developer tooling and internal platforms.',
    yearsTotal: 4,
    skills: [
      { name: 'Node.js', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'React', category: 'framework', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'PostgreSQL', category: 'platform', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'Docker', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'TypeScript', category: 'language', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'GraphQL', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 4, inferred: true },
    ],
    projects: [
      { title: 'Internal Developer Portal', description: 'Built a self-service portal for engineers to provision staging environments, view service health, and manage feature flags.', technologies: ['Node.js', 'React', 'Docker', 'PostgreSQL'] },
      { title: 'GraphQL API Gateway', description: 'Replaced three REST services with a unified GraphQL layer, reducing frontend data-fetching complexity.', technologies: ['Node.js', 'GraphQL', 'TypeScript', 'Redis'] },
    ],
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@company.com',
    location: 'Hyderabad',
    summary: 'DevOps and platform engineer with 5 years building cloud infrastructure and CI/CD pipelines. Specialises in Kubernetes orchestration on AWS and infrastructure-as-code with Terraform. Reduced deployment lead time by 70% at her last role.',
    yearsTotal: 5,
    skills: [
      { name: 'Kubernetes', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'AWS', category: 'platform', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Terraform', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Docker', category: 'tool', proficiency: 'expert', yearsExperience: 5 },
      { name: 'GitHub Actions', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Helm', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Python', category: 'language', proficiency: 'intermediate', yearsExperience: 3 },
    ],
    projects: [
      { title: 'Multi-region EKS Platform', description: 'Designed and deployed a multi-region Kubernetes platform on AWS EKS with auto-scaling, service mesh, and observability stack.', technologies: ['Kubernetes', 'AWS', 'Terraform', 'Helm', 'Prometheus'] },
      { title: 'Zero-downtime Deployment Pipeline', description: 'Implemented blue-green deployment pipeline cutting release time from 2 hours to 8 minutes.', technologies: ['GitHub Actions', 'Docker', 'Kubernetes', 'AWS'] },
    ],
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    location: 'Delhi',
    summary: 'Mobile engineer with 5 years of cross-platform and native experience. Built apps shipped to 200k+ users on both iOS and Android using React Native and Flutter. Strong in offline-first architecture and app performance profiling.',
    yearsTotal: 5,
    skills: [
      { name: 'React Native', category: 'framework', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Flutter', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'TypeScript', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Dart', category: 'language', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'iOS', category: 'platform', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'Android', category: 'platform', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 5, inferred: true },
      { name: 'React', category: 'framework', proficiency: 'expert', yearsExperience: 4, inferred: true },
    ],
    projects: [
      { title: 'E-commerce Mobile App', description: 'Led the React Native rebuild of a legacy app, achieving 4.7★ rating and 40% improvement in crash-free sessions.', technologies: ['React Native', 'TypeScript', 'Redux', 'Stripe'] },
      { title: 'Logistics Tracking App', description: 'Built an offline-first Flutter app for field agents with GPS tracking and background sync.', technologies: ['Flutter', 'Dart', 'SQLite', 'Google Maps'] },
    ],
  },
  {
    name: 'Ananya Patel',
    email: 'ananya.patel@company.com',
    location: 'Pune',
    summary: 'Data engineer with 4 years building batch and streaming data pipelines. Works primarily in Python and Spark, with hands-on Kafka and Airflow experience. Designed the data platform that unified reporting across 12 business units.',
    yearsTotal: 4,
    skills: [
      { name: 'Python', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Apache Spark', category: 'platform', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Kafka', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Apache Airflow', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'dbt', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'AWS S3', category: 'platform', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'SQL', category: 'language', proficiency: 'expert', yearsExperience: 4 },
    ],
    projects: [
      { title: 'Unified Data Platform', description: 'Built a lakehouse architecture on AWS that consolidated 12 siloed data sources into a single queryable layer, reducing reporting latency from 24h to 15min.', technologies: ['Apache Spark', 'Kafka', 'AWS S3', 'dbt', 'Airflow'] },
      { title: 'Real-time Fraud Detection Pipeline', description: 'Implemented a streaming pipeline with sub-500ms latency to flag anomalous transactions as they occur.', technologies: ['Kafka', 'Python', 'Spark Streaming', 'Redis'] },
    ],
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@company.com',
    location: 'Bangalore',
    summary: 'Backend engineer with 4 years building high-throughput microservices in Go. Focused on systems that need low latency and predictable resource usage. Comfortable with gRPC, Kubernetes, and distributed systems design.',
    yearsTotal: 4,
    skills: [
      { name: 'Go', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'gRPC', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Kubernetes', category: 'platform', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'PostgreSQL', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Redis', category: 'platform', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Protobuf', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Docker', category: 'tool', proficiency: 'intermediate', yearsExperience: 3 },
    ],
    projects: [
      { title: 'Notification Microservice', description: 'Built a high-throughput Go service processing 3M push/email/SMS notifications per day with sub-100ms p99 latency.', technologies: ['Go', 'gRPC', 'Kafka', 'Redis', 'PostgreSQL'] },
      { title: 'Rate Limiting Service', description: 'Implemented a distributed rate limiter using token bucket algorithm with Redis, handling 500k req/s across 20 services.', technologies: ['Go', 'Redis', 'gRPC', 'Protobuf'] },
    ],
  },
  {
    name: 'Divya Krishnan',
    email: 'divya.krishnan@company.com',
    location: 'Chennai',
    summary: 'Frontend engineer with 3 years of experience in Vue.js and Nuxt.js. Strong eye for UX and accessibility. Built customer-facing dashboards and marketing sites used by 100k monthly visitors.',
    yearsTotal: 3,
    skills: [
      { name: 'Vue.js', category: 'framework', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Nuxt.js', category: 'framework', proficiency: 'expert', yearsExperience: 2 },
      { name: 'TypeScript', category: 'language', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Tailwind CSS', category: 'tool', proficiency: 'expert', yearsExperience: 2 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Figma', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
    ],
    projects: [
      { title: 'SaaS Analytics Dashboard', description: 'Built a customer-facing analytics dashboard with Nuxt.js showing 30+ chart types, used by 8k businesses daily.', technologies: ['Nuxt.js', 'Vue.js', 'Chart.js', 'Tailwind CSS'] },
      { title: 'Marketing Site Redesign', description: 'Rebuilt a high-traffic marketing site achieving 95+ Lighthouse score and 30% improvement in conversion rate.', technologies: ['Nuxt.js', 'TypeScript', 'Tailwind CSS'] },
    ],
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra@company.com',
    location: 'Mumbai',
    summary: 'Full-stack PHP engineer with 6 years building web applications on Laravel. Has led small teams, managed database performance at scale, and built REST APIs consumed by mobile apps. Gradually expanding into Node.js.',
    yearsTotal: 6,
    skills: [
      { name: 'PHP', category: 'language', proficiency: 'expert', yearsExperience: 6 },
      { name: 'Laravel', category: 'framework', proficiency: 'expert', yearsExperience: 5 },
      { name: 'MySQL', category: 'platform', proficiency: 'expert', yearsExperience: 6 },
      { name: 'Redis', category: 'platform', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Node.js', category: 'platform', proficiency: 'novice', yearsExperience: 1 },
      { name: 'Vue.js', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'REST APIs', category: 'domain', proficiency: 'expert', yearsExperience: 5 },
    ],
    projects: [
      { title: 'Multi-tenant SaaS Platform', description: 'Built a white-label SaaS platform in Laravel serving 200 clients with isolated data tenancy and custom branding.', technologies: ['PHP', 'Laravel', 'MySQL', 'Redis', 'Vue.js'] },
      { title: 'Mobile API Backend', description: 'Designed and delivered REST APIs powering iOS and Android apps for a fleet management product with 5k daily users.', technologies: ['Laravel', 'MySQL', 'Redis', 'JWT'] },
    ],
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@company.com',
    location: 'Delhi',
    summary: 'Android engineer with 4 years of native development experience. Expert in Kotlin, Jetpack libraries, and modern Android architecture patterns. Shipped 3 production apps, one of which has 500k+ installs on the Play Store.',
    yearsTotal: 4,
    skills: [
      { name: 'Kotlin', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Android', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Jetpack Compose', category: 'framework', proficiency: 'expert', yearsExperience: 2 },
      { name: 'Room DB', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Coroutines', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'Java', category: 'language', proficiency: 'intermediate', yearsExperience: 2, inferred: true },
    ],
    projects: [
      { title: 'Health & Fitness App', description: 'Built a Kotlin/Compose app with step tracking, workout plans, and Bluetooth integration — 500k Play Store installs, 4.6★ rating.', technologies: ['Kotlin', 'Jetpack Compose', 'Room DB', 'Bluetooth LE'] },
      { title: 'Offline-first Field Service App', description: 'Developed an Android app for field technicians with full offline capability and background sync using WorkManager.', technologies: ['Kotlin', 'Room DB', 'Coroutines', 'WorkManager'] },
    ],
  },
  {
    name: 'Saurabh Joshi',
    email: 'saurabh.joshi@company.com',
    location: 'Hyderabad',
    summary: 'Cloud architect with 7 years across AWS, Azure, and GCP. Specialises in cost optimisation, security architecture, and multi-cloud strategies. Saved $2M annually in cloud spend at his previous organisation through rightsizing and reserved instance planning.',
    yearsTotal: 7,
    skills: [
      { name: 'AWS', category: 'platform', proficiency: 'expert', yearsExperience: 7 },
      { name: 'Azure', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'GCP', category: 'platform', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Terraform', category: 'tool', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Kubernetes', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Cloud Security', category: 'domain', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Python', category: 'language', proficiency: 'intermediate', yearsExperience: 4 },
    ],
    projects: [
      { title: 'Cloud Cost Optimisation Programme', description: 'Led a 6-month initiative across AWS and Azure, implementing rightsizing, Spot usage, and RI planning — saving $2M annually.', technologies: ['AWS', 'Azure', 'Terraform', 'Python'] },
      { title: 'HIPAA-compliant Infrastructure', description: 'Designed and audited a multi-region AWS architecture meeting HIPAA requirements for a healthcare SaaS product.', technologies: ['AWS', 'Terraform', 'Kubernetes', 'Vault'] },
    ],
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@company.com',
    location: 'Bangalore',
    summary: 'Machine learning engineer with 4 years building and deploying models in production. Specialises in NLP and recommendation systems using PyTorch and HuggingFace. Experienced in the full MLOps lifecycle from experiment tracking to serving.',
    yearsTotal: 4,
    skills: [
      { name: 'Python', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'PyTorch', category: 'framework', proficiency: 'expert', yearsExperience: 3 },
      { name: 'TensorFlow', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'HuggingFace', category: 'tool', proficiency: 'expert', yearsExperience: 2 },
      { name: 'NLP', category: 'domain', proficiency: 'expert', yearsExperience: 3 },
      { name: 'MLflow', category: 'tool', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'FastAPI', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
    ],
    projects: [
      { title: 'Product Recommendation Engine', description: 'Built and deployed a collaborative filtering + content-based hybrid model increasing click-through rate by 22%.', technologies: ['PyTorch', 'Python', 'Redis', 'FastAPI'] },
      { title: 'Support Ticket Classifier', description: 'Fine-tuned a BERT-based classifier on 200k support tickets, achieving 91% accuracy and automating routing for 60% of tickets.', technologies: ['HuggingFace', 'PyTorch', 'MLflow', 'Docker'] },
    ],
  },
  {
    name: 'Aditya Kumar',
    email: 'aditya.kumar@company.com',
    location: 'Pune',
    summary: 'Senior backend engineer with 5 years building scalable Node.js services. Deep expertise in PostgreSQL query optimisation, Redis caching strategies, and async job queues with BullMQ. Recently led the backend team for a Series B SaaS product.',
    yearsTotal: 5,
    skills: [
      { name: 'Node.js', category: 'platform', proficiency: 'expert', yearsExperience: 5 },
      { name: 'PostgreSQL', category: 'platform', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Redis', category: 'platform', proficiency: 'expert', yearsExperience: 4 },
      { name: 'BullMQ', category: 'tool', proficiency: 'expert', yearsExperience: 3 },
      { name: 'TypeScript', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'REST APIs', category: 'domain', proficiency: 'expert', yearsExperience: 5 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 5, inferred: true },
    ],
    projects: [
      { title: 'Async Job Processing Platform', description: 'Redesigned the background job system using BullMQ, supporting 500k jobs/day with dead-letter queues, retries, and real-time progress.', technologies: ['Node.js', 'BullMQ', 'Redis', 'TypeScript'] },
      { title: 'Multi-tenant API Backend', description: 'Led backend for a B2B SaaS product — row-level security in Postgres, JWT auth, rate limiting, and webhooks for 300 enterprise clients.', technologies: ['Node.js', 'PostgreSQL', 'Redis', 'TypeScript'] },
    ],
  },
  {
    name: 'Pooja Sharma',
    email: 'pooja.sharma@company.com',
    location: 'Mumbai',
    summary: 'Frontend engineer with 3 years of experience in React, TypeScript, and GraphQL. Passionate about developer experience and component-driven development. Has contributed to open-source React libraries and maintains a personal design system.',
    yearsTotal: 3,
    skills: [
      { name: 'React', category: 'framework', proficiency: 'expert', yearsExperience: 3 },
      { name: 'TypeScript', category: 'language', proficiency: 'expert', yearsExperience: 3 },
      { name: 'GraphQL', category: 'tool', proficiency: 'expert', yearsExperience: 2 },
      { name: 'Next.js', category: 'framework', proficiency: 'intermediate', yearsExperience: 2 },
      { name: 'Tailwind CSS', category: 'tool', proficiency: 'expert', yearsExperience: 2 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 3, inferred: true },
    ],
    projects: [
      { title: 'GraphQL Frontend Migration', description: 'Led migration of a REST-based frontend to GraphQL with Apollo Client, eliminating over-fetching and halving initial load time.', technologies: ['React', 'GraphQL', 'Apollo Client', 'TypeScript'] },
      { title: 'Open Source Component Library', description: 'Maintained a React + TypeScript component library with 800 GitHub stars, full Storybook documentation, and WCAG AA compliance.', technologies: ['React', 'TypeScript', 'Storybook', 'Tailwind CSS'] },
    ],
  },
  {
    name: 'Rajesh Nambiar',
    email: 'rajesh.nambiar@company.com',
    location: 'Bangalore',
    summary: 'Full-stack engineer with 5 years building real-time collaborative applications. Expert in WebSockets and React, with strong Node.js backend skills. Led engineering for a real-time document collaboration tool used by 15k teams.',
    yearsTotal: 5,
    skills: [
      { name: 'React', category: 'framework', proficiency: 'expert', yearsExperience: 5 },
      { name: 'Node.js', category: 'platform', proficiency: 'expert', yearsExperience: 5 },
      { name: 'WebSockets', category: 'tool', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Socket.IO', category: 'framework', proficiency: 'expert', yearsExperience: 4 },
      { name: 'TypeScript', category: 'language', proficiency: 'expert', yearsExperience: 4 },
      { name: 'Redis', category: 'platform', proficiency: 'intermediate', yearsExperience: 3 },
      { name: 'JavaScript', category: 'language', proficiency: 'expert', yearsExperience: 5, inferred: true },
    ],
    projects: [
      { title: 'Real-time Collaboration Platform', description: 'Led engineering of a Notion-like tool with live cursors, operational transforms, and presence — 15k teams, 99.9% uptime.', technologies: ['React', 'Node.js', 'Socket.IO', 'Redis', 'PostgreSQL'] },
      { title: 'Live Code Review Tool', description: 'Built a pair-programming tool with real-time code sync, video chat, and diff visualisation used internally by 200 engineers.', technologies: ['React', 'WebSockets', 'Node.js', 'TypeScript'] },
    ],
  },
];

// ── RUNNER ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding 15 employees...\n');
  const passwordHash = hashPassword('password123');
  let created = 0;
  let skipped = 0;

  for (const emp of EMPLOYEES) {
    // Skip if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, emp.email),
    });

    if (existing) {
      console.log(`  ⚠  Skipped  ${emp.name} (already exists)`);
      skipped++;
      continue;
    }

    // Insert user
    const [user] = await db
      .insert(schema.users)
      .values({ email: emp.email, name: emp.name, passwordHash, role: 'employee' })
      .returning();

    // Insert profile (approved so it's immediately searchable)
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        userId: user.id,
        status: 'approved',
        summary: emp.summary,
        location: emp.location,
        yearsTotal: emp.yearsTotal,
      })
      .returning();

    // Upsert skills and link to profile
    for (const skill of emp.skills) {
      const normalizedName = skill.name.toLowerCase().trim();

      let [existingSkill] = await db
        .select()
        .from(schema.skills)
        .where(eq(schema.skills.normalizedName, normalizedName));

      if (!existingSkill) {
        [existingSkill] = await db
          .insert(schema.skills)
          .values({ name: skill.name, normalizedName, category: skill.category })
          .returning();
      }

      await db.insert(schema.profileSkills).values({
        profileId: profile.id,
        skillId: existingSkill.id,
        proficiency: skill.proficiency,
        yearsExperience: skill.yearsExperience,
        inferred: skill.inferred ?? false,
      });
    }

    // Insert projects
    for (const project of emp.projects) {
      await db.insert(schema.projects).values({
        profileId: profile.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
      });
    }

    console.log(`  ✓  Created  ${emp.name} (${emp.location}) — ${emp.skills.length} skills, ${emp.projects.length} projects`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  console.log('All employees can log in with password: password123');
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
