import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    year: number;
    month: number;   // 1-12
    onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: Props) {
    const label = new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    });

    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

    const handlePrev = () => {
        if (month === 1) onChange(year - 1, 12);
        else onChange(year, month - 1);
    };

    const handleNext = () => {
        if (month === 12) onChange(year + 1, 1);
        else onChange(year, month + 1);
    };

    return (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-3 py-2">
            <button
                onClick={handlePrev}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                aria-label="Previous month"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="text-center">
                <div className="font-semibold text-gray-900">{label}</div>
                {isCurrentMonth && (
                    <div className="text-xs text-green-600 font-medium mt-0.5">
                        Current month
                    </div>
                )}
            </div>

            <button
                onClick={handleNext}
                disabled={isCurrentMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next month"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}