export function ReportsSkeleton() {
    return (
        <div className="space-y-5">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-sm text-green-900 font-medium">
                    Generating your report…
                </div>
            </div>

            {/* Hero placeholder */}
            <div className="shimmer rounded-2xl h-48"></div>

            {/* Breakdown placeholders */}
            {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="h-4 shimmer rounded w-32 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 shimmer rounded w-24"></div>
                                    <div className="h-4 shimmer rounded w-20"></div>
                                </div>
                                <div className="h-2 shimmer rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}