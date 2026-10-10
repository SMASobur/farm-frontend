import { Link } from 'react-router-dom';
import type { Worker } from '@/types';
import { WORKER_STATUS_LABELS, WORKER_STATUS_COLORS } from '@/types';
import { Phone, Briefcase, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export function WorkerCard({ worker }: { worker: Worker }) {
    const pay = worker.monthlySalary
        ? `${formatCurrency(worker.monthlySalary)}/mo`
        : worker.dailyWage
            ? `${formatCurrency(worker.dailyWage)}/day`
            : null;

    return (
        <Link
            to={`/workers/${worker.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold shrink-0">
                        {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {worker.name}
                        </div>
                        {worker.role && (
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <Briefcase size={11} />
                                {worker.role}
                            </div>
                        )}
                        {worker.phone && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Phone size={11} />
                                {worker.phone}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            WORKER_STATUS_COLORS[worker.status]
                        }`}
                    >
                        {WORKER_STATUS_LABELS[worker.status]}
                    </span>
                    {pay && (
                        <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <Wallet size={11} />
                            {pay}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}