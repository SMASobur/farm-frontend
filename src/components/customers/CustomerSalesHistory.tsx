import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { listSalesByCustomer } from '@/api/sales';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { Sale } from '@/types';

export function CustomerSalesHistory({ customerId }: { customerId: number }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['customer', customerId, 'sales'],
        queryFn: () => listSalesByCustomer(customerId),
        enabled: Number.isFinite(customerId),
    });

    const sales: Sale[] = data?.data ?? [];

    // Compute total dues from sales
    const totalDue = sales.reduce((sum, s) => sum + s.dueAmount, 0);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingCart size={14} />
                    Sales History
                </h2>
                <span className="text-xs text-gray-400">
                    {isLoading ? '…' : `${sales.length} sale${sales.length === 1 ? '' : 's'}`}
                </span>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 shimmer rounded"></div>
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <p className="text-sm text-red-600 text-center py-6">
                    Failed to load sales history.
                </p>
            )}

            {/* Empty */}
            {!isLoading && !isError && sales.length === 0 && (
                <div className="text-center py-8">
                    <ShoppingCart className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No sales recorded yet</p>
                </div>
            )}

            {/* Sales list */}
            {!isLoading && !isError && sales.length > 0 && (
                <>
                    <div className="space-y-2">
                        {sales.map((sale) => (
                            <SaleRow key={sale.id} sale={sale} />
                        ))}
                    </div>

                    {/* Total dues summary */}
                    {totalDue > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total outstanding</span>
                            <span className="text-base font-bold text-amber-700">
                                {formatCurrency(totalDue)}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ============================================================
// Single sale row
// ============================================================

function SaleRow({ sale }: { sale: Sale }) {
    const hasDue = sale.dueAmount > 0;
    const displayName = sale.customProductName || sale.categoryName;

    return (
        <Link
            to={`/sales/${sale.id}`}
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 transition"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                            {displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {sale.quantity} {sale.unitAbbreviation || sale.unitName}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">
                        {formatDateShort(sale.date)}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="font-semibold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                    </div>
                    {hasDue ? (
                        <div className="text-xs text-amber-700 font-medium mt-0.5">
                            Due {formatCurrency(sale.dueAmount)}
                        </div>
                    ) : (
                        <div className="text-xs text-green-600 font-medium mt-0.5">
                            Paid
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}