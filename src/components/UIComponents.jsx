// Reusable component system using Tailwind design tokens
import React from 'react';

// Card component with consistent styling
export const Card = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'backdrop-blur-sm rounded-lg border border-gray-700/50 transition-all duration-200';
  
  const variants = {
    default: 'bg-gray-800/50 p-6',
    compact: 'bg-gray-800/50 p-4',
    highlight: 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6',
    chart: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4'
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Metric display component
export const MetricCard = ({ title, value, color = 'gray', icon = '', className = '' }) => {
  const colorClasses = {
    red: 'bg-red-900/30 border-red-700/50 text-red-400',
    orange: 'bg-orange-900/30 border-orange-700/50 text-orange-400',
    yellow: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400',
    blue: 'bg-blue-900/30 border-blue-700/50 text-blue-400',
    green: 'bg-green-900/30 border-green-700/50 text-green-400',
    purple: 'bg-purple-900/30 border-purple-700/50 text-purple-400',
    gray: 'bg-gray-700/50 border-gray-600/50 text-gray-400'
  };
  
  return (
    <div className={`rounded-lg p-4 text-center border ${colorClasses[color]} ${className}`}>
      <h4 className="text-sm font-medium mb-2 opacity-90">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h4>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
};

// Button component with consistent styling
export const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const baseClasses = 'font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white',
    warning: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white',
    outline: 'border-2 border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white bg-transparent'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Progress bar component
export const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`w-full bg-gray-700 rounded-full h-3 overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Section header component
export const SectionHeader = ({ title, subtitle, icon = '', className = '' }) => {
  return (
    <div className={`text-center mb-6 ${className}`}>
      <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Grid layout component
export const Grid = ({ children, cols = 1, gap = 4, className = '' }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
  };
  
  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };
  
  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Callout component for achievements/notifications
export const Callout = ({ title, value, description, color = 'blue', icon = '', className = '' }) => {
  const colorClasses = {
    blue: 'from-blue-800/30 to-blue-900/30 border-blue-700/50 text-blue-300',
    green: 'from-green-800/30 to-emerald-800/30 border-green-700/50 text-green-300',
    orange: 'from-orange-800/30 to-red-800/30 border-orange-700/50 text-orange-300',
    purple: 'from-purple-800/30 to-pink-800/30 border-purple-700/50 text-purple-300',
    gray: 'from-gray-800/30 to-gray-900/30 border-gray-700/50 text-gray-300'
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 border ${className}`}>
      <h3 className="text-lg font-bold mb-2 flex items-center">
        {icon && <span className="mr-2 text-xl">{icon}</span>}
        {title}
      </h3>
      <div className="text-2xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-lg opacity-90">
        {description}
      </div>
    </div>
  );
};

// Loading component
export const Loading = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]} ${className}`}></div>
  );
};

// Badge component
export const Badge = ({ children, color = 'gray', size = 'sm', className = '' }) => {
  const colorClasses = {
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClasses[color]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
