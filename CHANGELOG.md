# Classifier Rules Changelog

All notable changes to `config/classifier_rules.yaml` are documented in this file.

## [v1.2.0] - 2026-08-15
### Added
- Multi-signal confidence weighting: `url_pattern` (30%), `heading_context` (25%), `link_text` (20%), `page_hierarchy` (15%), `filename_pattern` (10%).
- Rules for New Scheme 6-paper CA Intermediate structure (Advanced Accounting, Law, Taxation, Costing, Auditing & Ethics, FM-SM).
- Rule pattern matching for RTP filenames containing `revision-test` alongside traditional `rtp` acronyms.
- Multi-year edition parsing supporting 2024 through 2028 examination cycles.
- Case Scenario Booklets and Statutory Supplementary updates category classification.

## [v1.1.0] - 2026-08-10
### Changed
- Refined regex patterns for module and chapter token extraction in PDF URLs.
- Enhanced Group I vs Group II URL query token matching (`g=1`, `group-1`, `group_i`).

## [v1.0.0] - 2026-08-01
### Initial
- Base classifier rules for CA Foundation, Intermediate, and Final.
- Initial taxonomy for Study Material, RTP, MTP, and Suggested Answers.
