/**
 * 513 比武大会 · RUNA 天津销售竞技榜
 * data.js — Competition data
 *
 * In production this would be fetched from the CRM API.
 * For the competition day display, static seed data is used.
 */

'use strict';

// ── Event meta ───────────────────────────────────────────────────────────────
const EVENT = {
  name:        '513 比武大会',
  date:        '2026-05-13',           // competition date (YYYY-MM-DD)
  awardTime:   '2026-05-13T19:30:00',  // ISO local time of awards ceremony
  region:      '天津大区',
  organizer:   'RUNA 销售管理部',
  dataSource:  'CRM 系统',
  refreshSecs: 300,                    // 5-minute auto-refresh
};

// ── Teams ─────────────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 'T1', name: '飞鹰战队', captain: '赵磊' },
  { id: 'T2', name: '逐鹿战队', captain: '李梅' },
  { id: 'T3', name: '破浪战队', captain: '王志强' },
  { id: 'T4', name: '腾龙战队', captain: '陈晓燕' },
];

// ── Individual competitors ────────────────────────────────────────────────────
// Fields: id, name, teamId, revenue (万元), target (万元), newClients, rating (1-5)
const COMPETITORS = [
  { id: 'C01', name: '赵磊',   teamId: 'T1', revenue: 186.4, target: 150, newClients: 7, rating: 4.8 },
  { id: 'C02', name: '刘欣',   teamId: 'T2', revenue: 174.2, target: 160, newClients: 5, rating: 4.6 },
  { id: 'C03', name: '孙浩',   teamId: 'T3', revenue: 162.0, target: 140, newClients: 6, rating: 4.7 },
  { id: 'C04', name: '李梅',   teamId: 'T2', revenue: 155.8, target: 150, newClients: 4, rating: 4.5 },
  { id: 'C05', name: '王志强', teamId: 'T3', revenue: 148.5, target: 145, newClients: 3, rating: 4.4 },
  { id: 'C06', name: '陈晓燕', teamId: 'T4', revenue: 141.0, target: 130, newClients: 5, rating: 4.6 },
  { id: 'C07', name: '张伟',   teamId: 'T1', revenue: 138.7, target: 140, newClients: 2, rating: 4.3 },
  { id: 'C08', name: '林静',   teamId: 'T4', revenue: 132.3, target: 120, newClients: 4, rating: 4.5 },
  { id: 'C09', name: '周明',   teamId: 'T1', revenue: 127.6, target: 130, newClients: 3, rating: 4.2 },
  { id: 'C10', name: '吴婷',   teamId: 'T2', revenue: 125.1, target: 120, newClients: 2, rating: 4.3 },
  { id: 'C11', name: '郑凯',   teamId: 'T3', revenue: 119.8, target: 115, newClients: 3, rating: 4.4 },
  { id: 'C12', name: '徐丽',   teamId: 'T4', revenue: 115.2, target: 120, newClients: 1, rating: 4.1 },
  { id: 'C13', name: '黄涛',   teamId: 'T1', revenue: 110.4, target: 110, newClients: 2, rating: 4.2 },
  { id: 'C14', name: '马雪',   teamId: 'T2', revenue: 108.9, target: 115, newClients: 1, rating: 4.0 },
  { id: 'C15', name: '曹阳',   teamId: 'T4', revenue:  98.5, target: 100, newClients: 2, rating: 4.3 },
];

// ── Scoring formula ───────────────────────────────────────────────────────────
/**
 * Calculates individual competition score.
 * @param {Object} c  Competitor record
 * @returns {number}  Total score (integer)
 */
function calcScore(c) {
  const completionRate = c.revenue / c.target;
  let score = 0;

  // Base: 100 pts for ≥100 % target, proportional otherwise
  if (completionRate >= 1) {
    score += 100;
    // Bonus: +15 pts per 10 % over target
    score += Math.floor((completionRate - 1) / 0.1) * 15;
  } else {
    score += Math.round(completionRate * 100);
  }

  // New clients: +20 pts each
  score += c.newClients * 20;

  // Customer satisfaction ≥ 4.5: +10 pts
  if (c.rating >= 4.5) score += 10;

  return score;
}

// ── Derived data ──────────────────────────────────────────────────────────────

/** Ranked individual results */
const INDIVIDUAL_RESULTS = COMPETITORS
  .map(c => ({
    ...c,
    completionRate: c.revenue / c.target,
    score: calcScore(c),
    team: TEAMS.find(t => t.id === c.teamId),
  }))
  .sort((a, b) => b.score - a.score)
  .map((c, idx) => ({ ...c, rank: idx + 1 }));

/** Ranked team results */
const TEAM_RESULTS = TEAMS.map(team => {
  const members = INDIVIDUAL_RESULTS.filter(c => c.teamId === team.id);
  const totalRevenue    = members.reduce((s, c) => s + c.revenue, 0);
  const avgCompletion   = members.reduce((s, c) => s + c.completionRate, 0) / members.length;
  const teamScore       = members.reduce((s, c) => s + c.score, 0);
  return { ...team, members, totalRevenue, avgCompletion, teamScore };
})
  .sort((a, b) => b.teamScore - a.teamScore)
  .map((t, idx) => ({ ...t, rank: idx + 1 }));

/** Summary statistics */
const STATS = {
  totalParticipants: COMPETITORS.length,
  totalRevenue:      COMPETITORS.reduce((s, c) => s + c.revenue, 0).toFixed(1),
  avgCompletion:     (
    COMPETITORS.reduce((s, c) => s + c.revenue / c.target, 0) / COMPETITORS.length * 100
  ).toFixed(1) + '%',
  teamsCount: TEAMS.length,
};
