import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Loader2, Download, FileText, TrendingUp, TrendingDown,
    AlertCircle, RefreshCw, Milk, Egg,
} from 'lucide-react';
import { getReport, downloadReportExcel, downloadReportPdf } from '@/api/reports';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ReportBreakdownBar } from '@/components/reports/ReportBreakdownBar';
import { ReportsSkeleton } from '@/components/reports/ReportsSkeleton';

// ============================================================
// Period presets
// ============================================================

type PeriodPreset = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

function firstOfMonth(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function lastOfMonth(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}

function computeRange(preset: PeriodPreset, customFrom: string, customTo: string) {
    const now = new Date();
    switch (preset) {
        case 'thisMonth':
            return { from: firstOfMonth(now), to: lastOfMonth(now) };
        case 'lastMonth': {
            const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return { from: firstOfMonth(prev), to: lastOfMonth(prev) };
        }
        case 'thisYear':
            return {
                from: `${now.getFullYear()}-01-01`,
                to: `${now.getFullYear()}-12-31`,
            };
        case 'custom':
            return { from: customFrom, to: customTo };
    }
}

// ============================================================
// Page
// ============================================================

export function ReportsPage() {
    const [preset, setPreset] = useState<PeriodPreset>('thisMonth');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [downloading, setDownloading] = useState<'xlsx' | 'pdf' | null>(null);
    const toast = useToast();

    const range = useMemo(
        () => computeRange(preset, customFrom, customTo),
        [preset, customFrom, customTo]
    );

    const isRangeValid = !!range.from && !!range.to && range.from <= range.to;

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['report', range.from, range.to],
        queryFn: () => getReport(range.from!, range.to!),
        enabled: isRangeValid,
    });

    const report = data?.data;
    const hasData = report && (
        report.revenue.grossSales > 0 ||
        report.expenses.total > 0 ||
        report.production.milkLiters > 0 ||
        (report.production.eggs ?? 0) > 0
    );

    const handleDownload = async (type: 'xlsx' | 'pdf') => {
        if (!isRangeValid) return;
        setDownloading(type);
        try {
            if (type === 'xlsx') {
                await downloadReportExcel(range.from!, range.to!);
            } else {
                await downloadReportPdf(range.from!, range.to!);
            }
            toast.success(`${type === 'xlsx' ? 'Excel' : 'PDF'} downloaded`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Download failed');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Profit &amp; loss for the selected period
                </p>
            </div>

            {/* Period Selector */}
            <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    {([
                        { value: 'thisMonth' as const, label: 'This Month' },
                        { value: 'lastMonth' as const, label: 'Last Month' },
                        { value: 'thisYear' as const, label: 'This Year' },
                        { value: 'custom' as const, label: 'Custom' },
                    ]).map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPreset(p.value)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                preset === p.value
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {preset === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From</label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To</label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {!isRangeValid ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                    <p className="text-amber-800 font-medium">Select a valid date range</p>
                </div>
            ) : isLoading ? (
                <ReportsSkeleton />
            ) : isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load report</p>
                    <p className="text-sm text-red-600 mt-2">
                        {(error as any)?.response?.data?.message || 'Something went wrong'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : !report ? null : (
                <>
                    {/* Hero: Profit / Loss */}
                    <div
                        className={`rounded-2xl p-6 text-white ${
                            report.profit.netProfit >= 0
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}
                    >
                        <div className="text-xs uppercase tracking-wider opacity-80 font-medium">
                            {report.profit.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            {report.profit.netProfit >= 0 ? (
                                <TrendingUp size={32} />
                            ) : (
                                <TrendingDown size={32} />
                            )}
                            <span className="text-4xl font-bold">
                                {formatCurrency(Math.abs(report.profit.netProfit))}
                            </span>
                        </div>
                        <div className="text-sm opacity-90 mt-2">
                            {report.profit.profitMargin.toFixed(2)}% margin
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                            <div>
                                <div className="text-xs opacity-75">Sales</div>
                                <div className="font-semibold mt-0.5">
                                    {formatCurrency(report.revenue.grossSales)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs opacity-75">Expenses</div>
                                <div className="font-semibold mt-0.5">
                                    {formatCurrency(report.expenses.total)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs opacity-75">Cash In</div>
                                <div className="font-semibold mt-0.5">
                                    {formatCurrency(report.revenue.cashCollected)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!hasData && (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                            <p className="text-sm text-gray-500">
                                No sales or expenses in this period.
                            </p>
                        </div>
                    )}

                    {/* Revenue Breakdown */}
                    {Object.keys(report.revenue.byProduct).length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Revenue by Product
                            </h2>
                            {(() => {
                                const entries = Object.entries(report.revenue.byProduct)
                                    .sort((a, b) => b[1] - a[1]);
                                const max = Math.max(...entries.map(([, v]) => v));
                                return entries.map(([code, amount]) => (
                                    <ReportBreakdownBar
                                        key={code}
                                        label={code}
                                        amount={amount}
                                        maxAmount={max}
                                        color="green"
                                    />
                                ));
                            })()}
                        </div>
                    )}

                    {/* Expense Breakdown */}
                    {Object.keys(report.expenses.byCategory).length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Expenses by Category
                            </h2>
                            {(() => {
                                const entries = Object.entries(report.expenses.byCategory)
                                    .sort((a, b) => b[1] - a[1]);
                                const max = Math.max(...entries.map(([, v]) => v));
                                return entries.map(([code, amount]) => (
                                    <ReportBreakdownBar
                                        key={code}
                                        label={code}
                                        amount={amount}
                                        maxAmount={max}
                                        color="red"
                                    />
                                ));
                            })()}
                        </div>
                    )}

                    {/* Production */}
                    {(report.production.milkLiters > 0 || (report.production.eggs ?? 0) > 0) && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Production
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <Milk size={16} />
                                        <span className="text-xs font-medium uppercase tracking-wider">
                                            Milk
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900 mt-1">
                                        {formatNumber(report.production.milkLiters, 1)} L
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <Egg size={16} />
                                        <span className="text-xs font-medium uppercase tracking-wider">
                                            Eggs
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-amber-900 mt-1">
                                        {report.production.eggs} pcs
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Outstanding Dues callout */}
                    {report.revenue.outstandingDues > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-amber-900">
                                    Outstanding customer dues
                                </span>
                                <span className="text-lg font-bold text-amber-900">
                                    {formatCurrency(report.revenue.outstandingDues)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Export */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Export
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleDownload('xlsx')}
                                disabled={downloading !== null}
                                className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl py-3 font-medium hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {downloading === 'xlsx' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Download size={18} />
                                )}
                                Excel
                            </button>
                            <button
                                onClick={() => handleDownload('pdf')}
                                disabled={downloading !== null}
                                className="flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl py-3 font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {downloading === 'pdf' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <FileText size={18} />
                                )}
                                PDF
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}