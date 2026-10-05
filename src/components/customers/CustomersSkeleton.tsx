export function CustomersSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-sm text-green-900 font-medium">Loading customers…</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full shimmer shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 shimmer rounded w-32"></div>
                                <div className="h-3 shimmer rounded w-24"></div>
                                <div className="h-3 shimmer rounded w-40"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}