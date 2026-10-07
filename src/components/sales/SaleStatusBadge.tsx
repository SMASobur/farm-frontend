import { formatCurrency } from '@/lib/format';

interface Props {
    paidAmount: number;
    dueAmount: number;
    size?: 'sm' | 'md';
}

export function SaleStatusBadge({ paidAmount: _paidAmount, dueAmount, size = 'md' }: Props) {
    const isPaid = dueAmount <= 0;
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

    if (isPaid) {
        return (
            <span className={`inline-flex items-center rounded-full font-semibold bg-green-100 text-green-700 ${sizeClass}`}>
                Paid in full
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-amber-100 text-amber-700 ${sizeClass}`}>
            Due {formatCurrency(dueAmount)}
        </span>
    );
}