'use client';

import { useMemo, useRef, useState } from 'react';
import { useToast } from './Toast';
import { cn } from '@/lib/utils';
import type {
  ImportDiff,
  PlatformExport,
  FeatureExport,
  ComparisonExport,
  FieldChange,
} from '@/lib/data-io';

type Section = 'platforms' | 'features' | 'comparisons';
type ComparisonStatus = ComparisonExport['status'];

const platformKey = (p: { slug: string }) => p.slug;
const featureKey = (f: { slug: string }) => f.slug;
const comparisonKey = (c: { platformSlug: string; featureSlug: string }) =>
  `${c.platformSlug}::${c.featureSlug}`;

interface SelectionState {
  platforms: Record<string, boolean>;
  features: Record<string, boolean>;
  comparisons: Record<string, boolean>;
}

interface EditState {
  platforms: Record<string, Partial<PlatformExport>>;
  features: Record<string, Partial<FeatureExport>>;
  comparisons: Record<string, Partial<ComparisonExport>>;
}

const EMPTY_EDITS: EditState = { platforms: {}, features: {}, comparisons: {} };

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DataIO() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const [parseErrors, setParseErrors] = useState<string[] | null>(null);
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selections, setSelections] = useState<SelectionState>({
    platforms: {},
    features: {},
    comparisons: {},
  });
  const [edits, setEdits] = useState<EditState>(EMPTY_EDITS);

  // -------- Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/data/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const dispo = res.headers.get('Content-Disposition') ?? '';
      const match = dispo.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? `compare-audius-data-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Exported', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // -------- Upload + diff
  const handleFile = async (file: File) => {
    setIsUploading(true);
    setParseErrors(null);
    setDiff(null);
    setEdits(EMPTY_EDITS);
    setFileName(file.name);
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setParseErrors(['Selected file is not valid JSON']);
        return;
      }
      const res = await fetch('/api/admin/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Upload failed', 'error');
        return;
      }
      if (!data.ok) {
        setParseErrors(data.errors ?? ['Unknown validation error']);
        return;
      }
      const incoming: ImportDiff = data.diff;
      setDiff(incoming);
      setSelections({
        platforms: Object.fromEntries([
          ...incoming.platforms.created.map((p) => [platformKey(p), true]),
          ...incoming.platforms.updated.map((u) => [u.slug, true]),
        ]),
        features: Object.fromEntries([
          ...incoming.features.created.map((f) => [featureKey(f), true]),
          ...incoming.features.updated.map((u) => [u.slug, true]),
        ]),
        comparisons: Object.fromEntries([
          ...incoming.comparisons.created.map((c) => [comparisonKey(c), true]),
          ...incoming.comparisons.updated.map((u) => [comparisonKey(u), true]),
        ]),
      });
    } catch (err) {
      console.error(err);
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // -------- Apply
  const handleApply = async () => {
    if (!diff) return;
    setIsApplying(true);
    try {
      const payload = {
        platforms: [
          ...diff.platforms.created
            .filter((p) => selections.platforms[platformKey(p)])
            .map((p) => mergePlatform(p, edits.platforms[platformKey(p)])),
          ...diff.platforms.updated
            .filter((u) => selections.platforms[u.slug])
            .map((u) => mergePlatform(u.next, edits.platforms[u.slug])),
        ],
        features: [
          ...diff.features.created
            .filter((f) => selections.features[featureKey(f)])
            .map((f) => mergeFeature(f, edits.features[featureKey(f)])),
          ...diff.features.updated
            .filter((u) => selections.features[u.slug])
            .map((u) => mergeFeature(u.next, edits.features[u.slug])),
        ],
        comparisons: [
          ...diff.comparisons.created
            .filter((c) => selections.comparisons[comparisonKey(c)])
            .map((c) => mergeComparison(c, edits.comparisons[comparisonKey(c)])),
          ...diff.comparisons.updated
            .filter((u) => selections.comparisons[comparisonKey(u)])
            .map((u) => mergeComparison(u.next, edits.comparisons[comparisonKey(u)])),
        ],
      };
      const res = await fetch('/api/admin/data/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Apply failed', 'error');
        return;
      }
      const r = data.result as {
        platforms: { created: number; updated: number };
        features: { created: number; updated: number };
        comparisons: { created: number; updated: number; skipped: number };
        errors: string[];
      };
      const summary =
        `Platforms +${r.platforms.created}/~${r.platforms.updated} · ` +
        `Features +${r.features.created}/~${r.features.updated} · ` +
        `Comparisons +${r.comparisons.created}/~${r.comparisons.updated}`;
      showToast(summary, r.errors.length > 0 ? 'info' : 'success');
      resetDiff();
    } catch (err) {
      console.error(err);
      showToast('Apply failed', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const resetDiff = () => {
    setDiff(null);
    setFileName(null);
    setParseErrors(null);
    setSelections({ platforms: {}, features: {}, comparisons: {} });
    setEdits(EMPTY_EDITS);
  };

  // ---- Selection helpers
  const toggle = (section: Section, key: string) => {
    setSelections((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));
  };

  const setAllInSection = (section: Section, value: boolean) => {
    if (!diff) return;
    setSelections((prev) => {
      const next = { ...prev };
      if (section === 'platforms') {
        next.platforms = { ...prev.platforms };
        for (const p of diff.platforms.created) next.platforms[platformKey(p)] = value;
        for (const u of diff.platforms.updated) next.platforms[u.slug] = value;
      } else if (section === 'features') {
        next.features = { ...prev.features };
        for (const f of diff.features.created) next.features[featureKey(f)] = value;
        for (const u of diff.features.updated) next.features[u.slug] = value;
      } else {
        next.comparisons = { ...prev.comparisons };
        for (const c of diff.comparisons.created) next.comparisons[comparisonKey(c)] = value;
        for (const u of diff.comparisons.updated) next.comparisons[comparisonKey(u)] = value;
      }
      return next;
    });
  };

  const setAll = (value: boolean) => {
    setAllInSection('platforms', value);
    setAllInSection('features', value);
    setAllInSection('comparisons', value);
  };

  // ---- Edit helpers
  const updateEdit = <K extends Section>(
    section: K,
    key: string,
    patch: Partial<
      K extends 'platforms' ? PlatformExport : K extends 'features' ? FeatureExport : ComparisonExport
    >,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: { ...(prev[section][key] ?? {}), ...patch },
      },
    }));
  };

  const resetEditFor = (section: Section, key: string) => {
    setEdits((prev) => {
      const next = { ...prev[section] };
      delete next[key];
      return { ...prev, [section]: next };
    });
  };

  // ---- Totals
  const totals = useMemo(() => {
    if (!diff) return null;
    const created =
      diff.platforms.created.length +
      diff.features.created.length +
      diff.comparisons.created.length;
    const updated =
      diff.platforms.updated.length +
      diff.features.updated.length +
      diff.comparisons.updated.length;
    const skipped =
      diff.platforms.skipped.length +
      diff.features.skipped.length +
      diff.comparisons.skipped.length;
    const missing =
      diff.platforms.missing.length +
      diff.features.missing.length +
      diff.comparisons.missing.length;
    const invalid = diff.comparisons.invalid.length;
    const selected =
      Object.values(selections.platforms).filter(Boolean).length +
      Object.values(selections.features).filter(Boolean).length +
      Object.values(selections.comparisons).filter(Boolean).length;
    return { created, updated, skipped, missing, invalid, selected, actionable: created + updated };
  }, [diff, selections]);

  return (
    <div className="space-y-6">
      {/* ----- Actions ----- */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-audius-purple text-text-primary text-sm font-medium rounded-lg hover:bg-audius-purple-dark transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <DownloadGlyph />
          {isExporting ? 'Exporting…' : 'Export JSON'}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-tint-05 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <UploadGlyph />
          {isUploading ? 'Reading file…' : 'Upload JSON…'}
        </button>
        {fileName && diff && (
          <span className="text-xs text-text-secondary truncate w-full sm:w-auto sm:max-w-[260px]">
            {fileName}
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* ----- Parse errors ----- */}
      {parseErrors && parseErrors.length > 0 && (
        <div className="rounded-lg border border-status-no bg-status-no/10 p-4">
          <h3 className="font-semibold mb-2">Validation errors</h3>
          <ul className="text-sm text-text-secondary space-y-1">
            {parseErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ----- Diff or empty state ----- */}
      {diff && totals && (
        <>
          {totals.actionable === 0 && totals.invalid === 0 ? (
            <NothingToApply
              skipped={totals.skipped}
              missing={totals.missing}
              onDone={resetDiff}
            />
          ) : (
            <div className="space-y-4 pb-24">
              <SummaryCards totals={totals} onSelectAll={setAll} />

              {diff.comparisons.invalid.length > 0 && (
                <div className="rounded-lg border border-status-no/40 bg-status-no/10 p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {diff.comparisons.invalid.length} invalid comparison
                    {diff.comparisons.invalid.length === 1 ? '' : 's'} (will be skipped)
                  </h3>
                  <ul className="text-xs text-text-secondary space-y-1 font-mono">
                    {diff.comparisons.invalid.map((c, i) => (
                      <li key={i}>
                        {c.platformSlug} / {c.featureSlug} — {c.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Platforms */}
              <DiffSection
                title="Platforms"
                actionableCount={diff.platforms.created.length + diff.platforms.updated.length}
                selectedCount={
                  [...diff.platforms.created, ...diff.platforms.updated.map((u) => ({ slug: u.slug }))]
                    .filter((p) => selections.platforms[platformKey(p)])
                    .length
                }
                skipped={diff.platforms.skipped.map((p) => ({ key: p.slug, label: p.slug }))}
                missing={diff.platforms.missing.map((p) => ({ key: p.slug, label: p.slug }))}
                onSetAll={(v) => setAllInSection('platforms', v)}
              >
                {diff.platforms.created.length > 0 && (
                  <Group title="New" badgeClass="bg-status-yes/15 text-status-yes">
                    {diff.platforms.created.map((p) => {
                      const k = platformKey(p);
                      const merged = mergePlatform(p, edits.platforms[k]);
                      const hasEdits = !!edits.platforms[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.platforms[k]}
                          onToggle={() => toggle('platforms', k)}
                          primary={merged.name || merged.slug}
                          secondary="new"
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('platforms', k)}
                        >
                          <PlatformFields
                            value={merged}
                            changes={null}
                            onChange={(patch) => updateEdit('platforms', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
                {diff.platforms.updated.length > 0 && (
                  <Group title="Changed" badgeClass="bg-status-warn/15 text-status-warn">
                    {diff.platforms.updated.map((u) => {
                      const k = u.slug;
                      const merged = mergePlatform(u.next, edits.platforms[k]);
                      const hasEdits = !!edits.platforms[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.platforms[k]}
                          onToggle={() => toggle('platforms', k)}
                          primary={u.slug}
                          secondary={pluralize(u.changes.length, 'change')}
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('platforms', k)}
                        >
                          <PlatformFields
                            value={merged}
                            changes={u.changes}
                            onChange={(patch) => updateEdit('platforms', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
              </DiffSection>

              {/* Features */}
              <DiffSection
                title="Features"
                actionableCount={diff.features.created.length + diff.features.updated.length}
                selectedCount={
                  [...diff.features.created, ...diff.features.updated.map((u) => ({ slug: u.slug }))]
                    .filter((f) => selections.features[featureKey(f)])
                    .length
                }
                skipped={diff.features.skipped.map((f) => ({ key: f.slug, label: f.slug }))}
                missing={diff.features.missing.map((f) => ({ key: f.slug, label: f.slug }))}
                onSetAll={(v) => setAllInSection('features', v)}
              >
                {diff.features.created.length > 0 && (
                  <Group title="New" badgeClass="bg-status-yes/15 text-status-yes">
                    {diff.features.created.map((f) => {
                      const k = featureKey(f);
                      const merged = mergeFeature(f, edits.features[k]);
                      const hasEdits = !!edits.features[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.features[k]}
                          onToggle={() => toggle('features', k)}
                          primary={merged.name || merged.slug}
                          secondary="new"
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('features', k)}
                        >
                          <FeatureFields
                            value={merged}
                            changes={null}
                            onChange={(patch) => updateEdit('features', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
                {diff.features.updated.length > 0 && (
                  <Group title="Changed" badgeClass="bg-status-warn/15 text-status-warn">
                    {diff.features.updated.map((u) => {
                      const k = u.slug;
                      const merged = mergeFeature(u.next, edits.features[k]);
                      const hasEdits = !!edits.features[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.features[k]}
                          onToggle={() => toggle('features', k)}
                          primary={u.slug}
                          secondary={pluralize(u.changes.length, 'change')}
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('features', k)}
                        >
                          <FeatureFields
                            value={merged}
                            changes={u.changes}
                            onChange={(patch) => updateEdit('features', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
              </DiffSection>

              {/* Comparisons */}
              <DiffSection
                title="Comparisons"
                actionableCount={
                  diff.comparisons.created.length + diff.comparisons.updated.length
                }
                selectedCount={
                  [
                    ...diff.comparisons.created,
                    ...diff.comparisons.updated.map((u) => ({
                      platformSlug: u.platformSlug,
                      featureSlug: u.featureSlug,
                    })),
                  ].filter((c) => selections.comparisons[comparisonKey(c)]).length
                }
                skipped={diff.comparisons.skipped.map((c) => ({
                  key: comparisonKey(c),
                  label: `${c.platformSlug} / ${c.featureSlug}`,
                }))}
                missing={diff.comparisons.missing.map((c) => ({
                  key: comparisonKey(c),
                  label: `${c.platformSlug} / ${c.featureSlug}`,
                }))}
                onSetAll={(v) => setAllInSection('comparisons', v)}
              >
                {diff.comparisons.created.length > 0 && (
                  <Group title="New" badgeClass="bg-status-yes/15 text-status-yes">
                    {diff.comparisons.created.map((c) => {
                      const k = comparisonKey(c);
                      const merged = mergeComparison(c, edits.comparisons[k]);
                      const hasEdits = !!edits.comparisons[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.comparisons[k]}
                          onToggle={() => toggle('comparisons', k)}
                          primary={`${c.platformSlug} / ${c.featureSlug}`}
                          secondary="new"
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('comparisons', k)}
                        >
                          <ComparisonFields
                            value={merged}
                            changes={null}
                            onChange={(patch) => updateEdit('comparisons', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
                {diff.comparisons.updated.length > 0 && (
                  <Group title="Changed" badgeClass="bg-status-warn/15 text-status-warn">
                    {diff.comparisons.updated.map((u) => {
                      const k = comparisonKey(u);
                      const merged = mergeComparison(u.next, edits.comparisons[k]);
                      const hasEdits = !!edits.comparisons[k];
                      return (
                        <EditableRow
                          key={k}
                          checked={!!selections.comparisons[k]}
                          onToggle={() => toggle('comparisons', k)}
                          primary={`${u.platformSlug} / ${u.featureSlug}`}
                          secondary={pluralize(u.changes.length, 'change')}
                          hasEdits={hasEdits}
                          onReset={() => resetEditFor('comparisons', k)}
                        >
                          <ComparisonFields
                            value={merged}
                            changes={u.changes}
                            onChange={(patch) => updateEdit('comparisons', k, patch)}
                          />
                        </EditableRow>
                      );
                    })}
                  </Group>
                )}
              </DiffSection>

              <ApplyBar
                selected={totals.selected}
                missing={totals.missing}
                isApplying={isApplying}
                onCancel={resetDiff}
                onApply={handleApply}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Merge helpers — file value + user overrides
// ---------------------------------------------------------------------------

function mergePlatform(base: PlatformExport, patch?: Partial<PlatformExport>): PlatformExport {
  return { ...base, ...(patch ?? {}) };
}
function mergeFeature(base: FeatureExport, patch?: Partial<FeatureExport>): FeatureExport {
  return { ...base, ...(patch ?? {}) };
}
function mergeComparison(
  base: ComparisonExport,
  patch?: Partial<ComparisonExport>,
): ComparisonExport {
  return { ...base, ...(patch ?? {}) };
}

function getChangedFields(changes: FieldChange[] | null): Map<string, unknown> {
  return new Map(changes?.map((c) => [c.field, c.from]) ?? []);
}

// ---------------------------------------------------------------------------
// Per-entity field editors
// ---------------------------------------------------------------------------

function PlatformFields({
  value,
  changes,
  onChange,
}: {
  value: PlatformExport;
  changes: FieldChange[] | null;
  onChange: (patch: Partial<PlatformExport>) => void;
}) {
  const wasMap = getChangedFields(changes);
  return (
    <FieldGrid>
      <FieldRow label="Name" changed={wasMap.has('name')} wasValue={wasMap.get('name')}>
        <TextInput value={value.name} onChange={(v) => onChange({ name: v })} />
      </FieldRow>
      <FieldRow label="Slug" hint="matching key — read-only">
        <ReadOnlyText value={value.slug} />
      </FieldRow>
      <FieldRow label="Logo URL" changed={wasMap.has('logo')} wasValue={wasMap.get('logo')}>
        <TextInput value={value.logo} onChange={(v) => onChange({ logo: v })} />
      </FieldRow>
      <FieldRow label="Is Audius" changed={wasMap.has('isAudius')} wasValue={wasMap.get('isAudius')}>
        <BoolInput value={value.isAudius} onChange={(v) => onChange({ isAudius: v })} />
      </FieldRow>
      <FieldRow label="Is Draft" changed={wasMap.has('isDraft')} wasValue={wasMap.get('isDraft')}>
        <BoolInput value={value.isDraft} onChange={(v) => onChange({ isDraft: v })} />
      </FieldRow>
    </FieldGrid>
  );
}

function FeatureFields({
  value,
  changes,
  onChange,
}: {
  value: FeatureExport;
  changes: FieldChange[] | null;
  onChange: (patch: Partial<FeatureExport>) => void;
}) {
  const wasMap = getChangedFields(changes);
  return (
    <FieldGrid>
      <FieldRow label="Name" changed={wasMap.has('name')} wasValue={wasMap.get('name')}>
        <TextInput value={value.name} onChange={(v) => onChange({ name: v })} />
      </FieldRow>
      <FieldRow label="Slug" hint="matching key — read-only">
        <ReadOnlyText value={value.slug} />
      </FieldRow>
      <FieldRow
        label="Description"
        changed={wasMap.has('description')}
        wasValue={wasMap.get('description')}
      >
        <TextareaInput
          value={value.description}
          onChange={(v) => onChange({ description: v })}
        />
      </FieldRow>
      <FieldRow
        label="Sort order"
        changed={wasMap.has('sortOrder')}
        wasValue={wasMap.get('sortOrder')}
      >
        <NumberInput value={value.sortOrder} onChange={(v) => onChange({ sortOrder: v })} />
      </FieldRow>
      <FieldRow label="Is Draft" changed={wasMap.has('isDraft')} wasValue={wasMap.get('isDraft')}>
        <BoolInput value={value.isDraft} onChange={(v) => onChange({ isDraft: v })} />
      </FieldRow>
    </FieldGrid>
  );
}

function ComparisonFields({
  value,
  changes,
  onChange,
}: {
  value: ComparisonExport;
  changes: FieldChange[] | null;
  onChange: (patch: Partial<ComparisonExport>) => void;
}) {
  const wasMap = getChangedFields(changes);
  const handleStatus = (status: ComparisonStatus) => {
    // Mirror the convention from FeatureComparisonCard: clear the fields that
    // aren't relevant for the new status. Context is valid on any visible
    // status — only 'skip' clears it.
    const patch: Partial<ComparisonExport> = { status };
    if (status !== 'custom') patch.displayValue = null;
    if (status === 'skip') patch.context = null;
    onChange(patch);
  };
  return (
    <FieldGrid>
      <FieldRow label="Platform" hint="matching key — read-only">
        <ReadOnlyText value={value.platformSlug} />
      </FieldRow>
      <FieldRow label="Feature" hint="matching key — read-only">
        <ReadOnlyText value={value.featureSlug} />
      </FieldRow>
      <FieldRow label="Status" changed={wasMap.has('status')} wasValue={wasMap.get('status')}>
        <StatusSelectInput value={value.status} onChange={handleStatus} />
      </FieldRow>
      {value.status === 'custom' && (
        <FieldRow
          label="Display value"
          changed={wasMap.has('displayValue')}
          wasValue={wasMap.get('displayValue')}
          hint="shown in the cell when status is custom (e.g. “320 kbps”)"
        >
          <TextInput
            value={value.displayValue ?? ''}
            onChange={(v) => onChange({ displayValue: v === '' ? null : v })}
          />
        </FieldRow>
      )}
      {value.status !== 'skip' && (
        <FieldRow
          label="Context"
          changed={wasMap.has('context')}
          wasValue={wasMap.get('context')}
          hint="optional note shown under the indicator"
        >
          <TextInput
            value={value.context ?? ''}
            onChange={(v) => onChange({ context: v === '' ? null : v })}
          />
        </FieldRow>
      )}
    </FieldGrid>
  );
}

// ---------------------------------------------------------------------------
// Form primitives
// ---------------------------------------------------------------------------

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2.5">{children}</div>;
}

function FieldRow({
  label,
  hint,
  changed,
  wasValue,
  children,
}: {
  label: string;
  hint?: string;
  changed?: boolean;
  wasValue?: unknown;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-x-3 gap-y-1 items-start">
      <label className="text-xs text-text-secondary sm:pt-1.5 flex items-center gap-1.5">
        {label}
        {changed && (
          <span
            title="This field is changing"
            className="inline-block w-1.5 h-1.5 rounded-full bg-status-warn"
          />
        )}
      </label>
      <div className="min-w-0">
        {children}
        {changed && wasValue !== undefined && (
          <div className="mt-1 text-xs text-text-muted font-mono break-words">
            was:{' '}
            <span className="line-through decoration-status-no/60">
              {stringify(wasValue)}
            </span>
          </div>
        )}
        {hint && !changed && <div className="mt-1 text-xs text-text-muted">{hint}</div>}
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-audius-purple focus:border-audius-purple';

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function TextareaInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={cn(inputClass, 'resize-y min-h-[72px] font-sans')}
    />
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      className={cn(inputClass, 'w-32 tabular-nums')}
    />
  );
}

function BoolInput({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-audius-purple"
      />
      <span className="text-text-secondary">{value ? 'true' : 'false'}</span>
    </label>
  );
}

function StatusSelectInput({
  value,
  onChange,
}: {
  value: ComparisonStatus;
  onChange: (v: ComparisonStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ComparisonStatus)}
      className={cn(inputClass, 'w-auto pr-8')}
    >
      <option value="skip">— (skip / blank)</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
      <option value="partial">Partial</option>
      <option value="custom">Custom</option>
    </select>
  );
}

function ReadOnlyText({ value }: { value: string }) {
  return (
    <div className="px-2.5 py-1.5 text-sm bg-surface/50 border border-dashed border-border rounded text-text-secondary font-mono break-all">
      {value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout components (sections, rows, summaries)
// ---------------------------------------------------------------------------

function NothingToApply({
  skipped,
  missing,
  onDone,
}: {
  skipped: number;
  missing: number;
  onDone: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-status-yes/15 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-status-yes"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-1">Nothing to apply</h2>
      <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
        Your upload matches the current data exactly.{' '}
        <span className="text-text-muted">
          {pluralize(skipped, 'identical row')}
          {missing > 0 && ` · ${pluralize(missing, 'row')} in DB not in upload (kept)`}
        </span>
      </p>
      <button
        onClick={onDone}
        className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-tint-05 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

function SummaryCards({
  totals,
  onSelectAll,
}: {
  totals: {
    created: number;
    updated: number;
    skipped: number;
    missing: number;
    selected: number;
    actionable: number;
  };
  onSelectAll: (value: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
        <Stat label="To create" value={totals.created} valueClass="text-status-yes" />
        <Stat label="To update" value={totals.updated} valueClass="text-status-warn" />
        <Stat label="Identical" value={totals.skipped} muted />
        <Stat label="Missing (kept)" value={totals.missing} muted />
      </div>
      <div className="border-t border-border px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          <span className="text-text-primary font-semibold">{totals.selected}</span> of{' '}
          {totals.actionable} selected
        </span>
        <div className="flex gap-3 text-xs">
          <button onClick={() => onSelectAll(true)} className="text-audius-purple hover:underline">
            Select all
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => onSelectAll(false)}
            className="text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
  muted,
}: {
  label: string;
  value: number;
  valueClass?: string;
  muted?: boolean;
}) {
  return (
    <div className="px-4 py-3">
      <div
        className={cn(
          'text-2xl font-semibold tabular-nums',
          valueClass ?? (muted ? 'text-text-muted' : 'text-text-primary'),
        )}
      >
        {value}
      </div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}

function DiffSection({
  title,
  actionableCount,
  selectedCount,
  skipped,
  missing,
  onSetAll,
  children,
}: {
  title: string;
  actionableCount: number;
  selectedCount: number;
  skipped: { key: string; label: string }[];
  missing: { key: string; label: string }[];
  onSetAll: (value: boolean) => void;
  children: React.ReactNode;
}) {
  if (actionableCount === 0 && skipped.length === 0 && missing.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-surface-alt overflow-hidden">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-semibold">{title}</h2>
          {actionableCount > 0 ? (
            <span className="text-xs text-text-muted">
              {selectedCount} of {actionableCount} selected
            </span>
          ) : (
            <span className="text-xs text-text-muted">No changes</span>
          )}
        </div>
        {actionableCount > 0 && (
          <div className="flex items-center gap-3 text-xs flex-shrink-0">
            <button onClick={() => onSetAll(true)} className="text-audius-purple hover:underline">
              Select all
            </button>
            <button
              onClick={() => onSetAll(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              Clear
            </button>
          </div>
        )}
      </header>

      {children}

      {(skipped.length > 0 || missing.length > 0) && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          {skipped.length > 0 && (
            <CollapsedList label={`${skipped.length} identical (skipped)`} items={skipped} />
          )}
          {missing.length > 0 && (
            <CollapsedList
              label={`${missing.length} in DB but not in upload (kept)`}
              items={missing}
            />
          )}
        </div>
      )}
    </section>
  );
}

function CollapsedList({
  label,
  items,
}: {
  label: string;
  items: { key: string; label: string }[];
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs text-text-muted hover:text-text-secondary list-none flex items-center gap-1.5">
        <svg
          className="w-3 h-3 transition-transform group-open:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {label}
      </summary>
      <ul className="mt-2 ml-4 text-xs text-text-secondary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
        {items.map((s) => (
          <li key={s.key} className="font-mono truncate">
            {s.label}
          </li>
        ))}
      </ul>
    </details>
  );
}

function Group({
  title,
  badgeClass,
  children,
}: {
  title: string;
  badgeClass: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', badgeClass)}>{title}</span>
      </div>
      <ul>{children}</ul>
    </div>
  );
}

function EditableRow({
  primary,
  secondary,
  checked,
  onToggle,
  hasEdits,
  onReset,
  children,
}: {
  primary: string;
  secondary: string;
  checked: boolean;
  onToggle: () => void;
  hasEdits: boolean;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className="border-t border-border first:border-t-0">
      <div
        className={cn(
          'px-4 py-3 transition-colors',
          checked ? 'bg-audius-purple/5' : 'bg-transparent',
        )}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="mt-1.5 accent-audius-purple"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">{primary}</span>
                <span className="text-xs text-text-muted">{secondary}</span>
                {hasEdits && (
                  <span className="text-xs text-audius-purple">· edited</span>
                )}
              </div>
              {hasEdits && (
                <button
                  onClick={onReset}
                  className="text-xs text-text-secondary hover:text-text-primary whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="ml-0">{children}</div>
          </div>
        </div>
      </div>
    </li>
  );
}

function ApplyBar({
  selected,
  missing,
  isApplying,
  onCancel,
  onApply,
}: {
  selected: number;
  missing: number;
  isApplying: boolean;
  onCancel: () => void;
  onApply: () => void;
}) {
  return (
    // Fixed to the viewport. Left edge is 0 on narrow screens (sidebar is in
    // a drawer) and 64 on md+ (where the sidebar is visible).
    <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 border-t border-border bg-surface-alt/95 backdrop-blur supports-[backdrop-filter]:bg-surface-alt/80">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-3">
        <div className="text-sm min-w-0">
          {selected > 0 ? (
            <span className="text-text-secondary">
              <span className="text-text-primary font-semibold">{selected}</span>{' '}
              {pluralize(selected, 'change', { hideNumber: true })} selected
              {missing > 0 && (
                <span className="text-text-muted hidden sm:inline">
                  {' '}
                  · {pluralize(missing, 'missing row')} will be kept
                </span>
              )}
            </span>
          ) : (
            <span className="text-text-muted">No changes selected</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={isApplying}
            className="px-3 sm:px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-tint-05 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            disabled={isApplying || selected === 0}
            className="px-4 sm:px-5 py-2 bg-audius-purple text-text-primary text-sm font-medium rounded-lg hover:bg-audius-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isApplying ? (
              'Applying…'
            ) : selected > 0 ? (
              <>
                {/* Long label on roomy viewports, short label otherwise */}
                <span className="hidden sm:inline">
                  Apply {selected} {pluralize(selected, 'change', { hideNumber: true })}
                </span>
                <span className="sm:hidden">Apply ({selected})</span>
              </>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glyphs & helpers
// ---------------------------------------------------------------------------

function DownloadGlyph() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
      />
    </svg>
  );
}

function UploadGlyph() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12"
      />
    </svg>
  );
}

function pluralize(n: number, noun: string, opts: { hideNumber?: boolean } = {}) {
  const word = `${noun}${n === 1 ? '' : 's'}`;
  return opts.hideNumber ? word : `${n} ${word}`;
}

function stringify(v: unknown): string {
  if (v === null) return 'null';
  if (typeof v === 'string') {
    return v.length > 80 ? JSON.stringify(v.slice(0, 80) + '…') : JSON.stringify(v);
  }
  return String(v);
}
