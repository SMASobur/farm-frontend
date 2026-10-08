import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import type { Expense } from '@/types';
import { formatCurrency, formatDateShort } from '@/lib/format';

export function ExpenseCard({ expense }: { expense: Expense }) {
    return (
        <Link
            to={`/expenses/${expense.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-300 hover:shadow-sm transition"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Receipt size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">
                                {expense.description}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {expense.categoryName}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span>{formatDateShort(expense.date)}</span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-red-600">
                                −{formatCurrency(expense.amount)}
                            </div>
                        </div>
                    </div>

                    {expense.notes && (
                        <div className="text-xs text-gray-400 mt-2 truncate">
                            {expense.notes}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}