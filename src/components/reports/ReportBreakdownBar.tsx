import { formatCurrency } from '@/lib/format';

interface Props {
    label: string;
    amount: number;
    maxAmount: number;
    color?: 'green' | 'red';
}

export function ReportBreakdownBar({ label, amount, maxAmount, color = 'green' }: Props) {
    const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

    const barClass = color === 'green' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="py-2">
            <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm font-medium text-gray-700 truncate">
                    {label}
                </span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatCurrency(amount)}
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barClass} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}