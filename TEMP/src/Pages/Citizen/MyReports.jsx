'use client';

import styles from './MyReports.module.css';

const mockReports = [
  {
    id: 1,
    category: 'Roads & Potholes',
    description: 'Large pothole on Main Street causing traffic issues and potential vehicle damage.',
    date: '2024-01-15',
    status: 'resolved',
    location: '123 Main Street',
  },
  {
    id: 2,
    category: 'Electricity & Streetlights',
    description: 'Streetlight not working for the past week near the community park entrance.',
    date: '2024-01-18',
    status: 'in-progress',
    location: 'Community Park Entrance',
  },
  {
    id: 3,
    category: 'Sanitation & Garbage',
    description: 'Garbage not collected for 3 days in our neighborhood block.',
    date: '2024-01-20',
    status: 'pending',
    location: 'Block 5, Elm Avenue',
  },
  {
    id: 4,
    category: 'Water & Drainage',
    description: 'Clogged drain causing water accumulation during rains.',
    date: '2024-01-21',
    status: 'pending',
    location: '45 Oak Drive',
  },
];

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
  };
  return labels[status] || status;
};

export default function MyReports() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Reports</h2>
        <p className={styles.subtitle}>
          Track the status of all issues you have reported.
        </p>
      </div>

      <div className={styles.reportsList}>
        {mockReports.map((report) => (
          <div key={report.id} className={styles.reportCard}>
            <div className={styles.cardHeader}>
              <span className={styles.category}>{report.category}</span>
              <span className={`${styles.status} ${styles[report.status]}`}>
                {getStatusLabel(report.status)}
              </span>
            </div>
            <p className={styles.description}>{report.description}</p>
            <div className={styles.cardFooter}>
              <div className={styles.meta}>
                <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{report.location}</span>
              </div>
              <div className={styles.meta}>
                <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{new Date(report.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
