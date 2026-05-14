'use client';

import { useEffect, useState } from 'react';
import styles from './MyReports.module.css';

interface Report {
  _id: string;
  title: string;
  description: string;
  issueType: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: string;
  createdAt: string;
  image?: string;
}

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/citizen/issues`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        if (Array.isArray(data.issues)) {
          setReports(data.issues);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div className={styles.loading}>Loading your reports...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Reported Issues</h2>
        <p className={styles.subtitle}>Track the status and history of all issues you've submitted.</p>
      </div>

      {reports.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't reported any issues yet.</p>
        </div>
      ) : (
        <div className={styles.reportsList}>
          {reports.map((report) => (
            <div key={report._id} className={styles.reportCard}>
              <div className={styles.cardHeader}>
                <span className={styles.category}>{report.issueType}</span>
                <span className={`${styles.status} ${styles[report.status.toLowerCase().replace(' ', '-')] || ''}`}>
                  {report.status}
                </span>
              </div>
              
              <h3 className={styles.reportTitle}>{report.title}</h3>
              <p className={styles.description}>{report.description}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{report.location?.address}</span>
                </div>
                <div className={styles.meta}>
                  <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
