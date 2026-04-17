'use client';

import styles from './MapView.module.css';

const issueMarkers = [
  { id: 1, x: 25, y: 30, category: 'Sanitation', status: 'pending' },
  { id: 2, x: 45, y: 55, category: 'Water', status: 'pending' },
  { id: 3, x: 65, y: 25, category: 'Electricity', status: 'in-progress' },
  { id: 4, x: 35, y: 70, category: 'Roads', status: 'resolved' },
  { id: 5, x: 75, y: 60, category: 'Public Safety', status: 'in-progress' },
  { id: 6, x: 55, y: 40, category: 'Roads', status: 'pending' },
  { id: 7, x: 20, y: 55, category: 'Electricity', status: 'pending' },
  { id: 8, x: 80, y: 35, category: 'Sanitation', status: 'in-progress' },
];

export default function MapView() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>City Map View</h1>
          <p className={styles.subtitle}>
            Visual overview of all active issue reports across the city
          </p>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.pending}`}></span>
            <span>Pending</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.inProgress}`}></span>
            <span>In Progress</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.resolved}`}></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <div className={styles.mapPlaceholder}>
          {/* Grid lines for visual effect */}
          <div className={styles.gridOverlay}>
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} className={styles.gridLineH} style={{ top: `${(i + 1) * 10}%` }} />
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} className={styles.gridLineV} style={{ left: `${(i + 1) * 10}%` }} />
            ))}
          </div>

          {/* Issue Markers */}
          {issueMarkers.map((marker) => (
            <div
              key={marker.id}
              className={`${styles.marker} ${styles[marker.status.replace('-', '')]}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              title={`${marker.category} - ${marker.status}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" fill="white" />
              </svg>
            </div>
          ))}

          {/* City Label */}
          <div className={styles.cityLabel}>
            <span>City Center</span>
          </div>
        </div>

        <div className={styles.mapInfo}>
          <div className={styles.infoCard}>
            <span className={styles.infoValue}>8</span>
            <span className={styles.infoLabel}>Active Pins</span>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoValue}>3</span>
            <span className={styles.infoLabel}>Pending</span>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoValue}>3</span>
            <span className={styles.infoLabel}>In Progress</span>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoValue}>2</span>
            <span className={styles.infoLabel}>Resolved</span>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        This is a placeholder map view. Integrate with a mapping service (Google Maps, Mapbox, etc.) 
        to display actual GPS coordinates of reported issues.
      </p>
    </div>
  );
}
