'use client';

import { useEffect, useState } from 'react';
import styles from './CommunityIssues.module.css';

interface Issue {
  _id: string;
  title: string;
  description: string;
  issueType: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  upvotes: number;
  createdAt: string;
  image?: string;
  status: string;
}

export default function CommunityIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/all-issues`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        if (Array.isArray(data.issues)) {
          setIssues(data.issues);
        }
      } catch (error) {
        console.error('Error fetching community issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleUpvote = async (issueId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/issue/${issueId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const updated = await response.json();
        setIssues(prev => prev.map(i => i._id === issueId ? { ...i, upvotes: updated.upvotes } : i));
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading community issues...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Community Issues</h2>
          <p className={styles.subtitle}>See what's happening in your neighborhood and upvote to prioritize.</p>
        </div>
      </div>

      <div className={styles.issuesList}>
        {issues.map((issue) => (
          <div key={issue._id} className={styles.issueCard}>
            <div className={styles.upvoteSection}>
              <button className={styles.upvoteBtn} onClick={() => handleUpvote(issue._id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
                <span>{issue.upvotes || 0}</span>
              </button>
            </div>
            
            <div className={styles.issueContent}>
              <div className={styles.issueHeader}>
                <div className={styles.categoryBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  {issue.issueType}
                </div>
                <span className={`${styles.status} ${styles[issue.status.toLowerCase().replace(' ', '-')] || ''}`}>
                  {issue.status}
                </span>
              </div>

              <h3 className={styles.issueTitle}>{issue.title}</h3>
              <p className={styles.description}>{issue.description}</p>
              
              <div className={styles.issueMeta}>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {issue.location?.address}
                </div>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {issue.image && (
              <div className={styles.imageWrapper}>
                <img 
                  src={issue.image.startsWith('http') ? issue.image : `${import.meta.env.VITE_BACKEND_URL}${issue.image}`} 
                  alt={issue.title} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
