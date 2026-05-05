'use client';

import { useState } from 'react';
import styles from './IssueTable.module.css';

const initialIssues = [
  {
    id: 1,
    date: '2024-01-21',
    location: 'Block 5, Elm Avenue',
    category: 'Sanitation',
    description: 'Garbage not collected for 3 days',
    status: 'pending',
    reporter: 'John D.',
  },
  {
    id: 2,
    date: '2024-01-20',
    location: '45 Oak Drive',
    category: 'Water',
    description: 'Clogged drain causing flooding',
    status: 'pending',
    reporter: 'Sarah M.',
  },
  {
    id: 3,
    date: '2024-01-18',
    location: 'Community Park Entrance',
    category: 'Electricity',
    description: 'Streetlight not working',
    status: 'in-progress',
    reporter: 'Mike R.',
  },
  {
    id: 4,
    date: '2024-01-15',
    location: '123 Main Street',
    category: 'Roads',
    description: 'Large pothole causing traffic issues',
    status: 'resolved',
    reporter: 'Emily T.',
  },
  {
    id: 5,
    date: '2024-01-14',
    location: 'Market Square',
    category: 'Public Safety',
    description: 'Broken railing near stairs',
    status: 'in-progress',
    reporter: 'David L.',
  },
  {
    id: 6,
    date: '2024-01-12',
    location: '78 Pine Street',
    category: 'Roads',
    description: 'Cracked sidewalk hazard',
    status: 'pending',
    reporter: 'Anna K.',
  },
];

export default function IssueTable() {
  const [issues, setIssues] = useState(initialIssues);
  const [filter, setFilter] = useState('all');

  const statusOptions = ['pending', 'in-progress', 'resolved'];

  const handleStatusChange = (issueId, newStatus) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter((issue) => issue.status === filter);

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
        <div>
          <h1 className={styles.title}>Manage Issues</h1>
          <p className={styles.subtitle}>Review and update the status of reported civic issues</p>
        </div>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Issues</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Location</th>
              <th>Category</th>
              <th>Description</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td>{new Date(issue.date).toLocaleDateString()}</td>
                <td>{issue.location}</td>
                <td>
                  <span className={styles.categoryBadge}>{issue.category}</span>
                </td>
                <td className={styles.descriptionCell}>{issue.description}</td>
                <td>{issue.reporter}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[issue.status]}`}>
                    {getStatusLabel(issue.status)}
                  </span>
                </td>
                <td>
                  <select
                    className={styles.actionSelect}
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredIssues.length === 0 && (
        <div className={styles.emptyState}>
          <p>No issues found matching the selected filter.</p>
        </div>
      )}
    </div>
  );
}
