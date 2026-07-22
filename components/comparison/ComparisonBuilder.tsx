// components/comparison/ComparisonBuilder.tsx
'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buildComparePath } from '@/lib/compare';
import { MAX_COMPETITORS } from '@/lib/constants';
import { useDropdown } from '@/components/ui/useDropdown';
import { ChevronDownIcon, PlusIcon, XIcon } from '@/components/ui/Icon';
import type { Platform } from '@/types';

interface ComparisonBuilderProps {
  /** Currently selected competitors, in URL order */
  competitors: Platform[];
  /** All published competitors (swap menus) */
  allCompetitors: Platform[];
  /**
   * Competitors that would keep ≥1 row if added. The "+" menu only offers
   * these; when empty, the + button doesn't render at all.
   */
  addableCompetitors: Platform[];
}

/**
 * The interactive part of the page H1:
 *   Audius vs. [Bandcamp ▾] vs. [SoundCloud ▾] [+]
 *
 * Each token is a menu that swaps that column for another platform (or
 * removes it); the + appends a column up to MAX_COMPETITORS. The URL is the
 * only state — every action is a router.push.
 */
export function ComparisonBuilder({
  competitors,
  allCompetitors,
  addableCompetitors,
}: ComparisonBuilderProps) {
  const router = useRouter();
  const slugs = competitors.map((c) => c.slug);
  const available = allCompetitors.filter((c) => !slugs.includes(c.slug));

  const navigate = (next: string[]) => {
    if (next.length === 0) return;
    router.push(buildComparePath(next));
  };

  return (
    <>
      {competitors.map((platform, index) => (
        <span key={platform.slug} className="block md:inline md:ml-3">
          <span aria-hidden>vs.</span>{' '}
          <PlatformToken
            platform={platform}
            options={[platform, ...available]}
            canRemove={competitors.length > 1}
            onSelect={(slug) => {
              const next = [...slugs];
              next[index] = slug;
              navigate(next);
            }}
            onRemove={() => navigate(slugs.filter((_, i) => i !== index))}
          />
        </span>
      ))}

      {competitors.length < MAX_COMPETITORS && addableCompetitors.length > 0 && (
        <AddPlatformButton
          options={addableCompetitors}
          onSelect={(slug) => navigate([...slugs, slug])}
        />
      )}
    </>
  );
}

/** Shared dropdown panel chrome (font resets — we're inside a display H1) */
function MenuPanel({
  isOpen,
  onKeyDown,
  children,
}: {
  isOpen: boolean;
  onKeyDown: (event: React.KeyboardEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 block',
        'w-[min(340px,calc(100vw-2rem))]',
        'font-sans font-normal tracking-normal normal-case leading-normal text-left',
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      )}
      role="menu"
      onKeyDown={onKeyDown}
    >
      <span className="relative block overflow-hidden rounded-2xl border border-white/10 py-2 shadow-2xl shadow-black/60">
        <span className="absolute inset-0 block bg-neutral-950/85 backdrop-blur-2xl" />
        <span
          className={cn(
            'relative z-10 block origin-top transition-all duration-200',
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
          )}
        >
          {children}
        </span>
      </span>
    </span>
  );
}

function MenuItem({
  onClick,
  isActive,
  danger,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2.5 text-left rounded-xl',
        'text-sm font-sans font-semibold transition-colors duration-150',
        'focus-visible:outline-none focus-visible:bg-white/10',
        isActive
          ? 'bg-audius-purple/15 text-white'
          : danger
            ? 'text-red-400/90 hover:bg-red-500/10 hover:text-red-300'
            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function PlatformToken({
  platform,
  options,
  canRemove,
  onSelect,
  onRemove,
}: {
  platform: Platform;
  options: Platform[];
  canRemove: boolean;
  onSelect: (slug: string) => void;
  onRemove: () => void;
}) {
  const { isOpen, close, toggle, containerRef, onTriggerKeyDown, onMenuKeyDown } =
    useDropdown<HTMLSpanElement>();

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'inline-flex items-center gap-1.5 pb-1 font-black tracking-tight',
          'border-b transition-all duration-200 focus-visible:outline-none',
          isOpen
            ? 'border-audius-purple text-audius-purple'
            : 'border-white/10 text-text-primary hover:text-audius-purple hover:border-white/20 focus-visible:text-audius-purple focus-visible:border-audius-purple'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${platform.name} — change or remove this platform`}
      >
        <span>{platform.name}</span>
        <ChevronDownIcon
          className={cn(
            'h-[0.35em] w-[0.35em] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <MenuPanel isOpen={isOpen} onKeyDown={onMenuKeyDown}>
        <span className="block px-2 space-y-1">
          {options.map((option) => (
            <MenuItem
              key={option.slug}
              isActive={option.slug === platform.slug}
              onClick={() => {
                close();
                if (option.slug !== platform.slug) onSelect(option.slug);
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </span>
        {canRemove && (
          <>
            <span className="block mx-3 my-2 border-t border-white/10" />
            <span className="block px-2">
              <MenuItem
                danger
                onClick={() => {
                  close();
                  onRemove();
                }}
              >
                <XIcon className="w-4 h-4" aria-hidden />
                Remove
              </MenuItem>
            </span>
          </>
        )}
      </MenuPanel>
    </span>
  );
}

function AddPlatformButton({
  options,
  onSelect,
}: {
  options: Platform[];
  onSelect: (slug: string) => void;
}) {
  const { isOpen, close, toggle, containerRef, onTriggerKeyDown, onMenuKeyDown } =
    useDropdown<HTMLSpanElement>();

  return (
    <span
      ref={containerRef}
      className="relative inline-block align-baseline md:ml-4 mt-2 md:mt-0"
    >
      <button
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'inline-flex items-center justify-center rounded-full border-2 align-middle',
          'h-[0.55em] w-[0.55em] min-h-10 min-w-10',
          'transition-all duration-200 focus-visible:outline-none',
          isOpen
            ? 'border-audius-purple text-audius-purple rotate-45'
            : 'border-white/15 text-text-secondary hover:border-audius-purple hover:text-audius-purple focus-visible:border-audius-purple focus-visible:text-audius-purple'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Add a platform to the comparison"
      >
        <PlusIcon className="h-[55%] w-[55%]" aria-hidden />
      </button>

      <MenuPanel isOpen={isOpen} onKeyDown={onMenuKeyDown}>
        <span className="block px-3 pt-1 pb-2 text-xs font-sans font-semibold text-neutral-500">
          Add to comparison
        </span>
        <span className="block px-2 space-y-1">
          {options.map((option) => (
            <MenuItem
              key={option.slug}
              onClick={() => {
                close();
                onSelect(option.slug);
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </span>
      </MenuPanel>
    </span>
  );
}
