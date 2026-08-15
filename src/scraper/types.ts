export type CourseName = 'Foundation' | 'Intermediate' | 'Final' | 'Other';
export type GroupName = 'Group I' | 'Group II' | 'All Groups' | 'N/A';
export type MaterialStatus = 'ACTIVE' | 'REDIRECTED' | 'NOT_FOUND' | 'SERVER_ERROR' | 'TIMEOUT' | 'BLOCKED' | 'NOT_SEEN' | 'RECHECK' | 'REMOVED' | 'NEW' | 'URL_CHANGED' | 'CONTENT_CHANGED' | 'UNKNOWN';

export interface MaterialRecord {
  id: string;
  course: CourseName;
  group_name: GroupName;
  subject: string;
  material_type: string;
  title: string;
  edition: string;
  language: string;
  url: string;
  source_page_url: string;
  file_type: 'pdf' | 'page' | 'zip' | 'other';
  status: MaterialStatus;
  classification_confidence: number;
  classified_with_version: string;
  first_seen_at: string;
  last_seen_at: string;
  last_checked_at: string;
  content_hash?: string;
  notes?: string;

  // ICAI Study Material Hierarchy fields
  paper_id?: string;
  paper_number?: number;
  paper_name?: string;
  module_id?: string;
  module_number?: number;
  module_name?: string;
  chapter_id?: string;
  chapter_number?: number;
  chapter_name?: string;
  pdf_url?: string;
  content_type?: string;
  http_status?: number;
  file_size_bytes?: number;
  exam_cycle?: string;
  scheme?: string;
}

export interface StudyMaterialChapterItem {
  id: string;
  course: CourseName;
  group_name: GroupName;
  paper_id: string;
  paper_number: number;
  paper_name: string;
  module_id: string;
  module_number: number;
  module_name: string;
  chapter_id: string;
  chapter_number: number;
  chapter_name: string;
  material_title: string;
  pdf_url: string;
  source_url: string;
  content_type: string;
  http_status: number;
  file_size_bytes: number;
  content_hash: string;
  exam_cycle: string;
  scheme: string;
  status: MaterialStatus;
  last_verified_at: string;
  latency_ms: number;
}

export type ResourceCategory = 'ALL' | 'STUDY_MATERIAL' | 'RTP' | 'MTP';

export interface RtpResourceItem {
  id: string;
  course: CourseName;
  group_name: GroupName;
  paper_id: string;
  paper_number: number;
  paper_name: string;
  exam_cycle: string;
  title: string;
  pdf_url: string;
  source_url: string;
  file_size_bytes: number;
  status: MaterialStatus;
  last_verified_at: string;
  latency_ms: number;
  highlights?: string[];
}

export interface MtpResourceItem {
  id: string;
  course: CourseName;
  group_name: GroupName;
  paper_id: string;
  paper_number: number;
  paper_name: string;
  exam_cycle: string;
  series: 'Series I' | 'Series II' | 'Series III';
  type: 'QUESTION_PAPER' | 'SUGGESTED_ANSWERS';
  title: string;
  pdf_url: string;
  source_url: string;
  file_size_bytes: number;
  status: MaterialStatus;
  last_verified_at: string;
  latency_ms: number;
}

export interface ModuleHierarchyNode {
  module_id: string;
  module_number: number;
  module_name: string;
  source_url: string;
  chapters: StudyMaterialChapterItem[];
}

export interface PaperHierarchyNode {
  paper_id: string;
  paper_number: number;
  paper_name: string;
  group_name: GroupName;
  modules: ModuleHierarchyNode[];
  rtps?: RtpResourceItem[];
  mtps?: MtpResourceItem[];
}

export interface CourseHierarchyNode {
  course: CourseName;
  papers: PaperHierarchyNode[];
}

export interface AutomatedTestResult {
  testId: string;
  testName: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  details: string;
  assertionsCount: number;
  passedAssertions: number;
  error?: string;
}

export interface UrlHistoryRecord {
  id: string;
  material_id: string;
  url: string;
  first_seen_at: string;
  last_seen_at: string;
  status: MaterialStatus;
  content_hash?: string;
}

export interface ScrapeRunRecord {
  id: string;
  started_at: string;
  completed_at: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING' | 'ANOMALOUS_COMPLETED';
  scope_description: string;
  pages_discovered: number;
  pages_fetched: number;
  materials_found: number;
  new_materials: number;
  updated_materials: number;
  unchanged_materials: number;
  content_changed_materials: number;
  potentially_removed: number;
  active_urls: number;
  failed_urls: number;
  classifier_rules_version: string;
  anomaly_flag: boolean;
  anomaly_reason?: string;
  duration_seconds: number;
  errors: string[];
  logs: string[];
  report_summary: string;
}

export interface ScrapeConfig {
  entry_urls: string[];
  allowed_domains: string[];
  crawl_delay_seconds: number;
  max_concurrency: number;
  timeout_seconds: number;
  max_retries: number;
  scope: {
    courses?: CourseName[];
    subjects?: string[];
    material_types?: string[];
  };
  anomaly_thresholds: {
    min_material_ratio_vs_previous: number; // 0.5 default
    min_confidence_drop_threshold: number; // 0.15 default
  };
}

export interface ExtractedResource {
  raw_url: string;
  normalized_url: string;
  title: string;
  course: CourseName;
  group_name: GroupName;
  subject: string;
  material_type: string;
  edition: string;
  language: string;
  source_page_url: string;
  file_type: 'pdf' | 'page' | 'zip' | 'other';
  classification_confidence: number;
  classified_with_version: string;
  signals_matched: {
    url_pattern: boolean;
    heading_context: boolean;
    link_text: boolean;
    page_hierarchy: boolean;
    filename_pattern: boolean;
  };
}

export interface ValidationResult {
  status: MaterialStatus;
  http_status?: number;
  final_url: string;
  content_hash?: string;
  file_size_bytes?: number;
  content_type?: string;
  error_message?: string;
  duration_ms: number;
}

export interface DiscoveredModuleQueueItem {
  id: string;
  course: CourseName;
  group_name: GroupName;
  paper_id: string;
  paper_number: number;
  paper_name: string;
  module_id: string;
  module_number: number;
  module_name: string;
  source_url: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  discovered_at: string;
}

export interface BatchProcessingStats {
  batch_index: number;
  total_batches: number;
  batch_size: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  duration_ms: number;
  timestamp: string;
}

export interface StateManagedArraySnapshot {
  total_links: number;
  total_courses: number;
  total_papers: number;
  total_modules: number;
  total_chapters: number;
  last_updated: string;
  is_processing: boolean;
  current_batch: number;
  total_batches: number;
  batch_size: number;
  links: StudyMaterialChapterItem[];
  recent_batches: BatchProcessingStats[];
  coverage_summary: {
    course: CourseName;
    paper_number: number;
    paper_name: string;
    modules_count: number;
    chapters_count: number;
  }[];
}
