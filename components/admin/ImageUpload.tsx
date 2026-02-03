'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  /** Current image URL */
  value: string;
  /** Callback when image URL changes */
  onChange: (url: string) => void;
  /** Disable interactions */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
}

interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

interface UploadError {
  error: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file upload to API
  const uploadFile = useCallback(async (file: File) => {
    // Reset state
    setError(null);
    setIsUploading(true);

    try {
      // Client-side validation (matches server)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: PNG, JPG, WebP, SVG');
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 2MB`);
      }

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse | UploadError = await response.json();

      if (!response.ok) {
        throw new Error((data as UploadError).error || 'Upload failed');
      }

      // Success - update parent with new URL
      onChange((data as UploadResponse).url);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [uploadFile]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else if (file) {
      setError('Please drop an image file');
    }
  }, [disabled, isUploading, uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Click to open file picker
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }, [disabled, isUploading]);

  // Clear error when value changes externally
  const handleManualUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          'flex flex-col items-center justify-center min-h-[140px] p-4',
          'cursor-pointer',
          // States
          isDragging && 'border-audius-purple bg-audius-purple/10',
          !isDragging && !disabled && 'border-border hover:border-border-light hover:bg-tint-05',
          disabled && 'border-border bg-tint-05 cursor-not-allowed opacity-60',
          isUploading && 'cursor-wait'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload image"
        aria-disabled={disabled}
      >
        {isUploading ? (
          // Uploading state
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-audius-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary font-medium">Uploading...</span>
          </div>
        ) : value ? (
          // Preview state
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-raised border border-border">
              <Image
                src={value}
                alt="Logo preview"
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </div>
            <span className="text-xs text-text-muted">Click or drag to replace</span>
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <svg
              className="w-12 h-12 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-center">
              <span className="text-sm font-medium text-text-secondary">
                Drop image here
              </span>
              <span className="text-sm text-text-muted"> or click to upload</span>
            </div>
            <span className="text-xs text-text-muted">PNG, JPG, WebP, SVG • Max 2MB</span>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-status-no" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Manual URL Fallback */}
      <details className="text-sm group">
        <summary className="text-text-muted cursor-pointer hover:text-text-primary select-none">
          <span className="ml-1">Or enter URL manually</span>
        </summary>
        <div className="mt-2">
          <input
            type="url"
            value={value}
            onChange={handleManualUrlChange}
            placeholder="https://example.com/logo.png"
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-alt text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-audius-purple focus:border-transparent',
              'disabled:bg-tint-05 disabled:text-text-muted'
            )}
          />
        </div>
      </details>
    </div>
  );
}
