import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Plus, Receipt, ChevronRight } from 'lucide-react';
import { listExpensesByWorker } from '@/api/expenses';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { Expense } from '@/types';

interface Props {
    workerId: number;
    workerName: string;
    monthlySalary?: number | null;
    limit?: number;
    showViewAllLink?: boolean;
}

export function WorkerPaymentHistory({
                                         workerId,
                                         workerName,
                                         monthlySalary,
                                         limit,
                                         showViewAllLink,
                                     }: Props) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['worker', workerId, 'expenses'],
        queryFn: () => listExpensesByWorker(workerId),
        enabled: Number.isFinite(workerId),
    });

    const payments: Expense[] = data?.data ?? [];
    const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date));

    // Totals always computed from the full list
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const thisMonthTotal = sorted
        .filter((p) => {
            const d = new Date(p.date);
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const thisYearTotal = sorted
        .filter((p) => new Date(p.date).getFullYear() === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);

    // Only show `limit` rows on the list
    const visible = limit ? sorted.slice(0, limit) : sorted;
    const hasMore = limit != null && sorted.length > limit;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet size={14} />
                    Payments
                </h2>
                <Link
                    to={`/expenses/new?workerId=${workerId}`}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                >
                    <Plus size={16} />
                    Add Payment
                </Link>
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-14 shimmer rounded" />)}
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-600 text-center py-6">Failed to load payment history.</p>
            )}

            {!isLoading && !isError && (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-green-50 rounded-xl p-3">
                            <div className="text-xs text-green-700 uppercase tracking-wider font-medium">This Month</div>
                            <div className="text-xl font-bold text-green-900 mt-0.5">{formatCurrency(thisMonthTotal)}</div>
                            {monthlySalary != null && thisMonthTotal < monthlySalary && (
                                <div className="text-xs text-amber-700 mt-1">
                                    {formatCurrency(monthlySalary - thisMonthTotal)} pending
                                </div>
                            )}
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                            <div className="text-xs text-blue-700 uppercase tracking-wider font-medium">This Year</div>
                            <div className="text-xl font-bold text-blue-900 mt-0.5">{formatCurrency(thisYearTotal)}</div>
                        </div>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="text-center py-6">
                            <Receipt className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No payments recorded for {workerName} yet.</p>
                            <Link
                                to={`/expenses/new?workerId=${workerId}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 mt-2"
                            >
                                <Plus size={14} />
                                Record First Payment
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                {visible.map((p) => <PaymentRow key={p.id} payment={p} />)}
                            </div>

                            {showViewAllLink && hasMore && (
                                <div className="pt-3 mt-3 border-t border-gray-100">
                                    <Link
                                        to={`/workers/${workerId}/payments`}
                                        className="flex items-center justify-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                                    >
                                        View all {sorted.length} payments <ChevronRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function PaymentRow({ payment }: { payment: Expense }) {
    return (
        <Link
            to={`/expenses/${payment.id}`}
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 transition"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                        {payment.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            {payment.categoryName}
                        </span>
                        <span>{formatDateShort(payment.date)}</span>
                        {payment.enteredByName && (
                            <>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400">{payment.enteredByName}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</div>
                </div>
            </div>
        </Link>
    );
}