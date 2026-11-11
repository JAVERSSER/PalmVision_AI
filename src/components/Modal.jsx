import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Accessible modal dialog (Esc to close, focus moved into the dialog). */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    setTimeout(() => ref.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`glass relative w-full ${width} rounded-2xl bg-surface p-6 shadow-2xl outline-none`}
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.97 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-ink" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-muted">{children}</div>
            {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
