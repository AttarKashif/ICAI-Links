import { ExtractedResource, ScrapeRunRecord } from './types.js';

export interface AnomalyCheckResult {
  isAnomalous: boolean;
  reason?: string;
  previousCount: number;
  currentCount: number;
  confidenceDrop: number;
}

export function detectRunAnomalies(
  currentResources: ExtractedResource[],
  previousRun?: ScrapeRunRecord,
  scopeDescription = ''
): AnomalyCheckResult {
  const currentCount = currentResources.length;

  if (!previousRun || previousRun.materials_found === 0) {
    return {
      isAnomalous: false,
      previousCount: 0,
      currentCount,
      confidenceDrop: 0
    };
  }

  const previousCount = previousRun.materials_found;
  const countRatio = currentCount / previousCount;

  // Trigger 1: Discovered materials < 50% of previous run
  if (previousCount >= 5 && countRatio < 0.50) {
    return {
      isAnomalous: true,
      reason: `Material count collapsed: Discovered ${currentCount} items vs ${previousCount} items in previous run (${(countRatio * 100).toFixed(1)}% of historical yield).`,
      previousCount,
      currentCount,
      confidenceDrop: 0
    };
  }

  // Trigger 2: Average confidence drop > 15%
  const currentAvgConf = currentResources.length > 0
    ? currentResources.reduce((sum, r) => sum + r.classification_confidence, 0) / currentResources.length
    : 0;

  // Historical baseline confidence (~0.85)
  if (currentResources.length > 0 && currentAvgConf < 0.60) {
    return {
      isAnomalous: true,
      reason: `Classification confidence drop detected: Average run confidence dropped to ${(currentAvgConf * 100).toFixed(1)}% (below safety threshold 60.0%).`,
      previousCount,
      currentCount,
      confidenceDrop: 0.85 - currentAvgConf
    };
  }

  // Trigger 3: Previous run had materials but current returned 0
  if (previousCount > 0 && currentCount === 0) {
    return {
      isAnomalous: true,
      reason: `Zero resources extracted for scope '${scopeDescription}' which previously yielded ${previousCount} materials. Possible site DOM structural change.`,
      previousCount,
      currentCount,
      confidenceDrop: 0
    };
  }

  return {
    isAnomalous: false,
    previousCount,
    currentCount,
    confidenceDrop: 0
  };
}
