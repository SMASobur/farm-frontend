import { Link } from 'react-router-dom';
import { Milk, Sunrise, Sun, Moon } from 'lucide-react';
import type { MilkProduction } from '@/types';
import { formatDateShort, formatNumber } from '@/lib/format';

export function MilkCard({ entry }: { entry: MilkProduction }) {
    return (
        <Link
            to={`/milk/${entry.id}/edit`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Milk size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {entry.animalTagNumber}
                        </div>
                        {entry.animalName && (
                            <div className="text-xs text-gray-500 truncate">
                                {entry.animalName}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                        {formatNumber(entry.totalLiters, 1)} L
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatDateShort(entry.date)}
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                    <Sunrise size={11} className="text-amber-500" />
                    {formatNumber(entry.morningLiters, 1)}L
                </span>
                <span className="inline-flex items-center gap-1">
                    <Sun size={11} className="text-yellow-500" />
                    {formatNumber(entry.noonLiters, 1)}L
                </span>
                <span className="inline-flex items-center gap-1">
                    <Moon size={11} className="text-indigo-500" />
                    {formatNumber(entry.nightLiters, 1)}L
                </span>
                {entry.enteredByName && (
                    <>
                        <span className="text-gray-300 ml-auto">·</span>
                        <span className="text-gray-400">{entry.enteredByName}</span>
                    </>
                )}
            </div>
        </Link>
    );
}