'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
  onChange?: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ value, min, max, step = 1, disabled, label, error, className, onChange }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className={twMerge(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-webkit-slider-thumb]:transition-colors',
              '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:hover:bg-blue-700 [&::-moz-range-thumb]:transition-colors',
              error && 'ring-2 ring-red-500',
              className
            )}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
            <span>{min}</span>
            <span>{value}</span>
            <span>{max}</span>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';