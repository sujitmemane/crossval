import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  tone?: 'neutral' | 'success' | 'warning';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
};

const toneStripClasses = {
  neutral: 'bg-surfaceMuted',
  success: 'bg-accentSoft',
  warning: 'bg-warningSoft',
};

export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  tone = 'neutral',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-foreground/55 backdrop-blur-[1px]" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative flex w-full ${sizeClasses[size]} max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl`}
      >
        <div className={`h-1 shrink-0 ${toneStripClasses[tone]}`} />

        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-mutedForeground transition-colors hover:bg-surfaceMuted hover:text-muted"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-border bg-surfaceMuted/20 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
