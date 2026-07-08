import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, Loader2 } from 'lucide-react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'sm',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className
}: ActionButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        'focus:ring-blue-500',
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
        <span>{children}</span>
        {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
      </div>
    </Button>
  );
}

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon: LucideIcon;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon: Icon,
  tooltip,
  variant = 'primary',
  size = 'md',
  className
}: FloatingActionButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/25',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25'
  };

  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50',
        variants[variant],
        sizes[size],
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
}

interface ButtonGroupProps {
  buttons: {
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
  }[];
  variant?: 'default' | 'outline';
  size?: 'sm' | 'lg';
  className?: string;
}

export function ButtonGroup({ buttons, variant = 'default', size = 'sm', className }: ButtonGroupProps) {
  const variants = {
    default: {
      base: 'bg-white border border-gray-300',
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'text-gray-700 hover:bg-gray-50'
    },
    outline: {
      base: 'bg-transparent border border-gray-300',
      active: 'bg-blue-50 text-blue-700 border-blue-300',
      inactive: 'text-gray-700 hover:bg-gray-50'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div className={cn('inline-flex rounded-md shadow-sm', className)}>
      {buttons.map((button, index) => {
        const Icon = button.icon;
        const isFirst = index === 0;
        const isLast = index === buttons.length - 1;
        
        return (
          <Button
            key={button.id}
            onClick={button.onClick}
            disabled={button.disabled}
            className={cn(
              'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10',
              variants[variant].base,
              button.active ? variants[variant].active : variants[variant].inactive,
              sizes[size],
              isFirst && 'rounded-l-md',
              isLast && 'rounded-r-md',
              !isFirst && !isLast && 'rounded-none',
              !isFirst && '-ml-px'
            )}
          >
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{button.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  icon: Icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  tooltip,
  disabled = false,
  className
}: IconButtonProps) {
  const variants = {
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    solid: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function LoadingButton({
  children,
  onClick,
  loading = false,
  loadingText = 'Cargando...',
  variant = 'default',
  size = 'sm',
  disabled = false,
  className
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      <div className="flex items-center space-x-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{loading ? loadingText : children}</span>
      </div>
    </Button>
  );
}