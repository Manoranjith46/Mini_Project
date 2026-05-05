'use client';

import { useState } from 'react';
import styles from './AdminDashboard.module.css';

const DEPARTMENTS = [
  { id: 'electricity', name: 'Electricity' },
  { id: 'water-supply', name: 'Water Supply' },
  { id: 'roads', name: 'Roads & Infrastructure' },
  { id: 'sanitation', name: 'Sanitation' },
  { id: 'parks', name: 'Parks & Recreation' },
  { id: 'public-health', name: 'Public Health' },
];

const mockManagers = [
  { id: 1, name: 'John Smith', department: 'Roads & Infrastructure', empId: 'MGR-001', phone: '9876543210', status: 'active', issues: 45, fieldOfficers: 8 },
  { id: 2, name: 'Sarah Johnson', department: 'Water Supply', empId: 'MGR-002', phone: '9876543211', status: 'active', issues: 32, fieldOfficers: 6 },
  { id: 3, name: 'Mike Davis', department: 'Electricity', empId: 'MGR-003', phone: '9876543212', status: 'inactive', issues: 28, fieldOfficers: 5 },
  { id: 4, name: 'Emily Brown', department: 'Sanitation', empId: 'MGR-004', phone: '9876543213', status: 'active', issues: 56, fieldOfficers: 10 },
];

const mockFieldOfficers = [
  { id: 1, name: 'Raj Kumar', department: 'Roads & Infrastructure', empId: 'FO-001', phone: '9876543220', status: 'active', tasksCompleted: 24, manager: 'John Smith' },
  { id: 2, name: 'Priya Sharma', department: 'Water Supply', empId: 'FO-002', phone: '9876543221', status: 'active', tasksCompleted: 18, manager: 'Sarah Johnson' },
  { id: 3, name: 'Amit Singh', department: 'Electricity', empId: 'FO-003', phone: '9876543222', status: 'active', tasksCompleted: 31, manager: 'Mike Davis' },
];

const mockCitizens = [
  { id: 1, name: 'Rahul Verma', phone: '9876543230', aadhar: '1234 5678 9012', reports: 5, status: 'active' },
  { id: 2, name: 'Neha Gupta', phone: '9876543231', aadhar: '2345 6789 0123', reports: 3, status: 'active' },
  { id: 3, name: 'Vikram Patel', phone: '9876543232', aadhar: '3456 7890 1234', reports: 8, status: 'active' },
];

const budgetData = [
  { department: 'Roads & Infrastructure', allocated: 5000000, spent: 3200000, pending: 1800000 },
  { department: 'Water Supply', allocated: 3500000, spent: 2100000, pending: 1400000 },
  { department: 'Electricity', allocated: 2800000, spent: 1900000, pending: 900000 },
  { department: 'Sanitation', allocated: 2000000, spent: 1500000, pending: 500000 },
  { department: 'Parks & Recreation', allocated: 1500000, spent: 800000, pending: 700000 },
  { department: 'Public Health', allocated: 1200000, spent: 600000, pending: 600000 },
];

