import React from 'react';

// Base Skeleton Component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

// Driver Bid Card Skeleton
export const BidCardSkeleton: React.FC = () => (
  <div className="bg-[#0f0f12] border border-white/5 p-5 rounded-[2.5rem] animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-3xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-8 w-20 ml-auto" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  </div>
);

// List of Bid Cards
export const BidListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <BidCardSkeleton key={i} />
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2 animate-pulse">
    <Skeleton className="h-3 w-3 mx-auto" />
    <Skeleton className="h-3 w-16 mx-auto" />
    <Skeleton className="h-6 w-20 mx-auto" />
  </div>
);

// Dashboard Header Skeleton
export const DashboardHeaderSkeleton: React.FC = () => (
  <div className="p-6 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-10 w-24 rounded-xl" />
  </div>
);

// Map Skeleton
export const MapSkeleton: React.FC = () => (
  <div className="w-full h-full rounded-[3rem] overflow-hidden bg-[#0a0a0f] relative animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
    <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-indigo-600/30 rounded-full blur-2xl animate-ping" />
    <div className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-purple-600/30 rounded-full blur-2xl animate-ping" style={{ animationDelay: '1s' }} />
  </div>
);

// Form Input Skeleton
export const FormInputSkeleton: React.FC = () => (
  <div className="space-y-2 animate-pulse">
    <Skeleton className="h-3 w-24 ml-2" />
    <Skeleton className="h-12 w-full rounded-2xl" />
  </div>
);

// Button Skeleton
export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton className={`h-14 w-full rounded-2xl ${className}`} />
);

// Full Screen Loading
export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[300]">
    <div className="relative w-32 h-32 mb-8">
      <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <div className="absolute inset-4 border-2 border-purple-500/20 border-b-transparent rounded-full animate-spin-reverse" style={{ animationDuration: '2s' }} />
    </div>
    <p className="text-white font-black uppercase tracking-[0.3em] text-sm animate-pulse">
      {message}
    </p>
  </div>
);

// Spinner (inline loader)
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={`${sizeClasses[size]} border-white/20 border-t-white rounded-full animate-spin ${className}`} />
  );
};

// Pulse Loader (3 dots)
export const PulseLoader: React.FC = () => (
  <div className="flex items-center gap-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

// Progress Bar
export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({
  progress,
  className = ''
}) => (
  <div className={`w-full h-2 bg-white/5 rounded-full overflow-hidden ${className}`}>
    <div
      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// Shimmer Effect Wrapper
export const ShimmerWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`relative overflow-hidden ${className}`}>
    {children}
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

export default {
  Skeleton,
  BidCardSkeleton,
  BidListSkeleton,
  StatsCardSkeleton,
  DashboardHeaderSkeleton,
  MapSkeleton,
  FormInputSkeleton,
  ButtonSkeleton,
  FullScreenLoader,
  Spinner,
  PulseLoader,
  ProgressBar,
  ShimmerWrapper,
};
