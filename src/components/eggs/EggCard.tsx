import { Link } from 'react-router-dom';
import { Egg, AlertTriangle, Layers } from 'lucide-react';
import type { EggProduction } from '@/types';
import { formatDateShort } from '@/lib/format';

export function EggCard({ entry }: { entry: EggProduction }) {
    const isBatch = entry.sourceType === 'FLOCK';

    return (
        <Link
            to={`/eggs/${entry.id}/edit`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-amber-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isBatch ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}
                    >
                        {isBatch ? <Layers size={18} /> : <Egg size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {entry.sourceDisplayName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {isBatch ? 'Batch' : 'Individual'}
                        </div>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                        {entry.totalEggs} pcs
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatDateShort(entry.date)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    {entry.goodEggs} good
                </span>
                {entry.crackedEggs > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                        <AlertTriangle size={11} />
                        {entry.crackedEggs} cracked
                    </span>
                )}
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