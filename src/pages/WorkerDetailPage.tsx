import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, Trash2, AlertCircle, Loader2,
    Phone, MapPin, Briefcase, Calendar, Wallet,
} from 'lucide-react';
import { getWorker, deleteWorker } from '@/api/workers';
import { WORKER_STATUS_LABELS, WORKER_STATUS_COLORS } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDateLong } from '@/lib/format';

export function WorkerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const workerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['worker', workerId],
        queryFn: () => getWorker(workerId),
        enabled: Number.isFinite(workerId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteWorker(workerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success('Worker deleted');
            navigate('/workers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete worker');
        },
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
                <div className="h-6 shimmer rounded w-32"></div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="h-24 shimmer rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Worker not found</p>
                    <Link to="/workers" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Back to Workers
                    </Link>
                </div>
            </div>
        );
    }

    const worker = data.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to="/workers"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition"
            >
                <ArrowLeft size={16} />
                Back to Workers
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0">
                        {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">{worker.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${WORKER_STATUS_COLORS[worker.status]}`}>
                                {WORKER_STATUS_LABELS[worker.status]}
                            </span>
                            {worker.role && (
                                <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                                    <Briefcase size={14} />
                                    {worker.role}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact + Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <InfoItem icon={<Phone size={14} />} label="Phone" value={worker.phone || '—'} />
                    <InfoItem icon={<MapPin size={14} />} label="Address" value={worker.address || '—'} />
                    <InfoItem
                        icon={<Calendar size={14} />}
                        label="Hire Date"
                        value={worker.hireDate ? formatDateLong(worker.hireDate) : '—'}
                    />
                    <InfoItem
                        icon={<Wallet size={14} />}
                        label="Compensation"
                        value={
                            worker.monthlySalary
                                ? `${formatCurrency(worker.monthlySalary)} / month`
                                : worker.dailyWage
                                    ? `${formatCurrency(worker.dailyWage)} / day`
                                    : '—'
                        }
                    />
                </div>

                {worker.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                            Notes
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {worker.notes}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                    <Link
                        to={`/workers/${worker.id}/edit`}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>

                    {!confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>

                {confirmDelete && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">Delete this worker?</p>
                        <p className="text-xs text-red-600 mt-1">
                            Salary expenses linked to this worker will remain.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {deleteMutation.isPending ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Yes, delete</>}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleteMutation.isPending}
                                className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
                {icon}
                {label}
            </div>
            <div className="text-gray-900 font-medium mt-1">{value}</div>
        </div>
    );
}