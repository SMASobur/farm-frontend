import type { ReactNode } from 'react';

interface FieldProps {
    label: string;
    htmlFor: string;
    required?: boolean;
    error?: string;
    help?: string;
    children: ReactNode;
}

export function Field({ label, htmlFor, required, error, help, children }: FieldProps) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error ? (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            ) : help ? (
                <p className="text-xs text-gray-500 mt-1">{help}</p>
            ) : null}
        </div>
    );
}