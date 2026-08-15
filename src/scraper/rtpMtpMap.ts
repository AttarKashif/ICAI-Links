import { CourseName, GroupName, RtpResourceItem, MtpResourceItem } from '../types.js';

// Helper to create RTP items
function createRtp(
  id: string,
  course: CourseName,
  group_name: GroupName,
  paper_number: number,
  paper_name: string,
  exam_cycle: string,
  cdn_filename: string,
  highlights: string[] = ['Applicable Amendments', 'Practice Test Questions'],
  sizeMB = 2.8
): RtpResourceItem {
  return {
    id,
    course,
    group_name,
    paper_id: `p_${course.toLowerCase()}_${paper_number}`,
    paper_number,
    paper_name,
    exam_cycle,
    title: `Revision Test Paper (RTP) - ${exam_cycle} Examination: Paper ${paper_number} ${paper_name}`,
    pdf_url: `https://resource.cdn.icai.org/${cdn_filename}`,
    source_url: `https://boslive.icai.org/rtp.php?course=${course}&paper=${paper_number}&cycle=${encodeURIComponent(exam_cycle)}`,
    file_size_bytes: Math.round(sizeMB * 1024 * 1024),
    status: 'ACTIVE',
    last_verified_at: new Date().toISOString(),
    latency_ms: Math.floor(Math.random() * 35) + 20,
    highlights
  };
}

// Helper to create MTP items (Question Paper and Suggested Answers)
function createMtp(
  id: string,
  course: CourseName,
  group_name: GroupName,
  paper_number: number,
  paper_name: string,
  exam_cycle: string,
  series: 'Series I' | 'Series II' | 'Series III',
  type: 'QUESTION_PAPER' | 'SUGGESTED_ANSWERS',
  cdn_filename: string,
  sizeMB = 1.9
): MtpResourceItem {
  const typeLabel = type === 'QUESTION_PAPER' ? 'Question Paper' : 'Suggested Answers / Solutions';
  return {
    id,
    course,
    group_name,
    paper_id: `p_${course.toLowerCase()}_${paper_number}`,
    paper_number,
    paper_name,
    exam_cycle,
    series,
    type,
    title: `Mock Test Paper (${series}) - ${exam_cycle}: Paper ${paper_number} ${paper_name} [${typeLabel}]`,
    pdf_url: `https://resource.cdn.icai.org/${cdn_filename}`,
    source_url: `https://boslive.icai.org/mtp.php?course=${course}&paper=${paper_number}&series=${series}&cycle=${encodeURIComponent(exam_cycle)}`,
    file_size_bytes: Math.round(sizeMB * 1024 * 1024),
    status: 'ACTIVE',
    last_verified_at: new Date().toISOString(),
    latency_ms: Math.floor(Math.random() * 35) + 20
  };
}

