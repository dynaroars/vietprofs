import { type Roster } from './data.ts';
import { deriveRosterStats, type DerivedRosterStats } from './derived-stats.ts';
import { escapeHtml } from './utils.ts';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function renderHealthPanel(roster: Roster, baseUrl = '/'): string {
  const stats: DerivedRosterStats = deriveRosterStats(roster);

  return `
    <div class="health-panel-dashboard">
      <div class="health-panel-header">
        <div class="health-badge-row">
          <span class="insights-badge">📊 Data Health &amp; Completeness</span>
          <span class="health-records-count">${formatNumber(stats.total)} Total Faculty Records</span>
        </div>
        <h2 class="health-main-heading">Dataset Health &amp; Verification Metrics</h2>
        <p class="health-main-desc">
          VietProfs is an open, evidence-audited repository of Vietnamese and Vietnamese-diaspora university faculty outside Vietnam.
          This panel surfaces aggregate metadata coverage to ensure transparent, reproducible data curation.
        </p>
      </div>

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

      <div class="health-methodology-section">
        <h3>Systematic Maintenance &amp; Anti-Hallucination Standards</h3>
        <div class="health-methodology-grid">
          <div class="methodology-card">
            <h4>Direct Updates &amp; Ground Truth</h4>
            <p>Direct owner updates and community-verified corrections are protected and recorded in sorted field metadata.</p>
          </div>
          <div class="methodology-card">
            <h4>Evidence Ledger &amp; Quotes</h4>
            <p>Every automated addition requires verbatim source quotes recorded in <code>maintenance/evidence.json</code> for cross-agent auditing.</p>
          </div>
          <div class="methodology-card">
            <h4>Local WebP Portrait Archiving</h4>
            <p>Portraits undergo strict aspect-ratio and person-specific validation before lossless WebP conversion in <code>public/portraits/</code>.</p>
          </div>
          <div class="methodology-card">
            <h4>Continuous Verification</h4>
            <p>Validation test suites enforce chronological degree sanity, standard career progressions, and link integrity on every build.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
