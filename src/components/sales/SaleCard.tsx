import { Link } from 'react-router-dom';
import type { Sale } from '@/types';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { Calendar } from 'lucide-react';

export function SaleCard({ sale }: { sale: Sale }) {
    const hasDue = sale.dueAmount > 0;
    const displayName = sale.customProductName || sale.categoryName;

    return (
        <Link
            to={`/sales/${sale.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">
                        {sale.customerName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={12} />
                        {formatDateShort(sale.date)}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {displayName}
                </span>
                <span className="text-gray-300">·</span>
                <span>
                    {sale.quantity} {sale.unitAbbreviation || sale.unitName}
                </span>
                <span className="text-gray-300">×</span>
                <span>{formatCurrency(sale.unitPrice)}</span>
            </div>

            <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-100">
                <div>
                    <span className="text-gray-500">Paid</span>{' '}
                    <span className="font-semibold text-green-700">
                        {formatCurrency(sale.paidAmount)}
                    </span>
                </div>
                {hasDue ? (
                    <div>
                        <span className="text-gray-500">Due</span>{' '}
                        <span className="font-semibold text-amber-700">
                            {formatCurrency(sale.dueAmount)}
                        </span>
                    </div>
                ) : (
                    <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        Paid in full
                    </span>
                )}
            </div>
        </Link>
    );
}