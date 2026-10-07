/**
 * Format a number as Bangladeshi Taka currency.
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '৳0';
    return '৳' + value.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

/**
 * Format a number with thousands separators and optional unit.
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format a date string (yyyy-MM-dd) as "Tuesday, Oct 5".
 */
export function formatDateLong(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a date string (yyyy-MM-dd) as "4 Oct" or "4 Oct 2026" (if not current year).
 */
export function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
    };
    if (date.getFullYear() !== now.getFullYear()) {
        opts.year = 'numeric';
    }
    return date.toLocaleDateString('en-GB', opts);
}