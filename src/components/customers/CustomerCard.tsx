import { Link } from 'react-router-dom';
import type { Customer } from '@/types';
import { getCustomerTypeEmoji, getCustomerTypeColor } from '@/types';
import { Phone } from 'lucide-react';

export function CustomerCard({ customer }: { customer: Customer }) {
    const typeName = customer.customerTypeName || 'Customer';
    const typeCode = customer.customerTypeCode || '';

    return (
        <Link
            to={`/customers/${customer.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl shrink-0">
                        {getCustomerTypeEmoji(typeCode)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {customer.name}
                        </div>
                        {customer.phone && (
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <Phone size={11} />
                                {customer.phone}
                            </div>
                        )}
                        {customer.address && (
                            <div className="text-xs text-gray-400 mt-1 truncate">
                                {customer.address}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCustomerTypeColor(typeCode)}`}>
                        {typeName}
                    </span>
                    {customer.totalDue !== null && customer.totalDue !== undefined && customer.totalDue > 0 && (
                        <span className="text-xs text-amber-700 font-semibold">
                            ৳{customer.totalDue.toLocaleString('en-IN')} due
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}