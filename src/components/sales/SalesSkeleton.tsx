export function SalesSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-sm text-green-900 font-medium">Loading sales…</div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 shimmer rounded w-40"></div>
                                <div className="h-3 shimmer rounded w-28"></div>
                            </div>
                            <div className="h-6 shimmer rounded w-20"></div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-5 shimmer rounded-full w-16"></div>
                            <div className="h-4 shimmer rounded w-32"></div>
                        </div>
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                            <div className="h-3 shimmer rounded w-20"></div>
                            <div className="h-3 shimmer rounded w-20"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}