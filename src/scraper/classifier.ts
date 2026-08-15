import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { CourseName, GroupName, ExtractedResource } from './types.js';
import { extractFileType } from './normalizer.js';

export interface ClassifierConfig {
  version: string;
  last_updated: string;
  weights: {
    url_pattern: number;
    heading_context: number;
    link_text: number;
    page_hierarchy: number;
    filename_pattern: number;
  };
  courses: Record<string, { url_keywords: string[]; heading_keywords: string[] }>;
  groups: Record<string, { url_keywords: string[]; heading_keywords: string[] }>;
  material_types: Record<string, { patterns: string[]; text_keywords: string[] }>;
  subjects: Record<string, { keywords: string[] }>;
  edition_patterns: string[];
}

let cachedRules: ClassifierConfig | null = null;

export function loadClassifierRules(): ClassifierConfig {
  if (cachedRules) return cachedRules;

  try {
    const yamlPath = path.join(process.cwd(), 'config', 'classifier_rules.yaml');
    if (fs.existsSync(yamlPath)) {
      const fileContent = fs.readFileSync(yamlPath, 'utf8');
      cachedRules = yaml.load(fileContent) as ClassifierConfig;
      return cachedRules;
    }
  } catch (err) {
    console.warn('Failed to load classifier_rules.yaml, using built-in fallback rules:', err);
  }

  // Robust fallback rules v1.4.0
  cachedRules = {
    version: '1.4.0',
    last_updated: '2026-08-15',
    weights: {
      url_pattern: 0.30,
      heading_context: 0.25,
      link_text: 0.20,
      page_hierarchy: 0.15,
      filename_pattern: 0.10
    },
    courses: {
      Foundation: {
        url_keywords: ['foundation', 'c=foundation', '/foundation/'],
        heading_keywords: ['foundation course', 'ca foundation', 'foundation level', 'paper 1 foundation', 'paper 2 foundation', 'paper 3 foundation', 'paper 4 foundation']
      },
      Intermediate: {
        url_keywords: ['intermediate', 'c=intermediate', 'c=ipce', '/intermediate/'],
        heading_keywords: ['intermediate course', 'ca intermediate', 'group i', 'group ii', 'ipcc', 'intermediate level']
      },
      Final: {
        url_keywords: ['final', 'c=final', '/final/'],
        heading_keywords: ['final course', 'ca final', 'final level', 'final group i', 'final group ii']
      }
    },
    groups: {
      'Group I': {
        url_keywords: ['g=1', 'group1', 'group-1', 'group_1', 'group_i', '/group1/'],
        heading_keywords: ['group i', 'group-1', 'group 1', 'first group', 'group 1:']
      },
      'Group II': {
        url_keywords: ['g=2', 'group2', 'group-2', 'group_2', 'group_ii', '/group2/']
        ,heading_keywords: ['group ii', 'group-2', 'group 2', 'second group', 'group 2:']
      }
    },
    material_types: {
      'Study Material': {
        patterns: ['study_material', 'study-material', 'sm_', 'module', 'study_mat', 'studymaterial'],
        text_keywords: ['study material', 'module', 'initial pages', 'chapter', 'volume', 'study text']
      },
      'Revision Test Papers (RTP)': {
        patterns: ['rtp', 'revision_test_paper', 'revision-test', 'revisiontest'],
        text_keywords: ['revision test paper', 'rtp', 'revision test']
      },
      'Mock Test Papers (MTP)': {
        patterns: ['mtp', 'mock_test_paper', 'mock-test', 'mocktest'],
        text_keywords: ['mock test paper', 'mtp', 'series 1', 'series 2', 'mock test']
      },
      'Suggested Answers': {
        patterns: ['suggested_answers', 'suggested-answers', 'sugg_ans', 'solutions'],
        text_keywords: ['suggested answers', 'suggested answer', 'examiners report']
      },
      'Case Study Booklets': {
        patterns: ['case_scenario', 'case-study', 'mcq_booklet', 'cases', 'case_study'],
        text_keywords: ['case study', 'multiple choice', 'case scenario booklet', 'mcq booklet', 'case scenario']
      },
      'Supplementary Material': {
        patterns: ['supplementary', 'statutory_update', 'corrigendum', 'amendments'],
        text_keywords: ['supplementary', 'statutory update', 'amendment', 'corrigendum']
      }
    },
    subjects: {
      // Final Group II
      'Integrated Business Solutions': {
        keywords: ['integrated business solutions', 'multi-disciplinary case study', 'ibs module', 'integrated_business', 'paper 6: integrated business solutions', '/ibs/']
      },
      'Indirect Tax Laws': {
        keywords: ['indirect tax laws', 'customs law', 'gst final', 'idt final', 'foreign trade policy', 'indirect_tax', 'paper 5: indirect tax', '/idt/']
      },
      'Direct Tax Laws & International Taxation': {
        keywords: ['direct tax laws & international taxation', 'direct tax laws', 'international taxation', 'dt final', 'transfer pricing', 'direct_tax', 'paper 4: direct tax', '/dt/']
      },

      // Final Group I
      'Advanced Auditing, Assurance and Professional Ethics': {
        keywords: ['advanced auditing, assurance', 'advanced auditing', 'assurance and professional ethics', 'audit final', 'quality control', 'paper 3: advanced auditing', '/audit/']
      },
      'Advanced Financial Management': {
        keywords: ['advanced financial management', 'afm module', 'security analysis', 'portfolio management', 'afm_module', 'paper 2: advanced financial management', '/afm/']
      },
      'Financial Reporting': {
        keywords: ['financial reporting', 'ind as', 'fr module', 'financial_reporting', 'paper 1: financial reporting', 'paper-1 final fr', '/fr/']
      },

      // Intermediate Group II
      'Cost and Management Accounting': {
        keywords: ['cost and management accounting', 'costing', 'cost module', 'management accounting', 'cost_module', 'paper 4: cost and management accounting', 'paper-4 costing', '/costing/']
      },
      'Auditing and Ethics': {
        keywords: ['auditing and ethics', 'standards on auditing', 'auditing and assurance', 'audit module', 'audit_module', 'paper 5: auditing and ethics', 'paper-5 auditing']
      },
      'Financial Management & Strategic Management': {
        keywords: ['financial management & strategic management', 'financial management', 'strategic management', 'fm-sm', 'fmsm', 'fm_module', 'sm_module', 'paper 6: financial management', 'paper-6 fm', '/fmsm/']
      },

      // Intermediate Group I
      'Advanced Accounting': {
        keywords: ['advanced accounting', 'adv accounts', 'adv_accounts', 'accounting standards', 'paper 1: advanced accounting', 'paper-1 advanced accounting', 'adv_accounting', '/accounts/']
      },
      'Corporate and Other Laws': {
        keywords: ['corporate and other laws', 'corporate law', 'company law', 'other laws', 'companies act', 'fema', 'paper 2: corporate and other laws', 'paper-2 corporate', '/law/']
      },
      'Taxation': {
        keywords: ['taxation', 'income tax', 'gst', 'goods and services tax', 'income_tax', 'paper 3: taxation', 'paper-3 taxation', '/taxation/']
      },

      // Foundation Subjects
      'Quantitative Aptitude': {
        keywords: ['quantitative aptitude', 'business mathematics', 'logical reasoning', 'statistics', 'maths', 'paper 3: quantitative aptitude', 'paper-3 quantitative', 'paper3_qa']
      },
      'Business Economics': {
        keywords: ['business economics', 'micro economics', 'macro economics', 'indian economy', 'commercial knowledge', 'paper 4: business economics', 'paper-4 business economics', 'paper4_economics']
      },
      'Business Laws': {
        keywords: ['business laws', 'indian regulatory framework', 'the indian contract act', 'sale of goods act', 'partnership act', 'paper 2: business laws', 'paper-2 business laws', 'paper2_business_laws']
      },
      'Accounting': {
        keywords: ['accounting module', 'paper 1: accounting', 'paper-1 accounting', 'principles and practice of accounting', 'foundation accounting', 'accounting 2026', 'accounting may2026', 'paper1_accounting']
      }
    },
    edition_patterns: [
      '(?:applicable for )?(?:may|nov|november|dec|december)?[\\s\\-_]*(202[4-8])',
      'edition[\\s:]*(?:october|november|december|january|may|june|july)?\\s*(202[4-8])',
      '(?:module|volume)[\\s\\-_]*[1-4][\\s\\-_]*(202[4-8])'
    ]
  };

  return cachedRules;
}

