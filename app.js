/**
 * 513 比武大会 · RUNA 天津销售竞技榜
 * app.js — UI logic
 */

'use strict';

// ── Countdown timer ───────────────────────────────────────────────────────────
function updateCountdown() {
  const target = new Date(EVENT.date + 'T08:00:00');   // competition start 08:00
  const now    = new Date();
  const diff   = target - now;

  const el = id => document.getElementById(id);

  if (diff <= 0) {
    document.getElementById('countdown-wrapper').innerHTML =
      '<span style="color:var(--gold);font-size:1.3rem;font-weight:700">🎉 赛事进行中！</span>';
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  el('days').textContent    = String(days).padStart(2, '0');
  el('hours').textContent   = String(hours).padStart(2, '0');
  el('minutes').textContent = String(minutes).padStart(2, '0');
  el('seconds').textContent = String(seconds).padStart(2, '0');
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function renderStats() {
  document.getElementById('total-participants').textContent = STATS.totalParticipants;
  document.getElementById('total-revenue').textContent      = STATS.totalRevenue;
  document.getElementById('avg-completion').textContent     = STATS.avgCompletion;
  document.getElementById('teams-count').textContent        = STATS.teamsCount;
}

// ── Rank badge helper ──────────────────────────────────────────────────────────
function rankBadge(rank) {
  const cls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
  return `<span class="rank-badge ${cls}">${rank}</span>`;
}

// ── Progress bar helper ────────────────────────────────────────────────────────
function progressBar(rate) {
  const pct     = Math.min(rate * 100, 150);          // cap display at 150 %
  const cls     = rate >= 1 ? 'over-target' : '';
  const label   = (rate * 100).toFixed(1) + '%';
  return `
    <div class="progress-wrap">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill ${cls}" style="width:${Math.min(pct/150*100,100)}%"></div>
      </div>
      <span>${label}</span>
    </div>`;
}

// ── Status pill helper ─────────────────────────────────────────────────────────
function statusPill(rank, rate) {
  if (rank === 1)       return '<span class="status-pill leader">领跑</span>';
  if (rate >= 1.15)     return '<span class="status-pill hot">超额</span>';
  if (rate >= 1.0)      return '<span class="status-pill ontrack">达标</span>';
  return '<span class="status-pill climbing">追赶中</span>';
}

// ── Podium (top 3) ────────────────────────────────────────────────────────────
function renderPodium() {
  const crowns  = ['👑', '🥈', '🥉'];
  const rankStr = ['冠军', '亚军', '季军'];

  const html = INDIVIDUAL_RESULTS.slice(0, 3).map((c, i) => `
    <div class="podium-card rank-${i + 1}">
      <span class="podium-crown">${crowns[i]}</span>
      <div class="podium-rank">${rankStr[i]}</div>
      <div class="podium-name">${c.name}</div>
      <div class="podium-team">${c.team.name}</div>
      <div class="podium-score">${c.score}</div>
      <div class="podium-score-label">积分</div>
    </div>
  `).join('');

  document.getElementById('podium').innerHTML = html;
}

// ── Individual leaderboard ────────────────────────────────────────────────────
function renderIndividualTable() {
  const rows = INDIVIDUAL_RESULTS.map(c => `
    <tr class="${c.rank <= 3 ? 'top-3' : ''}">
      <td>${rankBadge(c.rank)}</td>
      <td>${c.name}</td>
      <td>${c.team.name}</td>
      <td>${c.revenue.toFixed(1)}</td>
      <td>${progressBar(c.completionRate)}</td>
      <td>${c.newClients}</td>
      <td style="font-weight:700;color:var(--gold)">${c.score}</td>
      <td>${statusPill(c.rank, c.completionRate)}</td>
    </tr>
  `).join('');

  document.getElementById('individual-tbody').innerHTML = rows;
}

// ── Team leaderboard ──────────────────────────────────────────────────────────
function renderTeamTable() {
  const rows = TEAM_RESULTS.map(t => `
    <tr class="${t.rank <= 3 ? 'top-3' : ''}">
      <td>${rankBadge(t.rank)}</td>
      <td>${t.name}</td>
      <td>${t.captain}</td>
      <td>${t.totalRevenue.toFixed(1)}</td>
      <td>${progressBar(t.avgCompletion)}</td>
      <td style="font-weight:700;color:var(--gold)">${t.teamScore}</td>
      <td>${statusPill(t.rank, t.avgCompletion)}</td>
    </tr>
  `).join('');

  document.getElementById('team-tbody').innerHTML = rows;
}

// ── Tab navigation ────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ── Auto-refresh (simulated) ──────────────────────────────────────────────────
function scheduleRefresh() {
  // In production this would re-fetch from the CRM API.
  // Here we simply reload the page every N seconds defined in EVENT.refreshSecs.
  setTimeout(() => window.location.reload(), EVENT.refreshSecs * 1000);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(function init() {
  renderStats();
  renderPodium();
  renderIndividualTable();
  renderTeamTable();
  initTabs();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  scheduleRefresh();
})();
