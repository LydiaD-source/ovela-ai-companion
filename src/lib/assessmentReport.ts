/**
 * Client-side PDF generator for Isabella's wellness assessments.
 * Reports are generated in-session only — nothing is persisted.
 *
 * Two report types:
 *   - nutrition_assessment
 *   - recovery_resilience  (Executive Recovery & Resilience Assessment)
 *
 * Legacy alias: 'biological_age' is still accepted on inbound payloads.
 *
 * Footer disclaimer is always included.
 */

import jsPDF from 'jspdf';

const FOOTER_DISCLAIMER =
  'This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.';

export interface AssessmentReport {
  type: 'nutrition_assessment' | 'recovery_resilience';
  title?: string;
  data: any;
}

export function isMeaningfulAssessmentReport(report: AssessmentReport | null | undefined): report is AssessmentReport {
  if (!report?.data || typeof report.data !== 'object') return false;
  const data = report.data;

  if (report.type === 'nutrition_assessment') {
    const targets = data.targets || {};
    return Boolean(
      (typeof targets.daily_calories === 'number' && targets.daily_calories > 500) ||
      (typeof targets.protein_g?.low_g === 'number' && targets.protein_g.low_g > 20) ||
      (typeof data.muscle_preservation?.recommended_protein_g === 'number' && data.muscle_preservation.recommended_protein_g > 20)
    );
  }

  const scores = data.scores || {};
  return Boolean(
    (typeof scores.executive_wellness === 'number' && scores.executive_wellness > 0) ||
    (typeof scores.recovery_capacity === 'number' && scores.recovery_capacity > 0) ||
    typeof scores.burnout_risk === 'string'
  );
}