export default function AdminDashboard({ user, viewMode }) {
  const [managers, setManagers] = useState(mockManagers);
  const [fieldOfficers, setFieldOfficers] = useState(mockFieldOfficers);
  const [citizens, setCitizens] = useState(mockCitizens);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('manager');
  const [selectedTab, setSelectedTab] = useState('managers');
  const [newUser, setNewUser] = useState({
    name: '',
    empId: '',
    phone: '',
    department: '',
    designation: '',
  });

  const handleAddUser = () => {
    if (addType === 'manager') {
      const newManager = {
        id: Date.now(),
        name: newUser.name,
        department: DEPARTMENTS.find(d => d.id === newUser.department)?.name || newUser.department,
        empId: newUser.empId,
        phone: newUser.phone,
        status: 'active',
        issues: 0,
        fieldOfficers: 0,
      };
      setManagers([...managers, newManager]);
    }
    setShowAddModal(false);
    setNewUser({ name: '', empId: '', phone: '', department: '', designation: '' });
    alert('User added successfully!');
  };

  const handleRemoveUser = (type, id) => {
    if (confirm('Are you sure you want to remove this user?')) {
      if (type === 'manager') {
        setManagers(managers.filter(m => m.id !== id));
      } else if (type === 'officer') {
        setFieldOfficers(fieldOfficers.filter(f => f.id !== id));
      }
      alert('User removed successfully!');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Budget Tracking View
  if (viewMode === 'budget') {
    const totalAllocated = budgetData.reduce((acc, d) => acc + d.allocated, 0);
    const totalSpent = budgetData.reduce((acc, d) => acc + d.spent, 0);
    const totalPending = budgetData.reduce((acc, d) => acc + d.pending, 0);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Budget Tracking</h2>
          <p className={styles.subtitle}>Track estimated vs actual costs by department</p>
        </div>

        <div className={styles.budgetSummary}>
          <div className={styles.budgetCard}>
            <div className={styles.budgetIcon} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className={styles.budgetInfo}>
              <span className={styles.budgetValue}>{formatCurrency(totalAllocated)}</span>
              <span className={styles.budgetLabel}>Total Allocated</span>
            </div>
          </div>

          <div className={styles.budgetCard}>
            <div className={styles.budgetIcon} style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className={styles.budgetInfo}>
              <span className={styles.budgetValue}>{formatCurrency(totalSpent)}</span>
              <span className={styles.budgetLabel}>Total Spent</span>
            </div>
          </div>

          <div className={styles.budgetCard}>
            <div className={styles.budgetIcon} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className={styles.budgetInfo}>
              <span className={styles.budgetValue}>{formatCurrency(totalPending)}</span>
              <span className={styles.budgetLabel}>Pending</span>
            </div>
          </div>

          <div className={styles.budgetCard}>
            <div className={styles.budgetIcon} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <div className={styles.budgetInfo}>
              <span className={styles.budgetValue}>{((totalSpent / totalAllocated) * 100).toFixed(1)}%</span>
              <span className={styles.budgetLabel}>Utilization</span>
            </div>
          </div>
        </div>

        <div className={styles.budgetTable}>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Pending</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {budgetData.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department}</td>
                  <td>{formatCurrency(dept.allocated)}</td>
                  <td>{formatCurrency(dept.spent)}</td>
                  <td>{formatCurrency(dept.pending)}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${(dept.spent / dept.allocated) * 100}%` }}
                      />
                      <span>{((dept.spent / dept.allocated) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // User Management View
  if (viewMode === 'users') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
          <p className={styles.subtitle}>Manage department managers, field officers, and citizens</p>
        </div>

        <div className={styles.userTabs}>
          <button
            className={`${styles.tabBtn} ${selectedTab === 'managers' ? styles.activeTab : ''}`}
            onClick={() => setSelectedTab('managers')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Dept. Managers ({managers.length})
          </button>
          <button
            className={`${styles.tabBtn} ${selectedTab === 'officers' ? styles.activeTab : ''}`}
            onClick={() => setSelectedTab('officers')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Field Officers ({fieldOfficers.length})
          </button>
          <button
            className={`${styles.tabBtn} ${selectedTab === 'citizens' ? styles.activeTab : ''}`}
            onClick={() => setSelectedTab('citizens')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Citizens ({citizens.length})
          </button>
        </div>

        {selectedTab === 'managers' && (
          <>
            <div className={styles.tableHeader}>
              <h3>Department Managers</h3>
              <button className={styles.addBtn} onClick={() => { setAddType('manager'); setShowAddModal(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Manager
              </button>
            </div>
            <div className={styles.userTable}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Field Officers</th>
                    <th>Issues</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{manager.name.charAt(0)}</div>
                          {manager.name}
                        </div>
                      </td>
                      <td>{manager.empId}</td>
                      <td>{manager.department}</td>
                      <td>+91 {manager.phone}</td>
                      <td>{manager.fieldOfficers}</td>
                      <td>{manager.issues}</td>
                      <td>
                        <span className={`${styles.status} ${styles[manager.status]}`}>
                          {manager.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => handleRemoveUser('manager', manager.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedTab === 'officers' && (
          <>
            <div className={styles.tableHeader}>
              <h3>Field Officers</h3>
            </div>
            <div className={styles.userTable}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Manager</th>
                    <th>Tasks Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldOfficers.map((officer) => (
                    <tr key={officer.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={{ background: '#ea580c' }}>{officer.name.charAt(0)}</div>
                          {officer.name}
                        </div>
                      </td>
                      <td>{officer.empId}</td>
                      <td>{officer.department}</td>
                      <td>{officer.manager}</td>
                      <td>{officer.tasksCompleted}</td>
                      <td>
                        <span className={`${styles.status} ${styles[officer.status]}`}>
                          {officer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedTab === 'citizens' && (
          <>
            <div className={styles.tableHeader}>
              <h3>Registered Citizens</h3>
            </div>
            <div className={styles.userTable}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Aadhar</th>
                    <th>Reports Filed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map((citizen) => (
                    <tr key={citizen.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={{ background: '#2563eb' }}>{citizen.name.charAt(0)}</div>
                          {citizen.name}
                        </div>
                      </td>
                      <td>+91 {citizen.phone}</td>
                      <td>{citizen.aadhar}</td>
                      <td>{citizen.reports}</td>
                      <td>
                        <span className={`${styles.status} ${styles[citizen.status]}`}>
                          {citizen.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Add Department Manager</h3>
                <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Employee ID</label>
                  <input
                    type="text"
                    placeholder="Enter employee ID"
                    value={newUser.empId}
                    onChange={(e) => setNewUser({ ...newUser, empId: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className={styles.submitBtn} onClick={handleAddUser}>
                  Add Manager
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Dashboard View
  const metrics = [
    { label: 'Total Issues', value: '2,547', change: '+12%', changeType: 'positive', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { label: 'Pending Resolution', value: '342', change: '-8%', changeType: 'positive', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0v10l5 3' },
    { label: 'Resolved Today', value: '47', change: '+23%', changeType: 'positive', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' },
    { label: 'Avg. Response Time', value: '48h', change: '-15%', changeType: 'positive', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' },
  ];

  const recentActivity = [
    { id: 1, action: 'New issue reported', location: 'Main Street', time: '5 min ago', type: 'new' },
    { id: 2, action: 'Issue resolved', location: 'Park Avenue', time: '12 min ago', type: 'resolved' },
    { id: 3, action: 'Status updated to In Progress', location: 'Elm Drive', time: '25 min ago', type: 'update' },
    { id: 4, action: 'New issue reported', location: 'Oak Boulevard', time: '1 hour ago', type: 'new' },
    { id: 5, action: 'Issue resolved', location: 'Cedar Lane', time: '2 hours ago', type: 'resolved' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Monitor city-wide civic issues at a glance</p>
      </div>

      <div className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={metric.icon} />
              </svg>
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
            </div>
            <span className={`${styles.metricChange} ${styles[metric.changeType]}`}>
              {metric.change}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <span className={`${styles.activityDot} ${styles[activity.type]}`}></span>
              <div className={styles.activityContent}>
                <span className={styles.activityAction}>{activity.action}</span>
                <span className={styles.activityLocation}>{activity.location}</span>
              </div>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
