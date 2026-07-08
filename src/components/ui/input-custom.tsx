import React, { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, Calendar, Clock, LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>((
  {
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className,
    helperText
  },
  ref
) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

interface PasswordInputProps {
  label: string;
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showStrength?: boolean;
}

export function PasswordInput({
  label,
  id,
  placeholder = 'Ingresa tu contraseña',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className,
  showStrength = false
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^\w\s]/.test(password)) score++;

    const levels = [
      { label: 'Muy débil', color: 'bg-red-500' },
      { label: 'Débil', color: 'bg-orange-500' },
      { label: 'Regular', color: 'bg-yellow-500' },
      { label: 'Fuerte', color: 'bg-blue-500' },
      { label: 'Muy fuerte', color: 'bg-green-500' }
    ];

    return { score, ...levels[score] };
  };

  const strength = showStrength && value ? getPasswordStrength(value) : null;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {strength && (
        <div className="space-y-1">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  level <= strength.score ? strength.color : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Fortaleza: <span className="font-medium">{strength.label}</span>
          </p>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SearchInput({
  placeholder = 'Buscar...',
  value,
  onChange,
  onSearch,
  className,
  disabled = false
}: SearchInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value || '');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="pl-10 pr-4"
      />
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  helperText?: string;
}

export function FormTextarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  className,
  helperText
}: FormTextareaProps) {
  const currentLength = value?.length || 0;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'w-full resize-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
      />
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
        {maxLength && (
          <p className="text-xs text-gray-500">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

interface IconInputProps {
  icon: LucideIcon;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function IconInput({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  className
}: IconInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          'pl-10 pr-4',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

interface DateTimeInputProps {
  label: string;
  id: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'date' | 'time' | 'datetime-local';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export function DateTimeInput({
  label,
  id,
  value,
  onChange,
  type = 'date',
  error,
  required = false,
  disabled = false,
  min,
  max,
  className
}: DateTimeInputProps) {
  const Icon = type === 'time' ? Clock : Calendar;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'pl-10 pr-4',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}