function normalizeAssessmentReportPayload(parsed: any): AssessmentReport | null {
  if (!parsed || typeof parsed !== 'object') return null;

  const explicitType = parsed.type === 'biological_age' ? 'recovery_resilience' : parsed.type;
  if ((explicitType === 'nutrition_assessment' || explicitType === 'recovery_resilience') && parsed.data) {
    const report = { ...parsed, type: explicitType } as AssessmentReport;
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.nutrition_assessment_response) {
    const report: AssessmentReport = {
      type: 'nutrition_assessment',
      title: 'Executive Nutrition & Muscle Preservation Assessment',
      data: parsed.nutrition_assessment_response,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  const recoveryPayload = parsed.recovery_resilience_response || parsed.recovery_resilience_assessment_response || parsed.biological_age_response;
  if (recoveryPayload) {
    const report: AssessmentReport = {
      type: 'recovery_resilience',
      title: 'Executive Recovery & Resilience Assessment',
      data: recoveryPayload,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.muscle_preservation || parsed.protein_strategy || parsed.daily_meal_framework) {
    const report: AssessmentReport = {
      type: 'nutrition_assessment',
      title: 'Executive Nutrition & Muscle Preservation Assessment',
      data: parsed,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.scores?.burnout_risk || parsed.recovery_capacity || parsed.executive_wellness || parsed.resilience) {
    const report: AssessmentReport = {
      type: 'recovery_resilience',
      title: 'Executive Recovery & Resilience Assessment',
      data: parsed,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  return null;
}

// Try to parse a fenced ```assessment-report ... ``` block.
// Returns the report and the cleaned message (block removed) so chat UI stays clean.
export function extractAssessmentReport(text: string): {
  report: AssessmentReport | null;
  cleaned: string;
} {
  if (!text) return { report: null, cleaned: text };
  const re = /`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i;
  const m = text.match(re);
  if (!m) return { report: null, cleaned: text };
  try {
    const parsed = JSON.parse(m[1].trim().replace(/^json\s*/i, ''));
    const report = normalizeAssessmentReportPayload(parsed);
    if (report) {
      return {
        report,
        cleaned: text.replace(re, '').trim(),
      };
    }
  } catch {
    // fall through
  }
  // If Isabella emitted a malformed assessment-report block, never show the
  // raw JSON/code payload in chat. The backend now also sends a structured
  // assessment_report field, which the UI can use as the download source.
  return { report: null, cleaned: text.replace(re, '').trim() };
}

// ── PDF builder ─────────────────────────────────────────────────────────
const GOLD = '#c9a84c';
const NAVY = '#0d1b2a';
const INK = '#1a1a1a';
const MUTED = '#666666';

// jsPDF's built-in Helvetica uses WinAnsi encoding and cannot render most
// Unicode glyphs (emoji, ≤ ≥ – — · ✓ ✗ ☐ ⚡ €, curly quotes, etc.).
// When it encounters one, the output is corrupted ("&¡ F a s t e s t w i n").
// We sanitize ALL text passed to the document before it reaches the encoder.
const UNICODE_MAP: Record<string, string> = {
  '⚡': '*', '★': '*', '✦': '*', '✱': '*',
  '✓': '+', '✔': '+',
  '✗': 'x', '✘': 'x', '×': 'x', '✕': 'x',
  '☐': '[ ]', '☑': '[x]', '☒': '[x]',
  '≤': '<=', '≥': '>=', '≠': '!=', '≈': '~',
  '–': '-', '—': '-', '−': '-',
  '·': '-', '•': '-', '●': '-', '◦': '-', '▪': '-', '■': '-',
  '€': 'EUR', '£': 'GBP', '¥': 'JPY',
  '°': ' deg',
  '“': '"', '”': '"', '„': '"', '«': '"', '»': '"',
  '‘': "'", '’': "'", '‚': "'",
  '…': '...',
  '\u00a0': ' ', '\u2009': ' ', '\u202f': ' ', '\u200b': '',
};
function sanitize(text: string): string {
  if (!text) return text;
  let out = '';
  for (const ch of text) {
    if (ch in UNICODE_MAP) out += UNICODE_MAP[ch];
    else if (ch.charCodeAt(0) < 256) out += ch;
    else out += '?'; // any other non-WinAnsi char → safe placeholder
  }
  return out;
}

function header(doc: jsPDF, title: string) {
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 595, 70, 'F');
  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OVELA INTERACTIVE  ·  ISABELLA', 40, 28);
  doc.setTextColor('#ffffff');
  doc.setFontSize(18);
  doc.text(title, 40, 52);
}

function footer(doc: jsPDF, pageNo: number, pages: number) {
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  doc.line(40, h - 70, 555, h - 70);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  const wrapped = doc.splitTextToSize(FOOTER_DISCLAIMER, 515);
  doc.text(wrapped, 40, h - 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated by Isabella · ovelainteractive.com  ·  page ${pageNo} of ${pages}`, 40, h - 20);
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(NAVY);
  doc.text(text, 40, y);
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(40, y + 4, 90, y + 4);
  return y + 22;
}

function paragraph(doc: jsPDF, text: string, y: number, opts: { size?: number; color?: string } = {}) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(opts.size ?? 10);
  doc.setTextColor(opts.color ?? INK);
  const lines = doc.splitTextToSize(text, 515);
  doc.text(lines, 40, y);
  return y + lines.length * (opts.size ?? 10) * 1.4;
}

function scoreRow(doc: jsPDF, label: string, score: number, y: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(INK);
  doc.text(label, 40, y);
  // bar
  const barX = 240, barW = 240, barH = 8;
  doc.setFillColor('#eeeeee');
  doc.rect(barX, y - 7, barW, barH, 'F');
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const fillColor = score >= 75 ? '#2d8a5e' : score >= 55 ? GOLD : '#c2553a';
  doc.setFillColor(fillColor);
  doc.rect(barX, y - 7, barW * pct, barH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}/100`, 500, y);
  return y + 18;
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 90) {
    doc.addPage();
    return 100;
  }
  return y;
}

// ── Nutrition report (clean sequential numbering) ───────────────────────
function buildNutrition(doc: jsPDF, data: any) {
  header(doc, 'Executive Nutrition & Muscle Preservation Assessment');
  let y = 110;
  const s = data.scores || {};

  // 1. Executive summary
  if (data.executive_summary) {
    y = sectionTitle(doc, '1 · Executive summary', y);
    y = paragraph(doc, data.executive_summary, y);
    y += 8;
  }

  // 2. Executive Readiness Score (headline)
  const er = data.executive_readiness;
  if (er) {
    y = ensureSpace(doc, y, 140);
    y = sectionTitle(doc, '2 · Executive Readiness Score', y);
    // Big number block
    doc.setFillColor('#f7f3e6');
    doc.rect(40, y - 12, 515, 70, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(NAVY);
    doc.text(`${er.score} / 100`, 56, y + 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(GOLD);
    doc.text(er.level, 260, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(`Measures: ${(er.measures || []).join(' · ')}`, 260, y + 30);
    doc.text('Scale:', 260, y + 44);
    (er.scale || []).slice(0, 4).forEach((line: string, i: number) => {
      doc.text(`• ${line}`, 300, y + 44 + (i + 1) * 10);
    });
    y += 90;
  }

  // 3. Headline scores (Nutrition / Recovery / Muscle)
  y = ensureSpace(doc, y, 110);
  y = sectionTitle(doc, '3 · Headline scores', y);
  y = scoreRow(doc, 'Nutrition quality', s.overall_nutrition ?? 0, y);
  y = scoreRow(doc, 'Executive recovery capacity', s.recovery_capacity ?? 0, y);
  y = scoreRow(doc, 'Muscle preservation', s.muscle_preservation ?? 0, y);
  y += 10;

  // 4. Executive Benchmark (peer comparison)
  const eb = data.executive_benchmark;
  if (eb) {
    y = ensureSpace(doc, y, 200);
    y = sectionTitle(doc, '4 · Executive benchmark', y);
    y = paragraph(doc, `Compared with ${eb.cohort}:`, y, { color: MUTED, size: 9 });
    y += 4;
    // Column headers
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
    doc.text('Metric', 40, y);
    doc.text('Current', 200, y);
    doc.text('Recommended', 330, y);
    doc.text('Position', 470, y);
    y += 6;
    doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 8;
    (eb.items || []).forEach((it: any) => {
      y = ensureSpace(doc, y, 22);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
      doc.text(String(it.metric), 40, y);
      doc.text(String(it.current), 200, y);
      doc.text(String(it.recommended), 330, y);
      const top = String(it.position).startsWith('Top');
      const bot = String(it.position).startsWith('Bottom');
      doc.setTextColor(top ? '#2d8a5e' : bot ? '#c2553a' : MUTED);
      doc.setFont('helvetica', 'bold');
      doc.text(String(it.position), 470, y);
      y += 14;
    });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(`Overall readiness ${eb.overall_readiness}/100 — ${eb.overall_position}`, 40, y);
    y += 14;
    y = paragraph(doc, eb.note, y, { color: MUTED, size: 8 });
    y += 6;
  }


  // Nutrition snapshot (sub of executive view, no number)
  y = ensureSpace(doc, y, 180);
  y = sectionTitle(doc, 'Nutrition snapshot', y);
  y = scoreRow(doc, 'Protein', s.protein ?? 0, y);
  y = scoreRow(doc, 'Carbohydrate quality', s.carbs ?? 0, y);
  y = scoreRow(doc, 'Fat quality', s.fat ?? 0, y);
  y = scoreRow(doc, 'Hydration', s.hydration ?? 0, y);
  y = scoreRow(doc, 'Recovery support', s.recovery_support ?? 0, y);
  y += 10;

  // Why these scores (transparency)
  const drivers = data.score_drivers;
  if (drivers && (drivers.hydration || drivers.carbs || drivers.recovery_support)) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, 'Why these scores', y);
    const blocks: Array<[string, any]> = [
      ['Hydration', drivers.hydration],
      ['Carbohydrate quality', drivers.carbs],
      ['Recovery support', drivers.recovery_support],
    ];
    for (const [label, blk] of blocks) {
      if (!blk) continue;
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(label, 40, y); y += 14;
      (blk.positives || []).forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `+ ${p}`, y, { color: '#2d8a5e', size: 9 }); });
      (blk.limiting || []).forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `- ${p}`, y, { color: '#c2553a', size: 9 }); });
      y += 4;
    }
  }

  // Targets + calculation basis (sub, no number)
  y = ensureSpace(doc, y, 160);
  y = sectionTitle(doc, 'Your daily targets', y);
  const t = data.targets || {};
  const cb = data.calculation_basis;
  if (cb?.note) {
    y = paragraph(doc, cb.note, y, { color: MUTED, size: 9 });
    y += 4;
  }
  y = paragraph(doc,
    `Calories: ~${t.daily_calories ?? '—'} kcal${t.maintenance_calories && t.maintenance_calories !== t.daily_calories ? `  (maintenance ~${t.maintenance_calories} kcal)` : ''}\n` +
    `Protein: ${t.protein_g?.low_g ?? '—'}–${t.protein_g?.high_g ?? '—'} g\n` +
    `Carbohydrates: ${t.carbs_g?.low_g ?? '—'}–${t.carbs_g?.high_g ?? '—'} g\n` +
    `Fat: ${t.fat_g?.low_g ?? '—'}–${t.fat_g?.high_g ?? '—'} g\n` +
    `Hydration: ~${t.hydration_l ?? '—'} L`, y);
  y += 6;

  // Weekly protein gap callout
  if (data.gaps?.weekly_protein_g > 0) {
    y = ensureSpace(doc, y, 50);
    doc.setFillColor('#fff8e1');
    doc.rect(40, y - 12, 515, 36, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    doc.text(`Weekly protein gap: ${data.gaps.weekly_protein_g} g`, 50, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(`That is roughly ${data.gaps.protein_g} g/day × 7 — closing it is your fastest body-composition lever.`, 50, y + 16);
    y += 32;
  }

  // Fastest win (sub, no number)
  if (data.fastest_win) {
    y = ensureSpace(doc, y, 110);
    y = sectionTitle(doc, '⚡ Fastest win', y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(NAVY);
    doc.text(data.fastest_win.title, 40, y); y += 16;
    y = paragraph(doc, data.fastest_win.action, y);
    if ((data.fastest_win.expected_benefits || []).length) {
      y = paragraph(doc, `Expected benefits: ${data.fastest_win.expected_benefits.join(', ')}.`, y, { color: MUTED, size: 9 });
    }
    if (data.fastest_win.closes_pct_of_weekly_gap > 0) {
      y = paragraph(doc, `This single change closes approximately ${data.fastest_win.closes_pct_of_weekly_gap}% of your weekly protein gap.`, y, { color: MUTED, size: 9 });
    }
    y += 8;
  }

  // 3. Muscle preservation & performance capacity
  const mp = data.muscle_preservation;
  if (mp) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, '5 · Muscle preservation & performance capacity', y);
    y = paragraph(doc,
      `Current protein: ${mp.current_protein_g ?? '—'} g/day\n` +
      `Recommended protein: ${mp.recommended_protein_g ?? '—'} g/day\n` +
      `Status: ${mp.status}`, y);
    y += 4;
    y = scoreRow(doc, 'Muscle preservation score', mp.score ?? 0, y);
    if ((mp.reasons || []).length) {
      y += 4;
      y = paragraph(doc, 'Why this score:', y);
      mp.reasons.forEach((r: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `• ${r}`, y, { color: MUTED, size: 9 }); });
    }
    if (mp.note) { y += 4; y = paragraph(doc, mp.note, y, { color: MUTED, size: 9 }); }
    y += 6;
  }

  // 4. Nutrition strategy
  const ps = data.protein_strategy;
  if (ps) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, `6 · High-performance nutrition strategy (${ps.diet_type})`, y);
    y = paragraph(doc, 'Best protein sources:', y);
    (ps.best_sources || []).forEach((src: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `• ${src}`, y); });
    y += 4;
    if (ps.distribution) {
      y = paragraph(doc, `Distribution status: ${ps.distribution.status}`, y, { color: MUTED, size: 9 });
      if (ps.distribution.score != null) {
        y += 2;
        y = scoreRow(doc, 'Protein distribution score', ps.distribution.score, y);
      }
      if (ps.distribution.meals) {
        ps.distribution.meals.forEach((m: any) => {
          y = ensureSpace(doc, y, 14);
          y = paragraph(doc, `   ${m.meal}: ${m.protein_g ?? '—'} g  (target 30–40 g per main meal)`, y, { color: MUTED, size: 9 });
        });
      }
      y += 4;
    }
    if ((ps.thirty_gram_options || []).length) {
      y = ensureSpace(doc, y, 80);
      y = paragraph(doc, 'To add 30 g of protein — choose ONE:', y);
      ps.thirty_gram_options.forEach((opt: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `✓ ${opt}`, y); });
      y += 4;
    }
    if (ps.vegetarian_alternatives) {
      y = ensureSpace(doc, y, 60);
      y = paragraph(doc, 'Vegetarian alternatives:', y, { color: MUTED, size: 9 });
      y = paragraph(doc, ps.vegetarian_alternatives.join(', '), y, { color: MUTED, size: 9 });
      y += 6;
    }
  }

  // 5. Daily meal framework
  const mf = data.daily_meal_framework;
  if (mf) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, `7 · Daily meal framework (~${mf.total_protein_g} g protein)`, y);
    (mf.meals || []).forEach((m: any) => {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY);
      doc.text(`${m.meal} — ${m.protein_g} g protein`, 40, y);
      y += 14;
      y = paragraph(doc, m.example, y, { color: MUTED });
      y += 4;
    });
  }

  // 6. Recovery & metabolic efficiency
  const ms = data.metabolic_support;
  if (ms) {
    y = ensureSpace(doc, y, 100);
    y = sectionTitle(doc, '8 · Recovery & metabolic efficiency', y);
    y = scoreRow(doc, 'Metabolic support score', ms.score ?? 0, y);
    if ((ms.biggest_opportunities || []).length) {
      y += 4;
      y = paragraph(doc, 'Biggest opportunities:', y);
      ms.biggest_opportunities.forEach((o: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `• ${o}`, y);
      });
    }
    y += 6;
  }

  // 7. Resistance training
  const rt = data.resistance_training;
  if (rt) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, '9 · Resistance training recommendation', y);
    y = paragraph(doc,
      `Age: ${rt.age}    Goal: ${rt.goal}\n` +
      `• ${rt.strength_sessions_per_week} resistance sessions per week\n` +
      `• ${rt.cardio_sessions_per_week} cardio sessions per week\n` +
      `• ${rt.mobility_minutes_per_day} minutes of daily mobility work`, y);
    if (rt.reason) { y += 4; y = paragraph(doc, rt.reason, y, { color: MUTED, size: 9 }); }
    y += 6;
  }

  // 8. Recovery & lifestyle factors (alcohol, coffee, walking) + biological age impact
  const lf = data.lifestyle_factors;
  const bai = data.biological_age_impact;
  if ((lf && (lf.alcohol || lf.coffee || lf.walking)) || bai) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, '10 · Recovery & lifestyle factors', y);
    if (lf?.alcohol) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Alcohol — ${lf.alcohol.units_per_week} unit${lf.alcohol.units_per_week === 1 ? '' : 's'}/week`, 40, y);
      y += 14;
      y = paragraph(doc, lf.alcohol.status, y, { color: MUTED });
      y += 4;
    }
    if (lf?.coffee) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Coffee — ${lf.coffee.cups_per_day} cup${lf.coffee.cups_per_day === 1 ? '' : 's'}/day`, 40, y);
      y += 14;
      y = paragraph(doc, lf.coffee.status, y, { color: MUTED });
      y += 4;
    }
    if (lf?.walking) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Walking — ${lf.walking.minutes_per_day} min/day`, 40, y);
      y += 14;
      y = paragraph(doc, lf.walking.status, y, { color: MUTED });
      y += 6;
    }
    if (bai) {
      if ((bai.positive || []).length) {
        y = ensureSpace(doc, y, 40);
        y = paragraph(doc, 'Positive contributors:', y);
        bai.positive.forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `✓ ${p}`, y); });
        y += 4;
      }
      if ((bai.needs_improvement || []).length) {
        y = ensureSpace(doc, y, 40);
        y = paragraph(doc, 'Needs improvement:', y);
        bai.needs_improvement.forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `⚠ ${p}`, y); });
        y += 4;
      }
    }
  }

  // 9. Expected progress
  const proj = data.weight_loss_projection;
  if (proj) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, '11 · Expected progress', y);
    y = paragraph(doc, proj.assumes, y, { color: MUTED, size: 9 });
    y += 4;
    y = paragraph(doc,
      `• Improved satiety within ${proj.satiety_within_days} days\n` +
      `• Visible body composition changes within ${proj.visible_change_weeks} weeks\n` +
      `• Potential weight reduction of ${proj.weekly_kg_low}–${proj.weekly_kg_high} kg per week (≈ ${proj.monthly_kg_low}–${proj.monthly_kg_high} kg per month)`, y);
    y += 4;
    y = paragraph(doc, proj.note, y, { color: MUTED, size: 9 });
    y += 6;
  }

  // 10. Executive performance impact
  const epi = data.executive_performance_impact;
  if (epi) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, '12 · Executive performance impact', y);
    if ((epi.current_likely_influences || []).length) {
      y = paragraph(doc, 'Your current nutrition likely influences:', y);
      epi.current_likely_influences.forEach((p: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `- ${p}`, y);
      });
      y += 4;
    }
    if (epi.strongest_immediate_opportunity) {
      const op = epi.strongest_immediate_opportunity;
      y = ensureSpace(doc, y, 70);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text('Strongest immediate opportunity', 40, y); y += 14;
      y = paragraph(doc, op.title, y);
      if (op.action) y = paragraph(doc, op.action, y, { color: MUTED, size: 9 });
      if ((op.expected_effects || []).length) {
        y = paragraph(doc, `Expected effects: ${op.expected_effects.join(', ')}.`, y, { color: MUTED, size: 9 });
      }
      y += 6;
    }
  }

  // 11. Long-term outlook
  const lto = data.long_term_outlook;
  if (lto) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, '13 · Long-term outlook', y);
    y = paragraph(doc, 'Current trajectory:', y);
    y = paragraph(doc, `• Muscle preservation risk: ${lto.muscle_preservation_risk}`, y);
    y = paragraph(doc, `• Recovery capacity: ${lto.recovery_capacity}`, y);
    y = paragraph(doc, `• Fat-loss potential: ${lto.fat_loss_potential}`, y);
    y = paragraph(doc, `• Longevity support: ${lto.longevity_support}`, y);
    y += 4;
    if (lto.most_impactful_improvement) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text('Most impactful improvement:', 40, y); y += 14;
      y = paragraph(doc, lto.most_impactful_improvement, y, { color: MUTED });
    }
    y += 6;
  }

  // 12. Three highest-impact improvements
  if ((data.improvement_priorities || []).length) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, '14 · Three highest-impact improvements', y);
    data.improvement_priorities.forEach((p: any, i: number) => {
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY);
      doc.text(`${i + 1}. ${p.title}`, 40, y);
      y += 14;
      y = paragraph(doc, p.detail, y, { color: MUTED });
      y += 4;
    });
  }

  // 13. Isabella's weekly action plan (+ 7-day plan)
  const wap = data.weekly_action_plan;
  if (wap) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, "15 · Isabella's weekly action plan", y);
    y = paragraph(doc, 'Your priority focus this week:', y);
    (wap.priorities || []).forEach((p: string) => {
      y = ensureSpace(doc, y, 16);
      y = paragraph(doc, `☐ ${p}`, y);
    });
    y += 6;
    y = paragraph(doc, 'Expected benefits:', y);
    (wap.expected_benefits || []).forEach((b: string) => {
      y = ensureSpace(doc, y, 14);
      y = paragraph(doc, `• ${b}`, y);
    });
    y += 4;
  }

  if ((data.seven_day_plan || []).length) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, '7-day upgrade plan', y);
    data.seven_day_plan.forEach((line: string) => {
      y = ensureSpace(doc, y, 18);
      y = paragraph(doc, `• ${line}`, y);
    });
  }
}


