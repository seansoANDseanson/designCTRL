import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidGlassPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: { x: number; y: number };
}

export function LiquidGlassPanel({ isOpen, onClose, title, children, position }: LiquidGlassPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="liquid-glass-panel"
          style={position ? { left: position.x, top: position.y } : undefined}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
          drag
          dragMomentum={false}
        >
          <div className="lgp-header">
            <span className="lgp-title">{title}</span>
            <button className="lgp-close" onClick={onClose}>\u2715</button>
          </div>
          <div className="lgp-body">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
