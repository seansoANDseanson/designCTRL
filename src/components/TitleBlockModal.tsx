import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSheetStore } from '../stores/useSheetStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FIELDS: { key: keyof ReturnType<typeof useSheetStore.getState>['titleBlock']; label: string; placeholder: string }[] = [
  { key: 'projectName',   label: 'PROJECT NAME',   placeholder: 'City Hall HVAC Upgrade' },
  { key: 'projectNumber', label: 'PROJECT NO.',     placeholder: '2024-0042' },
  { key: 'client',        label: 'CLIENT',          placeholder: 'City of Springfield' },
  { key: 'address',       label: 'ADDRESS',         placeholder: '123 Main St, Springfield' },
  { key: 'drawnBy',       label: 'DRAWN BY',        placeholder: 'S.E.' },
  { key: 'checkedBy',     label: 'CHECKED BY',      placeholder: 'J.D.' },
  { key: 'engineer',      label: 'ENGINEER',        placeholder: 'Jane Doe, PE' },
  { key: 'scale',         label: 'SCALE',           placeholder: '1" = 1\'' },
  { key: 'notes',         label: 'NOTES',           placeholder: 'FOR CONSTRUCTION' },
];

export function TitleBlockModal({ open, onClose }: Props) {
  const titleBlock    = useSheetStore(s => s.titleBlock);
  const updateTitleBlock = useSheetStore(s => s.updateTitleBlock);
  const overlayRef    = useRef<HTMLDivElement>(null);

  // Close on overlay click
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => { if (e.target === el) onClose(); };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="modal-overlay" ref={overlayRef}>
          <motion.div
            className="title-block-modal"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <div className="modal-header">
              <span className="bracket-label">╔ TITLE BLOCK ╗</span>
              <button className="modal-close" onClick={onClose} title="Close">✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-hint">
                These fields appear on exported PDFs. They do not affect canvas objects.
              </p>

              <div className="tb-grid">
                {FIELDS.map(({ key, label, placeholder }) => (
                  <div className="tb-field" key={key}>
                    <label className="tb-label">{label}</label>
                    <input
                      className="tb-input"
                      type="text"
                      value={(titleBlock as any)[key]}
                      placeholder={placeholder}
                      onChange={e => updateTitleBlock(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={onClose}>SAVE &amp; CLOSE</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