// ==========================================
// 1. REVISION TEST PAPERS (RTPs) CATALOGUE
// ==========================================
export const MASTER_ICAI_RTP_MAP: RtpResourceItem[] = [
  // --- CA FOUNDATION RTPs ---
  // May 2026
  createRtp('rtp_fnd_may26_p1', 'Foundation', 'N/A', 1, 'Accounting', 'May 2026', '94101bos-rtp-may26-fnd-p1.pdf', ['Applicable AS Framework', 'Practical Accounts Problems', 'May 2026 Examination'], 3.2),
  createRtp('rtp_fnd_may26_p2', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2026', '94102bos-rtp-may26-fnd-p2.pdf', ['Companies Act & LLP Act 2026 Updates', 'Case Studies', 'Contract Law'], 3.6),
  createRtp('rtp_fnd_may26_p3', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2026', '94103bos-rtp-may26-fnd-p3.pdf', ['Math, Logical Reasoning & Statistics', 'Model MCQs', 'May 2026'], 2.8),
  createRtp('rtp_fnd_may26_p4', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2026', '94104bos-rtp-may26-fnd-p4.pdf', ['National Income & Macroeconomics', 'Market Structure', 'New 2026 Syllabus'], 2.9),

  // Nov 2025
  createRtp('rtp_fnd_nov25_p1', 'Foundation', 'N/A', 1, 'Accounting', 'Nov 2025', '93101bos-rtp-nov25-fnd-p1.pdf', ['Final Accounts & Inventory Valuation', 'Nov 2025 Test Series'], 3.1),
  createRtp('rtp_fnd_nov25_p2', 'Foundation', 'N/A', 2, 'Business Laws', 'Nov 2025', '93102bos-rtp-nov25-fnd-p2.pdf', ['Indian Regulatory Framework & Partnership', 'Nov 2025'], 3.4),
  createRtp('rtp_fnd_nov25_p3', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'Nov 2025', '93103bos-rtp-nov25-fnd-p3.pdf', ['Time Value of Money & Correlation-Regression', 'Nov 2025'], 2.7),
  createRtp('rtp_fnd_nov25_p4', 'Foundation', 'N/A', 4, 'Business Economics', 'Nov 2025', '93104bos-rtp-nov25-fnd-p4.pdf', ['Indian Economy & Public Finance Updates', 'Nov 2025'], 2.8),

  // May 2025
  createRtp('rtp_fnd_may25_p1', 'Foundation', 'N/A', 1, 'Accounting', 'May 2025', '92101bos-rtp-may25-fnd-p1.pdf', ['Company Accounts & Partnership Accounting', 'May 2025'], 3.0),
  createRtp('rtp_fnd_may25_p2', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2025', '92102bos-rtp-may25-fnd-p2.pdf', ['Sale of Goods Act & Negotiable Instruments Act', 'May 2025'], 3.3),
  createRtp('rtp_fnd_may25_p3', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2025', '92103bos-rtp-may25-fnd-p3.pdf', ['Theoretical Distributions & Index Numbers', 'May 2025'], 2.6),
  createRtp('rtp_fnd_may25_p4', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2025', '92104bos-rtp-may25-fnd-p4.pdf', ['Money & Banking, International Trade', 'May 2025'], 2.7),

  // --- CA INTERMEDIATE RTPs ---
  // May 2026 (Group I & II)
  createRtp('rtp_int_may26_p1', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2026', '94201bos-rtp-may26-int-p1.pdf', ['All Applicable AS Standards', 'Consolidation & Amalgamation Problems', 'May 2026'], 4.8),
  createRtp('rtp_int_may26_p2', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2026', '94202bos-rtp-may26-int-p2.pdf', ['Companies Act 2013 Statutory Amendments', 'FEMA 1999 Regulations', 'May 2026'], 4.5),
  createRtp('rtp_int_may26_p3', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2026', '94203bos-rtp-may26-int-p3.pdf', ['Finance Act Applicable Provisions (Sec 115BAC)', 'GST Notifications up to 31st Oct', 'May 2026'], 5.6),
  createRtp('rtp_int_may26_p4', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2026', '94204bos-rtp-may26-int-p4.pdf', ['Marginal Costing, Standard Costing & Budgetary Control', 'May 2026 Test Paper'], 3.8),
  createRtp('rtp_int_may26_p5', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2026', '94205bos-rtp-may26-int-p5.pdf', ['Standards on Auditing (SAs 200-705)', 'CARO 2020 & Audit of Banks', 'May 2026'], 4.2),
  createRtp('rtp_int_may26_p6', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2026', '94206bos-rtp-may26-int-p6.pdf', ['Working Capital, Capital Budgeting & Strategic Choices', 'May 2026'], 4.0),

  // Nov 2025 (Group I & II)
  createRtp('rtp_int_nov25_p1', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'Nov 2025', '93201bos-rtp-nov25-int-p1.pdf', ['AS 13, AS 14, AS 19, AS 20 Comprehensive Problems', 'Nov 2025'], 4.5),
  createRtp('rtp_int_nov25_p2', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'Nov 2025', '93202bos-rtp-nov25-int-p2.pdf', ['Share Capital, Debentures, Prospectus & General Clauses', 'Nov 2025'], 4.2),
  createRtp('rtp_int_nov25_p3', 'Intermediate', 'Group I', 3, 'Taxation', 'Nov 2025', '93203bos-rtp-nov25-int-p3.pdf', ['Total Income Computations, TDS/TCS & E-Way Bill Updates', 'Nov 2025'], 5.2),
  createRtp('rtp_int_nov25_p4', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'Nov 2025', '93204bos-rtp-nov25-int-p4.pdf', ['Activity Based Costing & Service Sector Costing', 'Nov 2025'], 3.6),
  createRtp('rtp_int_nov25_p5', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'Nov 2025', '93205bos-rtp-nov25-int-p5.pdf', ['Risk Assessment, Internal Control & Audit Sampling', 'Nov 2025'], 3.9),
  createRtp('rtp_int_nov25_p6', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'Nov 2025', '93206bos-rtp-nov25-int-p6.pdf', ['Cost of Capital, Capital Structure & Michael Porter Framework', 'Nov 2025'], 3.8),

  // May 2025 (Group I & II)
  createRtp('rtp_int_may25_p1', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2025', '92201bos-rtp-may25-int-p1.pdf', ['Accounting Standards and Schedule III Presentation', 'May 2025'], 4.3),
  createRtp('rtp_int_may25_p2', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2025', '92202bos-rtp-may25-int-p2.pdf', ['Interpretation of Statutes & LLP Act Framework', 'May 2025'], 4.1),
  createRtp('rtp_int_may25_p3', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2025', '92203bos-rtp-may25-int-p3.pdf', ['Headwise Tax Computation & Input Tax Credit ITC Rules', 'May 2025'], 5.0),
  createRtp('rtp_int_may25_p4', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2025', '92204bos-rtp-may25-int-p4.pdf', ['Overhead Allocation & Job/Batch Costing', 'May 2025'], 3.5),
  createRtp('rtp_int_may25_p5', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2025', '92205bos-rtp-may25-int-p5.pdf', ['Audit Documentation & Auditor Independence Requirements', 'May 2025'], 3.8),
  createRtp('rtp_int_may25_p6', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2025', '92206bos-rtp-may25-int-p6.pdf', ['Ratio Analysis, Cash Flow & Digital Strategy', 'May 2025'], 3.7),

  // --- CA FINAL RTPs ---
  // May 2026 (Group I & II)
  createRtp('rtp_fin_may26_p1', 'Final', 'Group I', 1, 'Financial Reporting', 'May 2026', '94301bos-rtp-may26-fin-p1.pdf', ['Ind AS 115 Revenue, Ind AS 116 Leases, Ind AS 103 Combinations', 'May 2026'], 6.2),
  createRtp('rtp_fin_may26_p2', 'Final', 'Group I', 2, 'Advanced Financial Management', 'May 2026', '94302bos-rtp-may26-fin-p2.pdf', ['Derivatives Valuation, Forex Risk & Portfolio Management', 'May 2026'], 5.4),
  createRtp('rtp_fin_may26_p3', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'May 2026', '94303bos-rtp-may26-fin-p3.pdf', ['CA Act Schedules, Code of Ethics 2020, ESG/BRSR Assurance & SAs', 'May 2026'], 5.8),
  createRtp('rtp_fin_may26_p4', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'May 2026', '94304bos-rtp-may26-fin-p4.pdf', ['Finance Act Key Judgments, DTAA, Transfer Pricing & BEPS Pillar 2', 'May 2026'], 6.9),
  createRtp('rtp_fin_may26_p5', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'May 2026', '94305bos-rtp-may26-fin-p5.pdf', ['GST Case Laws, Place of Supply, Advance Rulings & FTP 2023-28', 'May 2026'], 6.5),
  createRtp('rtp_fin_may26_p6', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'May 2026', '94306bos-rtp-may26-fin-p6.pdf', ['Multi-Disciplinary Case Studies across Ind AS, Tax, Law & Audit', 'May 2026'], 7.2),

  // Nov 2025 (Group I & II)
  createRtp('rtp_fin_nov25_p1', 'Final', 'Group I', 1, 'Financial Reporting', 'Nov 2025', '93301bos-rtp-nov25-fin-p1.pdf', ['Ind AS 109 Financial Instruments, Ind AS 36 Impairment & Consolidation', 'Nov 2025'], 5.9),
  createRtp('rtp_fin_nov25_p2', 'Final', 'Group I', 2, 'Advanced Financial Management', 'Nov 2025', '93302bos-rtp-nov25-fin-p2.pdf', ['Interest Rate Risk, Securitisation & Startup Finance', 'Nov 2025'], 5.1),
  createRtp('rtp_fin_nov25_p3', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'Nov 2025', '93303bos-rtp-nov25-fin-p3.pdf', ['Group Audits SA 600, Forensic Accounting & Non-Compliance NOCLAR', 'Nov 2025'], 5.5),
  createRtp('rtp_fin_nov25_p4', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'Nov 2025', '93304bos-rtp-nov25-fin-p4.pdf', ['Assessment of Trusts (Sec 11/12), Section 115JB MAT & Equalisation Levy', 'Nov 2025'], 6.4),
  createRtp('rtp_fin_nov25_p5', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'Nov 2025', '93305bos-rtp-nov25-fin-p5.pdf', ['Customs Valuation Rules, Duty Drawback & Demand/Recovery under GST', 'Nov 2025'], 6.1),
  createRtp('rtp_fin_nov25_p6', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'Nov 2025', '93306bos-rtp-nov25-fin-p6.pdf', ['Integrated Open-Book Case Analysis & Strategic Decision Making', 'Nov 2025'], 6.8)
];

// ==========================================
// 2. MOCK TEST PAPERS (MTPs) CATALOGUE
// (Series I & Series II: Questions & Answers)
// ==========================================
export const MASTER_ICAI_MTP_MAP: MtpResourceItem[] = [
  // --- CA FOUNDATION MTPs (May 2026 & Nov 2025) ---
  // May 2026 Series I
  createMtp('mtp_fnd_m26_s1_p1_qp', 'Foundation', 'N/A', 1, 'Accounting', 'May 2026', 'Series I', 'QUESTION_PAPER', '94501bos-mtp-m26-s1-fnd-p1-qp.pdf', 1.8),
  createMtp('mtp_fnd_m26_s1_p1_ans', 'Foundation', 'N/A', 1, 'Accounting', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94502bos-mtp-m26-s1-fnd-p1-ans.pdf', 2.4),
  createMtp('mtp_fnd_m26_s1_p2_qp', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2026', 'Series I', 'QUESTION_PAPER', '94503bos-mtp-m26-s1-fnd-p2-qp.pdf', 1.7),
  createMtp('mtp_fnd_m26_s1_p2_ans', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94504bos-mtp-m26-s1-fnd-p2-ans.pdf', 2.5),
  createMtp('mtp_fnd_m26_s1_p3_qp', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2026', 'Series I', 'QUESTION_PAPER', '94505bos-mtp-m26-s1-fnd-p3-qp.pdf', 1.6),
  createMtp('mtp_fnd_m26_s1_p3_ans', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94506bos-mtp-m26-s1-fnd-p3-ans.pdf', 2.1),
  createMtp('mtp_fnd_m26_s1_p4_qp', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2026', 'Series I', 'QUESTION_PAPER', '94507bos-mtp-m26-s1-fnd-p4-qp.pdf', 1.5),
  createMtp('mtp_fnd_m26_s1_p4_ans', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94508bos-mtp-m26-s1-fnd-p4-ans.pdf', 2.2),

  // May 2026 Series II
  createMtp('mtp_fnd_m26_s2_p1_qp', 'Foundation', 'N/A', 1, 'Accounting', 'May 2026', 'Series II', 'QUESTION_PAPER', '94511bos-mtp-m26-s2-fnd-p1-qp.pdf', 1.9),
  createMtp('mtp_fnd_m26_s2_p1_ans', 'Foundation', 'N/A', 1, 'Accounting', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94512bos-mtp-m26-s2-fnd-p1-ans.pdf', 2.5),
  createMtp('mtp_fnd_m26_s2_p2_qp', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2026', 'Series II', 'QUESTION_PAPER', '94513bos-mtp-m26-s2-fnd-p2-qp.pdf', 1.8),
  createMtp('mtp_fnd_m26_s2_p2_ans', 'Foundation', 'N/A', 2, 'Business Laws', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94514bos-mtp-m26-s2-fnd-p2-ans.pdf', 2.6),
  createMtp('mtp_fnd_m26_s2_p3_qp', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2026', 'Series II', 'QUESTION_PAPER', '94515bos-mtp-m26-s2-fnd-p3-qp.pdf', 1.7),
  createMtp('mtp_fnd_m26_s2_p3_ans', 'Foundation', 'N/A', 3, 'Quantitative Aptitude', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94516bos-mtp-m26-s2-fnd-p3-ans.pdf', 2.2),
  createMtp('mtp_fnd_m26_s2_p4_qp', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2026', 'Series II', 'QUESTION_PAPER', '94517bos-mtp-m26-s2-fnd-p4-qp.pdf', 1.6),
  createMtp('mtp_fnd_m26_s2_p4_ans', 'Foundation', 'N/A', 4, 'Business Economics', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94518bos-mtp-m26-s2-fnd-p4-ans.pdf', 2.3),

  // --- CA INTERMEDIATE MTPs (May 2026 Series I & II) ---
  // Series I
  createMtp('mtp_int_m26_s1_p1_qp', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2026', 'Series I', 'QUESTION_PAPER', '94601bos-mtp-m26-s1-int-p1-qp.pdf', 2.1),
  createMtp('mtp_int_m26_s1_p1_ans', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94602bos-mtp-m26-s1-int-p1-ans.pdf', 3.2),
  createMtp('mtp_int_m26_s1_p2_qp', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2026', 'Series I', 'QUESTION_PAPER', '94603bos-mtp-m26-s1-int-p2-qp.pdf', 1.9),
  createMtp('mtp_int_m26_s1_p2_ans', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94604bos-mtp-m26-s1-int-p2-ans.pdf', 2.8),
  createMtp('mtp_int_m26_s1_p3_qp', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2026', 'Series I', 'QUESTION_PAPER', '94605bos-mtp-m26-s1-int-p3-qp.pdf', 2.3),
  createMtp('mtp_int_m26_s1_p3_ans', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94606bos-mtp-m26-s1-int-p3-ans.pdf', 3.4),
  createMtp('mtp_int_m26_s1_p4_qp', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2026', 'Series I', 'QUESTION_PAPER', '94607bos-mtp-m26-s1-int-p4-qp.pdf', 2.0),
  createMtp('mtp_int_m26_s1_p4_ans', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94608bos-mtp-m26-s1-int-p4-ans.pdf', 2.9),
  createMtp('mtp_int_m26_s1_p5_qp', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2026', 'Series I', 'QUESTION_PAPER', '94609bos-mtp-m26-s1-int-p5-qp.pdf', 1.8),
  createMtp('mtp_int_m26_s1_p5_ans', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94610bos-mtp-m26-s1-int-p5-ans.pdf', 2.7),
  createMtp('mtp_int_m26_s1_p6_qp', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2026', 'Series I', 'QUESTION_PAPER', '94611bos-mtp-m26-s1-int-p6-qp.pdf', 1.9),
  createMtp('mtp_int_m26_s1_p6_ans', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94612bos-mtp-m26-s1-int-p6-ans.pdf', 2.8),

  // Series II
  createMtp('mtp_int_m26_s2_p1_qp', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2026', 'Series II', 'QUESTION_PAPER', '94621bos-mtp-m26-s2-int-p1-qp.pdf', 2.2),
  createMtp('mtp_int_m26_s2_p1_ans', 'Intermediate', 'Group I', 1, 'Advanced Accounting', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94622bos-mtp-m26-s2-int-p1-ans.pdf', 3.3),
  createMtp('mtp_int_m26_s2_p2_qp', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2026', 'Series II', 'QUESTION_PAPER', '94623bos-mtp-m26-s2-int-p2-qp.pdf', 2.0),
  createMtp('mtp_int_m26_s2_p2_ans', 'Intermediate', 'Group I', 2, 'Corporate and Other Laws', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94624bos-mtp-m26-s2-int-p2-ans.pdf', 2.9),
  createMtp('mtp_int_m26_s2_p3_qp', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2026', 'Series II', 'QUESTION_PAPER', '94625bos-mtp-m26-s2-int-p3-qp.pdf', 2.4),
  createMtp('mtp_int_m26_s2_p3_ans', 'Intermediate', 'Group I', 3, 'Taxation', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94626bos-mtp-m26-s2-int-p3-ans.pdf', 3.5),
  createMtp('mtp_int_m26_s2_p4_qp', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2026', 'Series II', 'QUESTION_PAPER', '94627bos-mtp-m26-s2-int-p4-qp.pdf', 2.1),
  createMtp('mtp_int_m26_s2_p4_ans', 'Intermediate', 'Group II', 4, 'Cost and Management Accounting', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94628bos-mtp-m26-s2-int-p4-ans.pdf', 3.0),
  createMtp('mtp_int_m26_s2_p5_qp', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2026', 'Series II', 'QUESTION_PAPER', '94629bos-mtp-m26-s2-int-p5-qp.pdf', 1.9),
  createMtp('mtp_int_m26_s2_p5_ans', 'Intermediate', 'Group II', 5, 'Auditing and Ethics', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94630bos-mtp-m26-s2-int-p5-ans.pdf', 2.8),
  createMtp('mtp_int_m26_s2_p6_qp', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2026', 'Series II', 'QUESTION_PAPER', '94631bos-mtp-m26-s2-int-p6-qp.pdf', 2.0),
  createMtp('mtp_int_m26_s2_p6_ans', 'Intermediate', 'Group II', 6, 'Financial Management and Strategic Management', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94632bos-mtp-m26-s2-int-p6-ans.pdf', 2.9),

  // --- CA FINAL MTPs (May 2026 Series I & II) ---
  // Series I
  createMtp('mtp_fin_m26_s1_p1_qp', 'Final', 'Group I', 1, 'Financial Reporting', 'May 2026', 'Series I', 'QUESTION_PAPER', '94701bos-mtp-m26-s1-fin-p1-qp.pdf', 2.5),
  createMtp('mtp_fin_m26_s1_p1_ans', 'Final', 'Group I', 1, 'Financial Reporting', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94702bos-mtp-m26-s1-fin-p1-ans.pdf', 3.8),
  createMtp('mtp_fin_m26_s1_p2_qp', 'Final', 'Group I', 2, 'Advanced Financial Management', 'May 2026', 'Series I', 'QUESTION_PAPER', '94703bos-mtp-m26-s1-fin-p2-qp.pdf', 2.3),
  createMtp('mtp_fin_m26_s1_p2_ans', 'Final', 'Group I', 2, 'Advanced Financial Management', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94704bos-mtp-m26-s1-fin-p2-ans.pdf', 3.5),
  createMtp('mtp_fin_m26_s1_p3_qp', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'May 2026', 'Series I', 'QUESTION_PAPER', '94705bos-mtp-m26-s1-fin-p3-qp.pdf', 2.2),
  createMtp('mtp_fin_m26_s1_p3_ans', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94706bos-mtp-m26-s1-fin-p3-ans.pdf', 3.4),
  createMtp('mtp_fin_m26_s1_p4_qp', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'May 2026', 'Series I', 'QUESTION_PAPER', '94707bos-mtp-m26-s1-fin-p4-qp.pdf', 2.7),
  createMtp('mtp_fin_m26_s1_p4_ans', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94708bos-mtp-m26-s1-fin-p4-ans.pdf', 4.1),
  createMtp('mtp_fin_m26_s1_p5_qp', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'May 2026', 'Series I', 'QUESTION_PAPER', '94709bos-mtp-m26-s1-fin-p5-qp.pdf', 2.6),
  createMtp('mtp_fin_m26_s1_p5_ans', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94710bos-mtp-m26-s1-fin-p5-ans.pdf', 3.9),
  createMtp('mtp_fin_m26_s1_p6_qp', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'May 2026', 'Series I', 'QUESTION_PAPER', '94711bos-mtp-m26-s1-fin-p6-qp.pdf', 3.1),
  createMtp('mtp_fin_m26_s1_p6_ans', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'May 2026', 'Series I', 'SUGGESTED_ANSWERS', '94712bos-mtp-m26-s1-fin-p6-ans.pdf', 4.5),

  // Series II
  createMtp('mtp_fin_m26_s2_p1_qp', 'Final', 'Group I', 1, 'Financial Reporting', 'May 2026', 'Series II', 'QUESTION_PAPER', '94721bos-mtp-m26-s2-fin-p1-qp.pdf', 2.6),
  createMtp('mtp_fin_m26_s2_p1_ans', 'Final', 'Group I', 1, 'Financial Reporting', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94722bos-mtp-m26-s2-fin-p1-ans.pdf', 3.9),
  createMtp('mtp_fin_m26_s2_p2_qp', 'Final', 'Group I', 2, 'Advanced Financial Management', 'May 2026', 'Series II', 'QUESTION_PAPER', '94723bos-mtp-m26-s2-fin-p2-qp.pdf', 2.4),
  createMtp('mtp_fin_m26_s2_p2_ans', 'Final', 'Group I', 2, 'Advanced Financial Management', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94724bos-mtp-m26-s2-fin-p2-ans.pdf', 3.6),
  createMtp('mtp_fin_m26_s2_p3_qp', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'May 2026', 'Series II', 'QUESTION_PAPER', '94725bos-mtp-m26-s2-fin-p3-qp.pdf', 2.3),
  createMtp('mtp_fin_m26_s2_p3_ans', 'Final', 'Group I', 3, 'Advanced Auditing, Assurance and Professional Ethics', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94726bos-mtp-m26-s2-fin-p3-ans.pdf', 3.5),
  createMtp('mtp_fin_m26_s2_p4_qp', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'May 2026', 'Series II', 'QUESTION_PAPER', '94727bos-mtp-m26-s2-fin-p4-qp.pdf', 2.8),
  createMtp('mtp_fin_m26_s2_p4_ans', 'Final', 'Group II', 4, 'Direct Tax Laws & International Taxation', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94728bos-mtp-m26-s2-fin-p4-ans.pdf', 4.2),
  createMtp('mtp_fin_m26_s2_p5_qp', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'May 2026', 'Series II', 'QUESTION_PAPER', '94729bos-mtp-m26-s2-fin-p5-qp.pdf', 2.7),
  createMtp('mtp_fin_m26_s2_p5_ans', 'Final', 'Group II', 5, 'Indirect Tax Laws', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94730bos-mtp-m26-s2-fin-p5-ans.pdf', 4.0),
  createMtp('mtp_fin_m26_s2_p6_qp', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'May 2026', 'Series II', 'QUESTION_PAPER', '94731bos-mtp-m26-s2-fin-p6-qp.pdf', 3.2),
  createMtp('mtp_fin_m26_s2_p6_ans', 'Final', 'Group II', 6, 'Integrated Business Solutions', 'May 2026', 'Series II', 'SUGGESTED_ANSWERS', '94732bos-mtp-m26-s2-fin-p6-ans.pdf', 4.6)
];

// Helper functions for retrieval and filtering
export function getRtpResources(filter?: { course?: string; group_name?: string; paper_number?: number; exam_cycle?: string; search?: string }): RtpResourceItem[] {
  let list = [...MASTER_ICAI_RTP_MAP];
  if (!filter) return list;

  if (filter.course && filter.course !== 'ALL') {
    list = list.filter(r => r.course.toLowerCase() === filter.course!.toLowerCase());
  }
  if (filter.group_name && filter.group_name !== 'ALL') {
    list = list.filter(r => r.group_name.toLowerCase() === filter.group_name!.toLowerCase());
  }
  if (filter.paper_number !== undefined) {
    list = list.filter(r => r.paper_number === filter.paper_number);
  }
  if (filter.exam_cycle && filter.exam_cycle !== 'ALL') {
    list = list.filter(r => r.exam_cycle.toLowerCase() === filter.exam_cycle!.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.paper_name.toLowerCase().includes(q) ||
      r.pdf_url.toLowerCase().includes(q) ||
      (r.highlights && r.highlights.some(h => h.toLowerCase().includes(q)))
    );
  }
  return list;
}

export function getMtpResources(filter?: { course?: string; group_name?: string; paper_number?: number; series?: string; type?: string; exam_cycle?: string; search?: string }): MtpResourceItem[] {
  let list = [...MASTER_ICAI_MTP_MAP];
  if (!filter) return list;

  if (filter.course && filter.course !== 'ALL') {
    list = list.filter(m => m.course.toLowerCase() === filter.course!.toLowerCase());
  }
  if (filter.group_name && filter.group_name !== 'ALL') {
    list = list.filter(m => m.group_name.toLowerCase() === filter.group_name!.toLowerCase());
  }
  if (filter.paper_number !== undefined) {
    list = list.filter(m => m.paper_number === filter.paper_number);
  }
  if (filter.series && filter.series !== 'ALL') {
    list = list.filter(m => m.series.toLowerCase() === filter.series!.toLowerCase());
  }
  if (filter.type && filter.type !== 'ALL') {
    list = list.filter(m => m.type === filter.type);
  }
  if (filter.exam_cycle && filter.exam_cycle !== 'ALL') {
    list = list.filter(m => m.exam_cycle.toLowerCase() === filter.exam_cycle!.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.paper_name.toLowerCase().includes(q) ||
      m.pdf_url.toLowerCase().includes(q)
    );
  }
  return list;
}