// ── Executive Recovery & Resilience report ──────────────────────────────
function buildRecoveryResilience(doc: jsPDF, data: any) {
  header(doc, 'Executive Recovery & Resilience Assessment');
  let y = 110;

  const sc = data.scores || {};

  // 1. Executive summary
  if (data.executive_summary) {
    y = sectionTitle(doc, '1 · Executive summary', y);
    y = paragraph(doc, data.executive_summary, y);
    y += 8;
  }

  // 2. Headline scores
  y = ensureSpace(doc, y, 180);
  y = sectionTitle(doc, '2 · Your scores', y);
  y = scoreRow(doc, 'Recovery capacity', sc.recovery_capacity ?? 0, y);
  y = scoreRow(doc, 'Stress load (higher = heavier)', sc.stress_load ?? 0, y);
  y = scoreRow(doc, 'Resilience', sc.resilience ?? 0, y);
  y = scoreRow(doc, 'Lifestyle recovery', sc.lifestyle_recovery ?? 0, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.text('Burnout risk indicator:', 40, y);
  const riskColor = sc.burnout_risk === 'Elevated' ? '#c2553a' : sc.burnout_risk === 'Moderate' ? GOLD : '#2d8a5e';
  doc.setTextColor(riskColor);
  doc.text(String(sc.burnout_risk ?? '—'), 220, y);
  doc.setTextColor(INK);
  y += 18;
  y = scoreRow(doc, 'OVERALL EXECUTIVE WELLNESS', sc.executive_wellness ?? 0, y);
  y += 10;

  // 3. Burnout note (never a diagnosis)
  if (data.burnout_note) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, '3 · Burnout risk indicators', y);
    y = paragraph(doc, data.burnout_note, y, { color: MUTED });
    y += 6;
  }

  // 4. Executive performance factors
  const fb = data.factor_breakdown || {};
  const factors: Array<[string, number | undefined]> = [
    ['Sleep duration', fb.sleep_duration],
    ['Sleep quality', fb.sleep_quality],
    ['Movement', fb.movement],
    ['Exercise quality', fb.exercise_quality],
    ['Recovery days', fb.recovery_days],
    ['Outdoor exposure', fb.outdoor_exposure],
    ['Workload intensity', fb.workload_intensity],
    ['Meeting & travel load', fb.meeting_travel_load],
    ['Stress regulation', fb.stress_regulation],
    ['Social support', fb.social_support],
    ['Work–life balance', fb.work_life_balance],
    ['Energy level', fb.energy_level],
    ['Motivation level', fb.motivation_level],
    ['Hydration / alcohol / caffeine', fb.hydration_alcohol_caffeine],
  ];
  y = ensureSpace(doc, y, 200);
  y = sectionTitle(doc, '4 · Executive performance factors', y);
  for (const [label, val] of factors) {
    if (typeof val === 'number') {
      y = ensureSpace(doc, y, 24);
      y = scoreRow(doc, label, val, y);
    }
  }
  y += 6;

  // 5. Fastest wins
  if (Array.isArray(data.fastest_wins) && data.fastest_wins.length) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, '5 · Fastest wins', y);
    data.fastest_wins.forEach((w: any, i: number) => {
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY);
      doc.text(`${i + 1}. ${w.area}`, 40, y);
      y += 14;
      y = paragraph(doc, w.action, y, { color: MUTED });
      y += 4;
    });
  }

  // 6. 7-day recovery plan
  if (Array.isArray(data.seven_day_plan) && data.seven_day_plan.length) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, '6 · 7-day recovery plan', y);
    data.seven_day_plan.forEach((d: any) => {
      y = ensureSpace(doc, y, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY);
      doc.text(`${d.day} — ${d.focus}`, 40, y);
      y += 12;
      y = paragraph(doc, d.action, y, { color: MUTED, size: 10 });
      y += 4;
    });
  }

  // 7. Closing recommendation (WellneSpirit funnel — no €19 pitch)
  if (data.closing_recommendation) {
    y = ensureSpace(doc, y, 100);
    y = sectionTitle(doc, '7 · Next step', y);
    y = paragraph(doc, data.closing_recommendation, y);
  }
}