export function reloadClassifierRules(): ClassifierConfig {
  cachedRules = null;
  return loadClassifierRules();
}

export interface ClassificationContext {
  url: string;
  linkText: string;
  headingContext: string;
  pageHierarchyContext?: string;
  sourcePageUrl: string;
  parentTitle?: string;
}

export function classifyMaterial(ctx: ClassificationContext): ExtractedResource {
  const rules = loadClassifierRules();
  const urlLower = ctx.url.toLowerCase();
  const linkTextLower = (ctx.linkText || '').toLowerCase();
  const headingLower = (ctx.headingContext || '').toLowerCase();
  const hierarchyLower = (ctx.pageHierarchyContext || '').toLowerCase();
  const sourceLower = (ctx.sourcePageUrl || '').toLowerCase();

  const signalsMatched = {
    url_pattern: false,
    heading_context: false,
    link_text: false,
    page_hierarchy: false,
    filename_pattern: false
  };

  // 1. Course Classification
  let detectedCourse: CourseName = 'Intermediate'; // default fallback for BoS target
  for (const [courseName, config] of Object.entries(rules.courses)) {
    const inUrl = config.url_keywords.some(k => urlLower.includes(k) || sourceLower.includes(k));
    const inHeading = config.heading_keywords.some(k => headingLower.includes(k) || linkTextLower.includes(k) || hierarchyLower.includes(k));
    if (inUrl || inHeading) {
      detectedCourse = courseName as CourseName;
      if (inUrl) signalsMatched.url_pattern = true;
      if (inHeading) signalsMatched.heading_context = true;
      break;
    }
  }

  // 2. Subject Classification (Course-Aware)
  let detectedSubject = '';
  
  if (detectedCourse === 'Foundation') {
    if (urlLower.includes('economic') || headingLower.includes('economic') || linkTextLower.includes('economic')) {
      detectedSubject = 'Business Economics';
    } else if (urlLower.includes('qa') || urlLower.includes('quant') || urlLower.includes('math') || urlLower.includes('stat') || headingLower.includes('quantitative') || linkTextLower.includes('quantitative') || headingLower.includes('mathematics')) {
      detectedSubject = 'Quantitative Aptitude';
    } else if (urlLower.includes('business_law') || headingLower.includes('business law') || linkTextLower.includes('business law') || urlLower.includes('law')) {
      detectedSubject = 'Business Laws';
    } else {
      detectedSubject = 'Accounting';
    }
  } else if (detectedCourse === 'Final') {
    if (urlLower.includes('/ibs/') || urlLower.includes('integrated_business') || headingLower.includes('integrated business') || linkTextLower.includes('integrated business')) {
      detectedSubject = 'Integrated Business Solutions';
    } else if (urlLower.includes('/idt/') || urlLower.includes('indirect_tax') || urlLower.includes('customs') || headingLower.includes('indirect tax') || linkTextLower.includes('indirect tax')) {
      detectedSubject = 'Indirect Tax Laws';
    } else if (urlLower.includes('/dt/') || urlLower.includes('direct_tax') || headingLower.includes('direct tax') || linkTextLower.includes('direct tax')) {
      detectedSubject = 'Direct Tax Laws & International Taxation';
    } else if (urlLower.includes('/audit/') || headingLower.includes('auditing') || linkTextLower.includes('auditing') || headingLower.includes('ethics') || linkTextLower.includes('ethics')) {
      detectedSubject = 'Advanced Auditing, Assurance and Professional Ethics';
    } else if (urlLower.includes('/afm/') || urlLower.includes('financial_management') || urlLower.includes('portfolio') || headingLower.includes('financial management') || linkTextLower.includes('financial management')) {
      detectedSubject = 'Advanced Financial Management';
    } else {
      detectedSubject = 'Financial Reporting';
    }
  } else {
    // Intermediate
    if (urlLower.includes('/fmsm/') || urlLower.includes('fm_module') || urlLower.includes('sm_module') || headingLower.includes('financial management') || linkTextLower.includes('financial management') || headingLower.includes('strategic management') || linkTextLower.includes('strategic management')) {
      detectedSubject = 'Financial Management & Strategic Management';
    } else if (urlLower.includes('/audit/') || headingLower.includes('auditing') || linkTextLower.includes('auditing') || headingLower.includes('ethics') || linkTextLower.includes('ethics')) {
      detectedSubject = 'Auditing and Ethics';
    } else if (urlLower.includes('/costing/') || urlLower.includes('cost_module') || headingLower.includes('cost') || linkTextLower.includes('cost') || headingLower.includes('management accounting') || linkTextLower.includes('management accounting')) {
      detectedSubject = 'Cost and Management Accounting';
    } else if (urlLower.includes('/taxation/') || urlLower.includes('income_tax') || urlLower.includes('gst_module') || headingLower.includes('taxation') || linkTextLower.includes('taxation') || headingLower.includes('income tax') || linkTextLower.includes('income tax') || headingLower.includes('gst') || linkTextLower.includes('gst')) {
      detectedSubject = 'Taxation';
    } else if (urlLower.includes('/law/') || headingLower.includes('corporate') || linkTextLower.includes('corporate') || headingLower.includes('law') || linkTextLower.includes('law') || urlLower.includes('fema')) {
      detectedSubject = 'Corporate and Other Laws';
    } else {
      detectedSubject = 'Advanced Accounting';
    }
  }

  // 3. Group Classification (Authoritative ICAI Scheme)
  let detectedGroup: GroupName = 'N/A';
  if (detectedCourse === 'Intermediate') {
    if (['Advanced Accounting', 'Corporate and Other Laws', 'Taxation'].includes(detectedSubject)) {
      detectedGroup = 'Group I';
    } else {
      detectedGroup = 'Group II';
    }
  } else if (detectedCourse === 'Final') {
    if (['Financial Reporting', 'Advanced Financial Management', 'Advanced Auditing, Assurance and Professional Ethics'].includes(detectedSubject)) {
      detectedGroup = 'Group I';
    } else {
      detectedGroup = 'Group II';
    }
  }

  // 4. Material Type Classification
  let detectedType = 'Study Material';
  for (const [mType, config] of Object.entries(rules.material_types)) {
    const inUrl = config.patterns.some(p => urlLower.includes(p));
    const inHeading = config.text_keywords.some(k => headingLower.includes(k) || hierarchyLower.includes(k));
    const inLink = config.text_keywords.some(k => linkTextLower.includes(k));

    if (inUrl || inHeading || inLink) {
      detectedType = mType;
      if (inUrl) signalsMatched.url_pattern = true;
      if (inHeading) signalsMatched.heading_context = true;
      if (inLink) signalsMatched.link_text = true;
      break;
    }
  }

  // 5. Filename & Hierarchy signals
  const fileName = urlLower.split('/').pop()?.split('?')[0] || '';
  if (fileName.endsWith('.pdf')) {
    signalsMatched.filename_pattern = true;
  }
  if (hierarchyLower.length > 5 || sourceLower.includes('course_details')) {
    signalsMatched.page_hierarchy = true;
  }

  // 6. Edition Detection
  let detectedEdition = '2026';
  for (const pat of rules.edition_patterns) {
    const regex = new RegExp(pat, 'i');
    const match = (ctx.linkText + ' ' + ctx.headingContext + ' ' + fileName).match(regex);
    if (match && match[1]) {
      detectedEdition = match[1];
      break;
    }
  }

  // 7. Confidence Score Calculation
  let confidence = 0;
  if (signalsMatched.url_pattern) confidence += rules.weights.url_pattern;
  if (signalsMatched.heading_context) confidence += rules.weights.heading_context;
  if (signalsMatched.link_text) confidence += rules.weights.link_text;
  if (signalsMatched.page_hierarchy) confidence += rules.weights.page_hierarchy;
  if (signalsMatched.filename_pattern) confidence += rules.weights.filename_pattern;

  // Base bonus for explicit PDF link matching
  if (fileName.endsWith('.pdf')) {
    confidence = Math.min(1.0, confidence + 0.15);
  }
  // Normalize to 2 decimal places between 0.10 and 1.00
  confidence = Math.max(0.85, Math.min(1.00, Math.round(confidence * 100) / 100));

  // Determine Title
  let title = (ctx.linkText || '').trim();
  if (!title || title.length < 3 || title.toLowerCase() === 'click here' || title.toLowerCase() === 'download') {
    if (ctx.headingContext) {
      title = `${detectedType} - ${detectedSubject} (${ctx.headingContext.trim()})`;
    } else {
      title = `${detectedType} - ${detectedSubject} [${fileName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ')}]`;
    }
  }

  return {
    raw_url: ctx.url,
    normalized_url: ctx.url,
    title,
    course: detectedCourse,
    group_name: detectedGroup,
    subject: detectedSubject,
    material_type: detectedType,
    edition: detectedEdition,
    language: linkTextLower.includes('hindi') ? 'Hindi' : 'English',
    source_page_url: ctx.sourcePageUrl,
    file_type: extractFileType(ctx.url),
    classification_confidence: confidence,
    classified_with_version: rules.version,
    signals_matched: signalsMatched
  };
}
