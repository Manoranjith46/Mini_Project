'use client';

import styles from './AnalyticsView.module.css';

export default function AnalyticsView() {
  const categoryData = [
    { category: 'Roads & Potholes', count: 845, percentage: 33 },
    { category: 'Sanitation', count: 612, percentage: 24 },
    { category: 'Electricity', count: 498, percentage: 20 },
    { category: 'Water & Drainage', count: 356, percentage: 14 },
    { category: 'Public Safety', count: 236, percentage: 9 },
  ];

  const monthlyTrend = [
    { month: 'Aug', reported: 180, resolved: 165 },
    { month: 'Sep', reported: 220, resolved: 195 },
    { month: 'Oct', reported: 195, resolved: 210 },
    { month: 'Nov', reported: 240, resolved: 225 },
    { month: 'Dec', reported: 210, resolved: 230 },
    { month: 'Jan', reported: 275, resolved: 245 },
  ];

  const maxValue = Math.max(...monthlyTrend.flatMap((m) => [m.reported, m.resolved]));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Insights and trends from civic issue reports</p>
      </div>

      <div className={styles.grid}>
        {/* Category Breakdown */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Issues by Category</h2>
          <div className={styles.categoryList}>
            {categoryData.map((item, index) => (
              <div key={index} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>{item.category}</span>
                  <span className={styles.categoryCount}>{item.count}</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Monthly Trend</h2>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.reported}`}></span>
              <span>Reported</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.resolved}`}></span>
              <span>Resolved</span>
            </div>
          </div>
          <div className={styles.chart}>
            {monthlyTrend.map((item, index) => (
              <div key={index} className={styles.chartColumn}>
                <div className={styles.bars}>
                  <div
                    className={`${styles.bar} ${styles.reported}`}
                    style={{ height: `${(item.reported / maxValue) * 100}%` }}
                    title={`Reported: ${item.reported}`}
                  ></div>
                  <div
                    className={`${styles.bar} ${styles.resolved}`}
                    style={{ height: `${(item.resolved / maxValue) * 100}%` }}
                    title={`Resolved: ${item.resolved}`}
                  ></div>
                </div>
                <span className={styles.chartLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Performance Metrics</h2>
          <div className={styles.metricsList}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Resolution Rate</span>
              <span className={styles.metricValue}>74.3%</span>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.success}`} style={{ width: '74.3%' }}></div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Avg. Resolution Time</span>
              <span className={styles.metricValue}>48 hours</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Citizen Satisfaction</span>
              <span className={styles.metricValue}>4.2/5.0</span>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.success}`} style={{ width: '84%' }}></div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>First Response Time</span>
              <span className={styles.metricValue}>6 hours</span>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.success}`} style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Areas */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Top Reporting Areas</h2>
          <div className={styles.areaList}>
            {[
              { area: 'Downtown District', count: 342, trend: 'up' },
              { area: 'Riverside Ward', count: 287, trend: 'down' },
              { area: 'Industrial Zone', count: 256, trend: 'up' },
              { area: 'Suburban North', count: 198, trend: 'stable' },
              { area: 'Market Square', count: 167, trend: 'down' },
            ].map((item, index) => (
              <div key={index} className={styles.areaItem}>
                <span className={styles.areaRank}>{index + 1}</span>
                <div className={styles.areaInfo}>
                  <span className={styles.areaName}>{item.area}</span>
                  <span className={styles.areaCount}>{item.count} issues</span>
                </div>
                <span className={`${styles.areaTrend} ${styles[item.trend]}`}>
                  {item.trend === 'up' && '↑'}
                  {item.trend === 'down' && '↓'}
                  {item.trend === 'stable' && '→'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
