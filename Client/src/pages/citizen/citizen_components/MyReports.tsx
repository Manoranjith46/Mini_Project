'use client';

import { useEffect, useState } from 'react';
import styles from './MyReports.module.css';
import { Skeleton } from '../../components/ui/skeleton';

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
  costAmount?: number;
}

interface StatusHistory {
  _id: string;
  status: string;
  changedAt: string;
  changedBy: {
    fullName: string;
    role: string;
  };
  costAdded: number;
}

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);

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

  const handleExpand = async (reportId: string) => {
    if (expandedId === reportId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(reportId);
    setHistoryLoading(true);
    setStatusHistory([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.statusHistory) {
        setStatusHistory(data.data.statusHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6 animate-pulse">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow border p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
            <div 
              key={report._id} 
              className={styles.reportCard} 
              onClick={() => handleExpand(report._id)}
              style={{ cursor: "pointer" }}
            >
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
                {report.costAmount !== undefined && report.costAmount > 0 && (
                  <div className={styles.meta} style={{ color: "#059669", fontWeight: "600" }}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span>${report.costAmount} Spent</span>
                  </div>
                )}
              </div>

              {expandedId === report._id && (
                <div className="mt-4 pt-4 border-t border-gray-100" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Status History</h4>
                  {historyLoading ? (
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Loading history...</p>
                  ) : statusHistory.length === 0 ? (
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>No history available yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {statusHistory.map((history) => (
                        <div key={history._id} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div style={{ marginTop: "0.25rem", width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#3b82f6" }} />
                          <div>
                            <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>
                              {history.status}
                              {history.costAdded > 0 && <span style={{ color: "#059669", marginLeft: "0.5rem" }}>+${history.costAdded}</span>}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              {new Date(history.changedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
