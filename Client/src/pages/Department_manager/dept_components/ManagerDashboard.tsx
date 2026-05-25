// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import styles from './ManagerDashboard.module.css';
import { useAuth } from '../../../context/AuthContext';

export default function ManagerDashboard({ user: propUser, viewMode = 'dashboard' }) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;

  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newOfficer, setNewOfficer] = useState({ name: '', phone: '', area: '', empId: '' });
  const [loading, setLoading] = useState(true);

  // Fetch real issues from the department endpoint
  const fetchIssues = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.issues) {
        // Map API response to component's expected format
        const mapped = data.issues.map((issue, idx) => ({
          id: issue._id,
          ticketNo: `ISS-${String(idx + 1).padStart(3, '0')}`,
          date: issue.reportedAt || issue.createdAt,
          location: issue.location?.address || 'Unknown',
          description: issue.description || issue.title,
          status: mapStatus(issue.status),
          priority: 'medium', // API doesn't have priority; default to medium
          reporter: issue.reportedBy || 'Anonymous',
          upvotes: issue.upvotes || 0,
          assignedTo: null,
        }));
        setIssues(mapped);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  // Fetch real workers from the worker endpoint
  const fetchWorkers = async () => {
    try {
      const zone = user?.place || 'Unassigned';
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/zone/${zone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        const mapped = data.data.map((worker) => ({
          id: worker._id,
          name: worker.fullName,
          area: worker.zone || 'Unassigned',
          activeIssues: Array.isArray(worker.assignedIssues) ? worker.assignedIssues.length : 0,
          completedToday: 0,
          phone: worker.phonenumber || '',
          status: worker.isActive ? 'active' : 'on-leave',
        }));
        setOfficers(mapped);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const mapStatus = (status) => {
    switch (status) {
      case 'Pending': return 'unassigned';
      case 'In Progress': return 'in-progress';
      case 'Resolved': return 'resolved';
      case 'Rejected': return 'resolved';
      default: return 'unassigned';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchIssues(), fetchWorkers()]);
      setLoading(false);
    };
    loadData();
  }, [user?.place]);

  const metrics = {
    total: issues.length,
    unassigned: issues.filter(i => i.status === 'unassigned').length,
    inProgress: issues.filter(i => i.status === 'in-progress' || i.status === 'assigned').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    critical: issues.filter(i => i.priority === 'critical').length,
  };

  const handleAssign = async (issueId, officerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ workerId: officerId, issueId }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setIssues(prev => prev.map(issue =>
          issue.id === issueId
            ? { ...issue, status: 'assigned', assignedTo: officerId }
            : issue
        ));
        // Refresh workers to update their active issue counts
        await fetchWorkers();
      }
    } catch (error) {
      console.error("Error assigning worker:", error);
    }
    setShowAssignModal(false);
    setSelectedIssue(null);
  };

  const handleReassign = (issueId) => {
    const issue = issues.find(i => i.id === issueId);
    setSelectedIssue(issue);
    setShowAssignModal(true);
  };

  const handleAddOfficer = async () => {
    if (newOfficer.name && newOfficer.phone && newOfficer.area) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              fullName: newOfficer.name,
              phonenumber: newOfficer.phone,
              employeeId: newOfficer.empId || `WRK-${Date.now()}`,
              departmentId: user?.id,
              zone: newOfficer.area,
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          await fetchWorkers();
          setNewOfficer({ name: '', phone: '', area: '', empId: '' });
          setShowAddOfficerModal(false);
        } else {
          alert(data.message || 'Failed to add worker');
        }
      } catch (error) {
        console.error("Error adding worker:", error);
      }
    }
  };

  const handleRemoveOfficer = (officerId) => {
    if (confirm('Are you sure you want to remove this field officer?')) {
      setOfficers(officers.filter(o => o.id !== officerId));
    }
  };

  const getOfficerName = (officerId) => {
    const officer = officers.find(o => o.id === officerId);
    return officer ? officer.name : 'Unassigned';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter !== 'all' && issue.status !== filter) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    return true;
  });

  const unassignedIssues = issues.filter(i => i.status === 'unassigned');

  if (loading) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Dashboard View
  const renderDashboard = () => (
    <>
      {/* Metrics Section */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-type="total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.total}</span>
            <span className={styles.metricLabel}>Total Issues</span>
          </div>
        </div>

        <div className={styles.metricCard} data-highlight="warning">
          <div className={styles.metricIcon} data-type="unassigned">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.unassigned}</span>
            <span className={styles.metricLabel}>Unassigned</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-type="progress">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.inProgress}</span>
            <span className={styles.metricLabel}>In Progress</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-type="resolved">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.resolved}</span>
            <span className={styles.metricLabel}>Resolved</span>
          </div>
        </div>

        <div className={styles.metricCard} data-highlight="critical">
          <div className={styles.metricIcon} data-type="critical">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.critical}</span>
            <span className={styles.metricLabel}>Critical Priority</span>
          </div>
        </div>
      </div>

      {/* Field Officers Overview */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Field Officers</h2>
          <span className={styles.sectionBadge}>{officers.filter(o => o.status === 'active').length} Active</span>
        </div>
        <div className={styles.officersGrid}>
          {officers.length > 0 ? officers.slice(0, 4).map(officer => (
            <div key={officer.id} className={styles.officerCard}>
              <div className={styles.officerAvatar}>
                {officer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={styles.officerInfo}>
                <span className={styles.officerName}>{officer.name}</span>
                <span className={styles.officerArea}>{officer.area}</span>
              </div>
              <div className={styles.officerStats}>
                <span className={styles.activeCount}>{officer.activeIssues}</span>
                <span className={styles.activeLabel}>Active</span>
              </div>
            </div>
          )) : (
            <p style={{ padding: '1rem', color: '#6b7280' }}>No field officers assigned to this zone yet.</p>
          )}
        </div>
      </div>

      {/* Recent Issues */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Issues</h2>
          <span className={styles.sectionBadge}>{issues.length} Total</span>
        </div>
        <div className={styles.issuesList}>
          {issues.length > 0 ? issues.slice(0, 3).map(issue => renderIssueCard(issue)) : (
            <p style={{ padding: '1rem', color: '#6b7280' }}>No issues assigned to this zone.</p>
          )}
        </div>
      </div>
    </>
  );

  // Assign Tasks View
  const renderAssignTasks = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Unassigned Issues</h2>
        <span className={styles.sectionBadge}>{unassignedIssues.length} Pending</span>
      </div>
      {unassignedIssues.length === 0 ? (
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <h3>All Caught Up!</h3>
          <p>There are no unassigned issues at the moment.</p>
        </div>
      ) : (
        <div className={styles.issuesList}>
          {unassignedIssues.map(issue => renderIssueCard(issue))}
        </div>
      )}
    </div>
  );

  // Field Officers Management View
  const renderFieldOfficers = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Field Officers</h2>
        <button className={styles.addBtn} onClick={() => setShowAddOfficerModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Officer
        </button>
      </div>
      {officers.length > 0 ? (
        <div className={styles.officersTable}>
          <div className={styles.tableHeader}>
            <span>Officer</span>
            <span>Area</span>
            <span>Phone</span>
            <span>Active Tasks</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {officers.map(officer => (
            <div key={officer.id} className={styles.tableRow}>
              <div className={styles.officerCell}>
                <div className={styles.officerAvatar}>
                  {officer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span>{officer.name}</span>
              </div>
              <span>{officer.area}</span>
              <span>{officer.phone}</span>
              <span className={styles.taskCount}>{officer.activeIssues}</span>
              <span className={`${styles.statusBadge} ${styles[officer.status]}`}>
                {officer.status === 'active' ? 'Active' : 'On Leave'}
              </span>
              <div className={styles.actionBtns}>
                <button className={styles.deleteBtn} onClick={() => handleRemoveOfficer(officer.id)} title="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ padding: '1rem', color: '#6b7280' }}>No field officers in this zone. Add one to get started.</p>
      )}
    </div>
  );

  // Workload Balancing View
  const renderWorkload = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Workload Distribution</h2>
        <span className={styles.sectionBadge}>Real-time</span>
      </div>
      <div className={styles.workloadGrid}>
        {officers.length > 0 ? officers.map(officer => {
          const workloadPercentage = (officer.activeIssues / 8) * 100;
          const workloadLevel = workloadPercentage > 75 ? 'high' : workloadPercentage > 50 ? 'medium' : 'low';
          return (
            <div key={officer.id} className={styles.workloadCard}>
              <div className={styles.workloadHeader}>
                <div className={styles.officerAvatar}>
                  {officer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={styles.workloadInfo}>
                  <span className={styles.officerName}>{officer.name}</span>
                  <span className={styles.officerArea}>{officer.area}</span>
                </div>
                <span className={`${styles.workloadBadge} ${styles[workloadLevel]}`}>
                  {workloadLevel.charAt(0).toUpperCase() + workloadLevel.slice(1)}
                </span>
              </div>
              <div className={styles.workloadBar}>
                <div 
                  className={styles.workloadProgress} 
                  style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                  data-level={workloadLevel}
                />
              </div>
              <div className={styles.workloadStats}>
                <div className={styles.workloadStat}>
                  <span className={styles.statValue}>{officer.activeIssues}</span>
                  <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.workloadStat}>
                  <span className={styles.statValue}>{officer.completedToday}</span>
                  <span className={styles.statLabel}>Completed Today</span>
                </div>
                <div className={styles.workloadStat}>
                  <span className={styles.statValue}>{8 - officer.activeIssues}</span>
                  <span className={styles.statLabel}>Capacity</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <p style={{ padding: '1rem', color: '#6b7280' }}>No field officers to display workload for.</p>
        )}
      </div>
    </div>
  );

  // Issue Card Component
  const renderIssueCard = (issue) => (
    <div key={issue.id} className={styles.issueCard}>
      <div className={styles.issueHeader}>
        <span className={styles.ticketNo}>{issue.ticketNo}</span>
        <span 
          className={styles.priorityBadge}
          style={{ backgroundColor: `${getPriorityColor(issue.priority)}20`, color: getPriorityColor(issue.priority) }}
        >
          {issue.priority}
        </span>
      </div>
      <p className={styles.issueDescription}>{issue.description}</p>
      <div className={styles.issueMeta}>
        <span className={styles.metaItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {issue.location}
        </span>
        <span className={styles.metaItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          {issue.upvotes} upvotes
        </span>
        <span className={styles.metaItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {new Date(issue.date).toLocaleDateString()}
        </span>
      </div>
      <div className={styles.issueFooter}>
        <div className={styles.assignedInfo}>
          {issue.assignedTo ? (
            <>
              <span className={styles.assignedLabel}>Assigned to:</span>
              <span className={styles.assignedName}>{getOfficerName(issue.assignedTo)}</span>
            </>
          ) : (
            <span className={styles.unassignedLabel}>Not assigned</span>
          )}
        </div>
        <div className={styles.issueActions}>
          {issue.status === 'unassigned' ? (
            <button 
              className={styles.assignBtn}
              onClick={() => { setSelectedIssue(issue); setShowAssignModal(true); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Assign
            </button>
          ) : (
            <button 
              className={styles.reassignBtn}
              onClick={() => handleReassign(issue.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Reassign
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      {/* Render based on viewMode */}
      {viewMode === 'dashboard' && renderDashboard()}
      {viewMode === 'assign' && renderAssignTasks()}
      {viewMode === 'officers' && renderFieldOfficers()}
      {viewMode === 'workload' && renderWorkload()}

      {/* Assignment Modal */}
      {showAssignModal && selectedIssue && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Assign Issue</h3>
              <button className={styles.closeBtn} onClick={() => setShowAssignModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.issuePreview}>
                <span className={styles.previewTicket}>{selectedIssue.ticketNo}</span>
                <p className={styles.previewDesc}>{selectedIssue.description}</p>
                <span className={styles.previewLocation}>{selectedIssue.location}</span>
              </div>
              <div className={styles.officerSelect}>
                <h4>Select Field Officer</h4>
                {officers.filter(o => o.status === 'active').length > 0 ? (
                  <div className={styles.officerOptions}>
                    {officers.filter(o => o.status === 'active').map(officer => (
                      <button
                        key={officer.id}
                        className={styles.officerOption}
                        onClick={() => handleAssign(selectedIssue.id, officer.id)}
                      >
                        <div className={styles.optionAvatar}>
                          {officer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={styles.optionInfo}>
                          <span className={styles.optionName}>{officer.name}</span>
                          <span className={styles.optionArea}>{officer.area}</span>
                        </div>
                        <div className={styles.optionWorkload}>
                          <span className={styles.workloadCount}>{officer.activeIssues}</span>
                          <span className={styles.workloadLabel}>ACTIVE</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ padding: '1rem', color: '#6b7280' }}>No active field officers available. Add workers first.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddOfficerModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add Field Officer</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddOfficerModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  placeholder="Enter officer name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Employee ID</label>
                <input 
                  type="text" 
                  value={newOfficer.empId}
                  onChange={(e) => setNewOfficer({...newOfficer, empId: e.target.value})}
                  placeholder="FOF001"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({...newOfficer, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Assigned Area</label>
                <input 
                  type="text" 
                  value={newOfficer.area}
                  onChange={(e) => setNewOfficer({...newOfficer, area: e.target.value})}
                  placeholder="e.g., North Zone"
                />
              </div>
              <button className={styles.submitBtn} onClick={handleAddOfficer}>
                Add Field Officer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
