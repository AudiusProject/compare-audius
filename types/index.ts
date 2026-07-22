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
 * One rendered row of a comparison page: a feature plus one comparison cell
 * per selected platform. `cells` is index-aligned with
 * ComparisonData.platforms (cells[0] is always Audius).
 */
export interface ComparisonRow {
  feature: Feature;
  cells: Comparison[];
}

/**
 * Everything a comparison page needs. A row is only present when EVERY
 * selected platform has a non-skip comparison for that feature (lowest
 * common denominator).
 */
export interface ComparisonData {
  audius: Platform;
  /** Selected competitors, in URL order */
  competitors: Platform[];
  /** [audius, ...competitors] — the column order */
  platforms: Platform[];
  rows: ComparisonRow[];
  /**
   * Unselected competitors that would keep at least one row if added to this
   * comparison (i.e. they have a non-skip cell on ≥1 current row). Drives the
   * "+" menu — empty means the + button is hidden entirely.
   */
  addableCompetitors: Platform[];
}
