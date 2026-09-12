import { type GitInfo, type Roster, type StatsHistoryPoint } from './data.ts';
import { deriveRosterStats, type DerivedRosterStats } from './derived-stats.ts';
import { renderGrowthChart, type GrowthMetricKey } from './insights.ts';
import { escapeHtml, formatRosterDate } from './utils.ts';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function renderHealthPanel(
  roster: Roster,
  baseUrl = '/',
  gitInfo: GitInfo | null = null,
  includeHeader = false,
  statsHistory: StatsHistoryPoint[] = [],
  activeGrowthMetric: GrowthMetricKey = 'count',
): string {
  const stats: DerivedRosterStats = deriveRosterStats(roster);

  return `
    <div class="health-panel-dashboard">
      ${includeHeader ? `
        <div class="health-panel-header">
          <div class="health-badge-row">
            <span class="insights-badge">📊 System Health &amp; Maintenance</span>
            <span class="health-records-count">${formatNumber(stats.total)} Total Faculty Records</span>
          </div>
          <h2 class="health-main-heading">System Health, Verification &amp; Codebase Status</h2>
          <p class="health-main-desc">
            VietProfs is an open, evidence-audited repository of Vietnamese and Vietnamese-diaspora university faculty outside Vietnam.
            This section tracks overall repository hygiene, Git commit activity, and metadata completeness metrics.
          </p>
        </div>
      ` : ''}

      ${gitInfo ? `
        <div class="github-status-card">
          <div class="github-status-header">
            <div class="github-status-title">
              <svg class="github-icon" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span><strong>GitHub Repository Status</strong></span>
            </div>
            <a class="github-repo-link" href="${escapeHtml(gitInfo.repoUrl)}" target="_blank" rel="noopener noreferrer">dynaroars/vietprofs ↗</a>
          </div>
          <div class="github-metrics-grid">
            <div class="github-metric-item">
              <span class="github-metric-label">Total Commits</span>
              <strong class="github-metric-value">${formatNumber(gitInfo.totalCommits)}</strong>
              <span class="github-metric-sub">Branch: <code>${escapeHtml(gitInfo.branch)}</code></span>
            </div>
            <div class="github-metric-item">
              <span class="github-metric-label">Latest Commit</span>
              <strong class="github-metric-value"><code>${escapeHtml(gitInfo.latestHash)}</code></strong>
              <span class="github-metric-sub" title="${escapeHtml(gitInfo.latestMessage)}">${escapeHtml(gitInfo.latestMessage)}</span>
            </div>
            <div class="github-metric-item">
              <span class="github-metric-label">Latest Activity</span>
              <strong class="github-metric-value">${formatRosterDate(gitInfo.latestDate)}</strong>
              <span class="github-metric-sub">System maintenance timestamp</span>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="completeness-grid">
        ${stats.completeness.map((m) => `
          <div class="completeness-card">
            <div class="completeness-header">
              <span class="completeness-label">${escapeHtml(m.label)}</span>
              <strong class="completeness-pct">${m.percentage}%</strong>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${m.percentage}%"></div>
            </div>
            <div class="completeness-meta">
              <span>${formatNumber(m.count)} of ${formatNumber(m.total)} records</span>
              <span class="completeness-desc">${escapeHtml(m.description)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      ${stats.recentUpdatesCount.last30Days > 0 ? `
        <div class="recent-updates-badge">
          <span class="pulse-dot" aria-hidden="true"></span>
          <span><strong>${formatNumber(stats.recentUpdatesCount.last30Days)} profiles</strong> actively updated or verified in the past 30 days (${formatNumber(stats.recentUpdatesCount.last7Days)} this week).</span>
          <a class="recent-updates-link" href="${baseUrl}?sort=recent">Browse recently updated →</a>
        </div>
      ` : ''}

      ${statsHistory && statsHistory.length > 0 ? `
        <div class="health-growth-section" style="margin-top: 0.5rem;">
          <div class="insights-category-header" style="margin-bottom: 0.5rem;">
            <h3 class="insights-category-title">Project &amp; Archive Growth History</h3>
          </div>
          ${renderGrowthChart(statsHistory, activeGrowthMetric)}
        </div>
      ` : ''}
    </div>
  `;
}
