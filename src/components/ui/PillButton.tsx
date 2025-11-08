import React from 'react';

type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline';
  height?: number; // px
  fullWidth?: boolean;
};

export default function PillButton({
  variant = 'solid',
  height = 56,
  fullWidth = true,
  style,
  className = '',
  children,
  ...rest
}: PillButtonProps) {
  const base: React.CSSProperties = {
    height,
    borderRadius: 9999,
    fontWeight: 700,
    transition: 'all 300ms cubic-bezier(0.22,1,0.36,1)',
    WebkitTapHighlightColor: 'transparent',
  };
  const solid: React.CSSProperties = {
    background: 'var(--text)',
    color: 'var(--bg)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.18)'
  };
  const outline: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text)',
    border: '2px solid var(--border)'
  };
  return (
    <button
      className={`pressable ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ ...(base as any), ...(variant === 'solid' ? solid : outline), ...(style || {}) }}
      {...rest}
    >
      {children}
    </button>
  );
}
