import React from 'react';
import { Spinner } from './LoadingSkeletons';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  hapticFeedback?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  hapticFeedback = true,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback simulation (vibration API)
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-indigo-400/30',
    secondary: 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 border-red-400/30',
    success: 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 border-green-400/30',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const baseClasses = `
    relative overflow-hidden
    font-black uppercase tracking-widest
    rounded-2xl border
    transition-all duration-200
    flex items-center justify-center gap-2
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    group
    ${fullWidth ? 'w-full' : ''}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <button
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-200" />

      {/* Loading spinner */}
      {loading && <Spinner size="sm" />}

      {/* Icon and children */}
      {!loading && (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span className="flex-1">{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
