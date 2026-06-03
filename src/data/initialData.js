/**
 * Default seed data for Raju's JP Morgan DevOps roadmap.
 * This is loaded once on first visit; all subsequent state
 * lives in localStorage under "raju-roadmap-v1".
 */

export const STORAGE_KEY = 'raju-roadmap-v1';

/** Night-shift start date for the "days on night shift" counter */
export const NIGHT_SHIFT_START = '2022-01-01';

/** DSA target: total problems to solve before interview sprint */
export const DSA_TARGET = 50;

/** App target date for countdown */
export const TARGET_DATE = '2026-12-01';

export const initialPhases = [
  {
    id: 'phase1',
    name: 'Phase 1 — Docker + AWS Foundations',
    shortName: 'Docker + AWS',
    dateRange: 'June – July 2026',
    weeks: 6,
    color: 'amber',
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    skills: [
      {
        id: 'p1-linux',
        name: 'Linux + Bash Scripting',
        description: 'Shell scripting, file system, process management, cron jobs',
        status: 'complete',
        tag: 'already have',
        completed: true,
        notes: '4 years production experience — log analysis, ETL automation, cron scheduling at Cotiviti/Edifecs.',
      },
      {
        id: 'p1-git',
        name: 'Git + GitHub',
        description: 'Branching strategies, PR reviews, merge conflicts, GitHub Actions basics',
        status: 'complete',
        tag: 'already have',
        completed: true,
        notes: 'Bitbucket PRs and code reviews in production. Used daily at Cotiviti.',
      },
      {
        id: 'p1-docker',
        name: 'Docker',
        description: 'Dockerfiles, images, containers, docker-compose, networking, volumes',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p1-aws',
        name: 'AWS Basics + Cloud Practitioner',
        description: 'EC2, S3, IAM, VPC, cost management — target: AWS Cloud Practitioner cert',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
    ],
  },
  {
    id: 'phase2',
    name: 'Phase 2 — CI/CD + Python + DSA',
    shortName: 'CI/CD + Python',
    dateRange: 'August – September 2026',
    weeks: 8,
    color: 'blue',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    skills: [
      {
        id: 'p2-cicd',
        name: 'CI/CD Pipelines',
        description: 'GitHub Actions → Jenkins → GitLab CI; real deploy pipelines',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p2-python',
        name: 'Python Scripting',
        description: 'Automation-level Python; also used as DSA practice language',
        status: 'complete',
        tag: 'already have',
        completed: true,
        notes: 'Production ETL automation, healthcare data pipelines, cron scheduling — 4 years nightly use at Cotiviti/Edifecs.',
      },
      {
        id: 'p2-dsa1',
        name: 'DSA Phase 1 — LeetCode Easy',
        description: 'Arrays, strings, hashmaps — 3–4 problems/week pace',
        status: 'learning',
        tag: 'DSA',
        completed: false,
        notes: 'Target: ~20 Easy problems before Phase 3.',
      },
      {
        id: 'p2-aws-saa',
        name: 'AWS Solutions Architect Associate',
        description: 'Deep dive into AWS architecture — target: SAA-C03 cert',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
    ],
  },
  {
    id: 'phase3',
    name: 'Phase 3 — Observability + Kubernetes + DSA',
    shortName: 'K8s + Observability',
    dateRange: 'October – November 2026',
    weeks: 8,
    color: 'purple',
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    skills: [
      {
        id: 'p3-grafana',
        name: 'Grafana + Monitoring',
        description: 'Build dashboards on own Docker projects; Prometheus basics',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p3-k8s',
        name: 'Kubernetes Basics',
        description: 'Pods, deployments, services, ConfigMaps, real app deployment on local cluster',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p3-dsa2',
        name: 'DSA Phase 2 — LeetCode Medium',
        description: 'Sliding window, two pointers, trees, BFS/DFS — target: 40–50 total',
        status: 'learning',
        tag: 'DSA',
        completed: false,
        notes: '',
      },
      {
        id: 'p3-terraform',
        name: 'Terraform Basics',
        description: 'EC2 + S3 via IaC; state management, modules',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p3-splunk',
        name: 'Splunk Basics',
        description: 'Log aggregation, SPL queries — free trial instance',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p3-prod',
        name: 'Production Support',
        description: '200+ incidents managed, 30+ client onboardings, 12-hour shift operations',
        status: 'complete',
        tag: 'already have',
        completed: true,
        notes: 'Cotiviti/Edifecs — Risk Adjustment domain, healthcare data pipelines.',
      },
    ],
  },
  {
    id: 'phase4',
    name: 'Phase 4 — Interview Prep Sprint',
    shortName: 'Interview Prep',
    dateRange: 'November – December 2026',
    weeks: 4,
    color: 'red',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    skills: [
      {
        id: 'p4-mock',
        name: 'Mock Interviews',
        description: 'Timed 45-min problems, verbalise approach, whiteboard-style',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p4-system',
        name: 'System Design Prep',
        description: 'Logging pipelines, deployment systems, monitoring stacks, scalability',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
      {
        id: 'p4-behavioral',
        name: 'Behavioral Rounds (STAR)',
        description: 'Top performer story, visa setback resilience, 30+ client deliveries, 12-hr shift dedication',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: 'Stories: Top Performer 2024, two US visas approved, 30+ onboardings, night-shift commitment.',
      },
      {
        id: 'p4-code-review',
        name: 'Code Review Practice',
        description: 'Bug finding, exception handling, refactoring under time pressure',
        status: 'learning',
        tag: 'learning',
        completed: false,
        notes: '',
      },
    ],
  },
];

/** Build the full default state object seeded into localStorage on first load */
export function buildDefaultState() {
  return {
    schemaVersion: 2,
    phases: initialPhases,
    dsa: {
      easySolved: 0,
      mediumSolved: 0,
      // Array of ISO date strings — one per day that had at least 1 problem logged
      solvedDays: [],
      // Map of ISO date string → number of problems solved that day (for bar chart)
      dailyCount: {},
    },
    studyLog: [],
    // ISO date string of last day the user marked a "studied today" entry — for streak
    lastStudyDate: null,
    studyStreak: 0,
  };
}
