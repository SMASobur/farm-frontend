import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ hasError, className = '', ...props }, ref) => {
        return (
            <input
                ref={ref}
                {...props}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base transition ${
                    hasError
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                } ${className}`}
            />
        );
    }
);

Input.displayName = 'Input';