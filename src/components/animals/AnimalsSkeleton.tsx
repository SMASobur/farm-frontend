export function AnimalsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-sm text-green-900 font-medium">
                    Loading your animals…
                </div>
            </div>

            {/* Card grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-8 h-8 rounded-full shimmer shrink-0"></div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-4 shimmer rounded w-24"></div>
                                    <div className="h-3 shimmer rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-5 shimmer rounded-full w-16 shrink-0"></div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="h-3 shimmer rounded w-14"></div>
                            <div className="h-3 shimmer rounded w-12"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}