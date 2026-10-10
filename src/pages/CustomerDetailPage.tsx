import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, Trash2, AlertCircle, Loader2, Phone, MapPin,
    Receipt,
} from 'lucide-react';
import { getCustomer, deleteCustomer } from '@/api/customers';
import { getCustomerTypeColor, getCustomerTypeEmoji } from '@/types';
import { CustomerSalesHistory } from '@/components/customers/CustomerSalesHistory';

export function CustomerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const customerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: () => getCustomer(customerId),
        enabled: Number.isFinite(customerId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteCustomer(customerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            navigate('/customers');
        },
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-12 shimmer rounded"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Customer not found</p>
                    <Link to="/customers" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Back to Customers
                    </Link>
                </div>
            </div>
        );
    }

    const customer = data.data;
    const hasDue = customer.totalDue !== null && customer.totalDue !== undefined && customer.totalDue > 0;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to="/customers"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition"
            >
                <ArrowLeft size={16} />
                Back to Customers
            </Link>

            {/* Hero */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl shrink-0">
                        {getCustomerTypeEmoji(customer.customerTypeCode)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                            {customer.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {customer.customerTypeCode && customer.customerTypeName && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCustomerTypeColor(customer.customerTypeCode)}`}>
                                    {customer.customerTypeName}
                                    {customer.customerTypeNameBn && ` · ${customer.customerTypeNameBn}`}
                                </span>
                            )}
                            {hasDue && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold inline-flex items-center gap-1">
                  <Receipt size={12} />
                  ৳{customer.totalDue!.toLocaleString('en-IN')} due
                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <InfoItem
                        icon={<Phone size={14} />}
                        label="Phone"
                        value={customer.phone || '—'}
                    />
                    <InfoItem
                        icon={<MapPin size={14} />}
                        label="Address"
                        value={customer.address || '—'}
                    />
                </div>

                {customer.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                            Notes
                        </div>
                        <div className="text-gray-700 text-sm whitespace-pre-wrap">
                            {customer.notes}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    to={`/customers/${customer.id}/edit`}
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Pencil size={16} />
                    Edit
                </Link>

                {!confirmDelete && (
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                )}
            </div>

            {confirmDelete && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-800 font-medium">Delete this customer?</p>
                    <p className="text-xs text-red-600 mt-1">
                        This cannot be undone. Deletion is blocked if the customer has any sales.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            {deleteMutation.isPending ? (
                                <><Loader2 size={14} className="animate-spin" />Deleting…</>
                            ) : (
                                <><Trash2 size={14} />Yes, delete</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleteMutation.isPending}
                            className="text-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Sales history */}
            <CustomerSalesHistory customerId={customerId} />
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
                {icon}
                {label}
            </div>
            <div className="text-gray-900 mt-1">{value}</div>
        </div>
    );
}