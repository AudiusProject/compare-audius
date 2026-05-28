// types/index.ts

/**
 * Comparison status types. Keep in sync with the `status` enum on the
 * `comparisons` table in db/schema.ts.
 * - yes: Feature fully available (green checkmark)
 * - no: Feature not available (red X)
 * - partial: Feature partially available with context (gray dash)
 * - custom: Custom display value instead of icon (e.g., "320 kbps")
 * - skip: Explicitly blank — filtered out of getComparisonData() so the
 *         feature row doesn't appear on the public page for that platform.
 *         Never reaches the public UI.
 */
export type ComparisonStatus = 'yes' | 'no' | 'partial' | 'custom' | 'skip';

/**
 * Platform (Audius, Spotify, SoundCloud)
 */
export interface Platform {
  id: string;
  name: string;
  slug: string;
  logo: string;
  isAudius: boolean;
  isDraft?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Feature being compared
 */
export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isDraft?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Single comparison record (Platform × Feature)
 */
export interface Comparison {
  id: string;
  platformId: string;
  featureId: string;
  status: ComparisonStatus;
  displayValue: string | null;
  context: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Computed type for rendering a feature row
 * Contains the feature and both platform comparisons
 */
export interface FeatureComparison {
  feature: Feature;
  audius: Comparison;
  competitor: Comparison;
}

/**
 * Props for comparison page components
 */
export interface ComparisonPageProps {
  competitor: Platform;
  competitors: Platform[];
  comparisons: FeatureComparison[];
}
