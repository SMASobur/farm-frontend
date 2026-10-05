import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ hasError, className = '', children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                {...props}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base bg-white transition ${
                    hasError ? 'border-red-300' : 'border-gray-300'
                } ${className}`}
            >
                {children}
            </select>
        );
    }
);

Select.displayName = 'Select';