function installSanitizer(doc: jsPDF) {
  const anyDoc = doc as any;
  const origText = anyDoc.text.bind(doc);
  anyDoc.text = (text: any, ...rest: any[]) => {
    if (typeof text === 'string') text = sanitize(text);
    else if (Array.isArray(text)) text = text.map((t: any) => typeof t === 'string' ? sanitize(t) : t);
    return origText(text, ...rest);
  };
  const origSplit = anyDoc.splitTextToSize.bind(doc);
  anyDoc.splitTextToSize = (text: any, width: number, opts?: any) => {
    if (typeof text === 'string') text = sanitize(text);
    return origSplit(text, width, opts);
  };
}

function buildAssessmentDoc(report: AssessmentReport): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  installSanitizer(doc);
  if (report.type === 'nutrition_assessment') buildNutrition(doc, report.data);
  else buildRecoveryResilience(doc, report.data);
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    footer(doc, i, pages);
  }
  return doc;
}

export function assessmentReportFilename(report: AssessmentReport): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return report.type === 'nutrition_assessment'
    ? `isabella-nutrition-assessment-${stamp}.pdf`
    : `isabella-recovery-resilience-${stamp}.pdf`;
}

/** Build the PDF and trigger the download. */
export function downloadAssessmentReport(report: AssessmentReport) {
  const doc = buildAssessmentDoc(report);
  doc.save(assessmentReportFilename(report));
}

/** Build the PDF and return as base64 (without data URL prefix) for emailing. */
export function assessmentReportToBase64(report: AssessmentReport): string {
  const doc = buildAssessmentDoc(report);
  const dataUri = doc.output('datauristring');
  const idx = dataUri.indexOf(',');
  return idx >= 0 ? dataUri.slice(idx + 1) : dataUri;
}

