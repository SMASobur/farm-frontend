import { Link } from 'react-router-dom';
import {  Calendar, User } from 'lucide-react';
import {formatCurrency, formatDateShort} from '@/lib/format';
import type { Expense } from '@/types';

export function ExpenseCard({ expense }: { expense: Expense }) {
    return (
        <Link
            to={`/expenses/${expense.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-green-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                            {expense.description || expense.categoryName}
                        </h3>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {expense.categoryName}
                    </span>
                    <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-100 mt-2">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 ">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDateShort(expense.date)}
                            </span>

                            {/* Shows who entered it */}
                            {expense.enteredByName && (
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {expense.enteredByName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-red-600">
                        -{formatCurrency(expense.amount)}
                    </span>
                </div>
            </div>
        </Link>
    );
}