'use client';

import styles from './Hero.module.css';

export default function Hero({ onNavigate }: { onNavigate: any }) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            Trusted by 10,000+ Citizens
          </div>
          <h1 className={styles.title}>
            Report Civic Issues,
            <span className={styles.highlight}> Build a Better City</span>
          </h1>
          <p className={styles.subtitle}>
            Your voice matters. Report potholes, broken streetlights, sanitation problems, 
            and more. Track your reports in real-time and see your community improve.
          </p>
          <div className={styles.actions}>
            <button className={styles.primaryBtn} onClick={() => onNavigate('report')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Report an Issue
            </button>
            <button className={styles.secondaryBtn} onClick={() => onNavigate('myReports')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Track My Reports
            </button>
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>2,547</span>
                <span className={styles.statLabel}>Issues Reported</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>1,892</span>
                <span className={styles.statLabel}>Issues Resolved</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>48h</span>
                <span className={styles.statLabel}>Avg. Response</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>15</span>
                <span className={styles.statLabel}>Departments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>Report Categories</h2>
          <div className={styles.categoriesGrid}>
            {[
              { icon: '🚧', label: 'Roads & Potholes', count: 423 },
              { icon: '💡', label: 'Street Lights', count: 312 },
              { icon: '🗑️', label: 'Garbage & Waste', count: 567 },
              { icon: '💧', label: 'Water Supply', count: 289 },
              { icon: '🌳', label: 'Parks & Gardens', count: 156 },
              { icon: '🚰', label: 'Drainage', count: 234 },
            ].map((cat, idx) => (
              <div key={idx} className={styles.categoryCard}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryCount}>{cat.count} reports</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className={styles.bgDecor}>
        <div className={styles.bgOrb1}></div>
        <div className={styles.bgOrb2}></div>
        <div className={styles.bgGrid}></div>
      </div>
    </section>
  );
}
