'use client';

import { useEffect, useState } from 'react';
import styles from './CommunityIssues.module.css';
import { X } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { motion } from 'framer-motion';
import { Skeleton } from '../../components/ui/skeleton';

interface Issue {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  reportedAt: string;
  image?: string;
  status: string;
  reportedBy?: string;
}

export default function CommunityIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIssue, setExpandedIssue] = useState<Issue | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6 animate-pulse">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow border p-6 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
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
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Community Issues</h2>
          <p className={styles.subtitle}>Browse and track civic issues reported in your neighborhood. Stay informed and engaged!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setExpandedIssue(issue)}
            className="bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
          >
            {/* Image Section */}
            {issue.image && (
              <div className="h-40 bg-gray-200 overflow-hidden">
                <img
                  src={issue.image.startsWith("http") ? issue.image : `${import.meta.env.VITE_BACKEND_URL}${issue.image}`}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Card Content */}
            <div className="p-4 flex flex-col flex-grow">
              {/* Status Badge */}
              <div className="mb-3">
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                {issue.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {issue.description}
              </p>

              {/* Issue Type */}
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-semibold">Type:</span> {issue.type}
              </div>

              {/* Location */}
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-semibold">Location:</span> {issue.location?.address}
              </div>

              {/* Date */}
              <div className="text-xs text-gray-400 mt-auto">
                {new Date(issue.reportedAt).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Modal */}
      {expandedIssue && (
        <div className={styles.modal} onClick={() => setExpandedIssue(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setExpandedIssue(null)}>
              <X size={24} />
            </button>

            {expandedIssue.image && (
              <div className={styles.expandedImage}>
                <img 
                  src={expandedIssue.image.startsWith('http') ? expandedIssue.image : `${import.meta.env.VITE_BACKEND_URL}${expandedIssue.image}`} 
                  alt={expandedIssue.title} 
                />
              </div>
            )}

            <div className={styles.expandedDetails}>
              <div className={styles.expandedStatusBar}>
                <Badge className={getStatusColor(expandedIssue.status)}>
                  {expandedIssue.status}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {expandedIssue.type}
                </Badge>
              </div>

              <h2 className={styles.expandedTitle}>{expandedIssue.title}</h2>
              
              <div className={styles.expandedSection}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p className={styles.expandedDescription}>{expandedIssue.description}</p>
              </div>

              <div className={styles.expandedSection}>
                <h3 className={styles.sectionTitle}>Issue Details</h3>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div className={styles.detailLabel}>Location</div>
                      <div className={styles.detailValue}>{expandedIssue.location?.address}</div>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div className={styles.detailLabel}>Reported On</div>
                      <div className={styles.detailValue}>{new Date(expandedIssue.reportedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <div>
                      <div className={styles.detailLabel}>Category</div>
                      <div className={styles.detailValue}>{expandedIssue.type}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actionNote}>
                <p>ℹ️ Report received. Our team will review and take necessary action.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
