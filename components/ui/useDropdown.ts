// components/ui/useDropdown.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared dropdown/menu behavior: open state, outside-click + Escape to close
 * (Escape returns focus to the trigger), and roving arrow-key navigation over
 * the panel's [role="menuitem"] elements.
 *
 * The consuming component owns all markup; it wires up:
 * - containerRef on the wrapper around trigger + panel
 * - onTriggerKeyDown on the trigger button (ArrowDown/Up opens + focuses)
 * - onMenuKeyDown on the panel (ArrowDown/Up/Home/End roving focus)
 */
export function useDropdown<T extends HTMLElement = HTMLDivElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<T | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      containerRef.current
        ?.querySelector<HTMLElement>('[aria-haspopup]')
        ?.focus();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getItems = useCallback((): HTMLElement[] => {
    return Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );
  }, []);

  const focusItem = useCallback((which: 'first' | 'last') => {
    // Panel may not be in the DOM/visible until after the state flush
    requestAnimationFrame(() => {
      const items = getItems();
      if (!items.length) return;
      (which === 'first' ? items[0] : items[items.length - 1]).focus();
    });
  }, [getItems]);

  const onTriggerKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      focusItem('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      focusItem('last');
    }
  }, [focusItem]);

  const onMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = getItems();
    if (!items.length) return;
    event.preventDefault();

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (event.key === 'ArrowDown') next = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    else if (event.key === 'ArrowUp') next = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'End') next = items.length - 1;
    items[next].focus();
  }, [getItems]);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    containerRef,
    onTriggerKeyDown,
    onMenuKeyDown,
    focusItem,
  };
}
