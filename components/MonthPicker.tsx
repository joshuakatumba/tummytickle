'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
    selectedMonth: string; // Format: "YYYY-MM"
    onChange: (month: string) => void;
    onClose: () => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ selectedMonth, onChange, onClose }) => {
    const [viewYear, setViewYear] = useState<number>(() => {
        return parseInt(selectedMonth.split('-')[0], 10) || new Date().getFullYear();
    });

    const pickerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const months = [
        { name: 'Jan', value: '01' }, { name: 'Feb', value: '02' }, { name: 'Mar', value: '03' },
        { name: 'Apr', value: '04' }, { name: 'May', value: '05' }, { name: 'Jun', value: '06' },
        { name: 'Jul', value: '07' }, { name: 'Aug', value: '08' }, { name: 'Sep', value: '09' },
        { name: 'Oct', value: '10' }, { name: 'Nov', value: '11' }, { name: 'Dec', value: '12' },
    ];

    const handleMonthSelect = (monthValue: string) => {
        const newMonth = `${viewYear}-${monthValue}`;
        onChange(newMonth);
        onClose();
    };

    const currentSelectedYear = parseInt(selectedMonth.split('-')[0], 10);
    const currentSelectedMonth = selectedMonth.split('-')[1];

    return (
        <div
            ref={pickerRef}
            className="absolute top-12 right-0 z-50 w-[300px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 animate-in fade-in zoom-in-95 duration-200"
            style={{ boxShadow: '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setViewYear(prev => prev - 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold text-gray-800">{viewYear}</span>
                <button
                    onClick={() => setViewYear(prev => prev + 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
                {months.map((month) => {
                    const isSelected = viewYear === currentSelectedYear && month.value === currentSelectedMonth;
                    return (
                        <button
                            key={month.name}
                            onClick={() => handleMonthSelect(month.value)}
                            className={`
                h-10 rounded-xl text-sm font-semibold transition-all duration-200
                ${isSelected
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
                        >
                            {month.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthPicker;
