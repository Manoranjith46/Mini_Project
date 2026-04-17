'use client';

import { useState } from 'react';
import styles from './CommunityIssues.module.css';

const mockIssues = [
  {
    id: 1,
    category: 'Roads & Potholes',
    categoryIcon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
    description: 'Large pothole on Main Street near the traffic signal causing accidents.',
    location: '123 Main Street, Ward 5',
    date: '2024-01-20',
    status: 'pending',
    upvotes: 47,
    hasUpvoted: false,
    reportedBy: 'Citizen',
    duplicateCount: 5,
    image: null,
  },
  {
    id: 2,
    category: 'Water Supply',
    categoryIcon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    description: 'No water supply in Block C for the past 3 days. Multiple families affected.',
    location: 'Block C, Sector 12',
    date: '2024-01-21',
    status: 'in-progress',
    upvotes: 89,
    hasUpvoted: true,
    reportedBy: 'Citizen',
    duplicateCount: 12,
    image: null,
  },
  {
    id: 3,
    category: 'Electricity',
    categoryIcon: 'M13 10V3L4 14h7v7l9-11h-7z',
    description: 'Streetlight not working near community park entrance for over a week.',
    location: 'Community Park, Zone A',
    date: '2024-01-19',
    status: 'resolved',
    upvotes: 23,
    hasUpvoted: false,
    reportedBy: 'Citizen',
    duplicateCount: 2,
    image: null,
  },
  {
    id: 4,
    category: 'Sanitation',
    categoryIcon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    description: 'Garbage not collected for 5 days. Causing bad smell and health hazards.',
    location: 'Elm Avenue, Block 7',
    date: '2024-01-22',
    status: 'pending',
    upvotes: 156,
    hasUpvoted: false,
    reportedBy: 'Citizen',
    duplicateCount: 28,
    image: null,
  },
  {
    id: 5,
    category: 'Parks',
    categoryIcon: 'M12 3v19m-7-7l7-7 7 7',
    description: 'Broken swings in children play area. Safety hazard for kids.',
    location: 'Central Park, Near Gate 2',
    date: '2024-01-18',
    status: 'in-progress',
    upvotes: 34,
    hasUpvoted: true,
    reportedBy: 'Citizen',
    duplicateCount: 3,
    image: null,
  },
];

export default function CommunityIssues() {
  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upvotes');

  const handleUpvote = (issueId) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              upvotes: issue.hasUpvoted ? issue.upvotes - 1 : issue.upvotes + 1,
              hasUpvoted: !issue.hasUpvoted,
            }
          : issue
      )
    );
  };

  const handleReportDuplicate = (issueId) => {
    alert(`Reported as duplicate of issue #${issueId}. Similar issues will be merged.`);
  };

  const filteredIssues = issues
    .filter((issue) => filter === 'all' || issue.status === filter)
    .sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'duplicates') return b.duplicateCount - a.duplicateCount;
      return 0;
    });

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
    };
    return labels[status] || status;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Community Issues</h2>
          <p className={styles.subtitle}>
            Upvote issues to prioritize them. Issues with more votes get resolved faster.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.select}>
              <option value="all">All Issues</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.select}>
              <option value="upvotes">Most Upvoted</option>
              <option value="date">Most Recent</option>
              <option value="duplicates">Most Reported</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.issuesList}>
        {filteredIssues.map((issue) => (
          <div key={issue.id} className={styles.issueCard}>
            <div className={styles.upvoteSection}>
              <button
                className={`${styles.upvoteBtn} ${issue.hasUpvoted ? styles.upvoted : ''}`}
                onClick={() => handleUpvote(issue.id)}
              >
                <svg viewBox="0 0 24 24" fill={issue.hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                <span>{issue.upvotes}</span>
              </button>
            </div>

            <div className={styles.issueContent}>
              <div className={styles.issueHeader}>
                <div className={styles.categoryBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={issue.categoryIcon} />
                  </svg>
                  <span>{issue.category}</span>
                </div>
                <span className={`${styles.status} ${styles[issue.status]}`}>
                  {getStatusLabel(issue.status)}
                </span>
              </div>

              <p className={styles.description}>{issue.description}</p>

              <div className={styles.issueMeta}>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{issue.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{new Date(issue.date).toLocaleDateString()}</span>
                </div>
                {issue.duplicateCount > 1 && (
                  <div className={styles.duplicateBadge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{issue.duplicateCount} similar reports</span>
                  </div>
                )}
              </div>

              <div className={styles.issueActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleReportDuplicate(issue.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Report Duplicate
                </button>
                <button className={styles.actionBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
