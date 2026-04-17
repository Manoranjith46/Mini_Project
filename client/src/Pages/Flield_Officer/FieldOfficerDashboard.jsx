'use client';

import { useState } from 'react';
import styles from './FieldOfficerDashboard.module.css';

const mockTasks = [
  {
    id: 'TASK-001',
    issueId: 'ISS-2024-001',
    category: 'Roads & Potholes',
    categoryIcon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
    description: 'Large pothole on Main Street near the traffic signal.',
    location: '123 Main Street, Ward 5',
    priority: 'high',
    status: 'assigned',
    assignedDate: '2024-01-22',
    dueDate: '2024-01-24',
    reportedBy: 'Citizen',
    estimatedCost: 5000,
  },
  {
    id: 'TASK-002',
    issueId: 'ISS-2024-005',
    category: 'Water Supply',
    categoryIcon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    description: 'Leaking water pipe causing water wastage.',
    location: 'Block B, Sector 7',
    priority: 'medium',
    status: 'in-progress',
    assignedDate: '2024-01-21',
    dueDate: '2024-01-25',
    reportedBy: 'Citizen',
    estimatedCost: 3500,
  },
  {
    id: 'TASK-003',
    issueId: 'ISS-2024-008',
    category: 'Electricity',
    categoryIcon: 'M13 10V3L4 14h7v7l9-11h-7z',
    description: 'Streetlight not working near community park.',
    location: 'Community Park, Zone A',
    priority: 'low',
    status: 'assigned',
    assignedDate: '2024-01-23',
    dueDate: '2024-01-28',
    reportedBy: 'Citizen',
    estimatedCost: 1500,
  },
];

const completedTasks = [
  {
    id: 'TASK-100',
    category: 'Sanitation',
    description: 'Garbage collection issue resolved',
    completedDate: '2024-01-20',
    rating: 4,
  },
  {
    id: 'TASK-099',
    category: 'Roads',
    description: 'Minor road repair completed',
    completedDate: '2024-01-18',
    rating: 5,
  },
];

export default function FieldOfficerDashboard({ user, viewMode }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    photo: null,
    actualCost: '',
  });

  const handleStatusUpdate = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);
    setStatusUpdate({
      status: task.status,
      notes: '',
      photo: null,
      actualCost: task.estimatedCost?.toString() || '',
    });
    setUpdateModal(true);
  };

  const submitStatusUpdate = () => {
    setTasks(prev => 
      prev.map(task => 
        task.id === selectedTask.id 
          ? { ...task, status: statusUpdate.status }
          : task
      )
    );
    setUpdateModal(false);
    setSelectedTask(null);
    alert('Status updated successfully! Manager will be notified.');
  };

  const getPriorityClass = (priority) => {
    return styles[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`];
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'assigned': styles.statusAssigned,
      'in-progress': styles.statusInProgress,
      'completed': styles.statusCompleted,
    };
    return statusMap[status] || styles.statusAssigned;
  };

  const stats = {
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completedToday: completedTasks.filter(t => t.completedDate === new Date().toISOString().split('T')[0]).length,
    avgRating: (completedTasks.reduce((acc, t) => acc + t.rating, 0) / completedTasks.length).toFixed(1),
  };

  if (viewMode === 'completed') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Completed Tasks</h2>
          <p className={styles.subtitle}>Your task completion history</p>
        </div>

        <div className={styles.completedList}>
          {completedTasks.map((task) => (
            <div key={task.id} className={styles.completedCard}>
              <div className={styles.completedInfo}>
                <span className={styles.taskId}>{task.id}</span>
                <h4>{task.description}</h4>
                <p>Completed on {new Date(task.completedDate).toLocaleDateString()}</p>
              </div>
              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    viewBox="0 0 24 24"
                    fill={star <= task.rating ? '#f59e0b' : 'none'}
                    stroke={star <= task.rating ? '#f59e0b' : '#d1d5db'}
                    strokeWidth="2"
                    className={styles.star}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'tasks') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Assigned Tasks</h2>
          <p className={styles.subtitle}>Tasks assigned to you by department manager</p>
        </div>

        <div className={styles.taskList}>
          {tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div className={styles.categoryBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={task.categoryIcon} />
                  </svg>
                  <span>{task.category}</span>
                </div>
                <span className={`${styles.priority} ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <p className={styles.taskDescription}>{task.description}</p>

              <div className={styles.taskMeta}>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{task.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.taskActions}>
                <span className={`${styles.status} ${getStatusClass(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <button 
                  className={styles.updateBtn}
                  onClick={() => handleStatusUpdate(task.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status Update Modal */}
        {updateModal && selectedTask && (
          <div className={styles.modalOverlay} onClick={() => setUpdateModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Update Task Status</h3>
                <button className={styles.closeBtn} onClick={() => setUpdateModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.taskInfo}>
                  <span className={styles.taskId}>{selectedTask.id}</span>
                  <p>{selectedTask.description}</p>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Work Notes</label>
                  <textarea
                    placeholder="Describe the work done..."
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Actual Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="Enter actual cost"
                    value={statusUpdate.actualCost}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, actualCost: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Upload Photo Proof</label>
                  <div className={styles.uploadArea}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span>Click to upload completion photo</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setUpdateModal(false)}>
                  Cancel
                </button>
                <button className={styles.submitBtn} onClick={submitStatusUpdate}>
                  Submit Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Dashboard View
  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.assigned}</span>
            <span className={styles.statLabel}>Assigned Tasks</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{completedTasks.length}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.avgRating}</span>
            <span className={styles.statLabel}>Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Priority Tasks
        </h3>
        
        <div className={styles.taskList}>
          {tasks
            .filter(t => t.priority === 'high')
            .map((task) => (
              <div key={task.id} className={`${styles.taskCard} ${styles.urgentCard}`}>
                <div className={styles.taskHeader}>
                  <div className={styles.categoryBadge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={task.categoryIcon} />
                    </svg>
                    <span>{task.category}</span>
                  </div>
                  <span className={`${styles.priority} ${styles.priorityHigh}`}>
                    Urgent
                  </span>
                </div>

                <p className={styles.taskDescription}>{task.description}</p>

                <div className={styles.taskMeta}>
                  <div className={styles.metaItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{task.location}</span>
                  </div>
                </div>

                <button 
                  className={styles.startBtn}
                  onClick={() => handleStatusUpdate(task.id)}
                >
                  {task.status === 'assigned' ? 'Start Task' : 'Update Status'}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* All Tasks */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          All Assigned Tasks
        </h3>
        
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div className={styles.categoryBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={task.categoryIcon} />
                  </svg>
                  <span>{task.category}</span>
                </div>
                <span className={`${styles.priority} ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <p className={styles.taskDescription}>{task.description}</p>

              <div className={styles.taskMeta}>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{task.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.taskActions}>
                <span className={`${styles.status} ${getStatusClass(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <button 
                  className={styles.updateBtn}
                  onClick={() => handleStatusUpdate(task.id)}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Modal */}
      {updateModal && selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setUpdateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update Task Status</h3>
              <button className={styles.closeBtn} onClick={() => setUpdateModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.taskInfo}>
                <span className={styles.taskId}>{selectedTask.id}</span>
                <p>{selectedTask.description}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                >
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Work Notes</label>
                <textarea
                  placeholder="Describe the work done..."
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Actual Cost (INR)</label>
                <input
                  type="number"
                  placeholder="Enter actual cost"
                  value={statusUpdate.actualCost}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, actualCost: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Upload Photo Proof</label>
                <div className={styles.uploadArea}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span>Click to upload completion photo</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setUpdateModal(false)}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={submitStatusUpdate}>
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
