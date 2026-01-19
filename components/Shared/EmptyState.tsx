import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Animated icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-8 bg-indigo-600/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
          <Icon className="w-12 h-12 text-gray-600" />
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest max-w-md mb-6">
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
