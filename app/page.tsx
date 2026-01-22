'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    PieChart,
    ShoppingBag,
    AlertCircle,
    Calendar,
    Save,
    FileText,
    List,
    ChevronDown,
    Lightbulb,
    ArrowUp,
    Wallet,
    Pencil
} from 'lucide-react';
import Image from 'next/image';
import MonthPicker from '@/components/MonthPicker';

// --- Interfaces ---

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
}

interface DailyStat {
    date: string;
    income: number;
    expense: number;
    profit: number;
}

interface CatTotals {
    income: Record<string, number>;
    expense: Record<string, number>;
}

// --- Main Application ---

export default function Home() {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('Ingredients');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [viewMode, setViewMode] = useState<'transactions' | 'daily' | 'balance'>('transactions');
    const [txnFilter, setTxnFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Categories specifically tailored for a bakery
    const categories: Record<'income' | 'expense', string[]> = {
        expense: ['Ingredients', 'Packaging', 'Utilities', 'Logistics', 'Equipment', 'Labor', 'Inventory', 'Other'],
        income: ['Counter Sales', 'Wholesale', 'Special Orders', 'Catering', 'Other']
    };

    // Fetch from API
    useEffect(() => {
        fetch('/api/transactions')
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setTransactions(data.data);
                }
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    // Notification State
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'delete' } | null>(null);

    // User Profile State
    const [userName, setUserName] = useState('John Doe');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [tempName, setTempName] = useState('');

    const handleProfileClick = () => {
        setTempName(userName);
        setIsProfileOpen(!isProfileOpen);
    };

    const handleSaveProfile = () => {
        if (tempName.trim()) {
            setUserName(tempName);
            setIsProfileOpen(false);
            setNotification({ message: 'Profile updated!', type: 'success' });
        }
    };

    const userInitials = useMemo(() => {
        return userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }, [userName]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Derived State (Calculations)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => t.date.startsWith(filterMonth)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterMonth]);

    // Today and Yesterday Calculation
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const yesterday = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }, []);

    const todayTransactions = useMemo(() => transactions.filter(t => t.date === today), [transactions, today]);
    const yesterdayTransactions = useMemo(() => transactions.filter(t => t.date === yesterday), [transactions, yesterday]);

    const displayedTransactions = useMemo(() => {
        return filteredTransactions.filter(t => {
            if (txnFilter === 'all') return true;
            return t.type === txnFilter;
        });
    }, [filteredTransactions, txnFilter]);

    const calculateStats = (txns: Transaction[]) => {
        let income = 0;
        let expense = 0;
        const catTotals: CatTotals = { income: {}, expense: {} };
        const allCatTotals: Record<string, number> = {};

        txns.forEach(t => {
            const amt = t.amount;
            if (t.type === 'income') {
                income += amt;
                catTotals.income[t.category] = (catTotals.income[t.category] || 0) + amt;
            } else {
                expense += amt;
                catTotals.expense[t.category] = (catTotals.expense[t.category] || 0) + amt;
                allCatTotals[t.category] = (allCatTotals[t.category] || 0) + amt;
            }
        });

        return {
            income,
            expense,
            profit: income - expense,
            catTotals,
            allCatTotals
        };
    };

    const stats = useMemo(() => calculateStats(filteredTransactions), [filteredTransactions]);
    const todayStats = useMemo(() => calculateStats(todayTransactions), [todayTransactions]);
    const yesterdayStats = useMemo(() => calculateStats(yesterdayTransactions), [yesterdayTransactions]);

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return ((current - previous) / previous) * 100;
    };

    const incomeGrowth = calculateGrowth(todayStats.income, yesterdayStats.income);
    const expenseGrowth = calculateGrowth(todayStats.expense, yesterdayStats.expense);
    const profitGrowth = calculateGrowth(todayStats.profit, yesterdayStats.profit);

    // Helper for rendering growth badge
    const renderGrowth = (growth: number, inverse = false) => {
        const isPositive = growth >= 0;
        const isGood = inverse ? !isPositive : isPositive;

        const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';

        return (
            <p className={`${colorClass} text-sm font-medium leading-normal flex items-center gap-1`}>
                {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(growth).toFixed(1)}% vs yesterday
            </p>
        );
    };

    const dailyStats = useMemo(() => {
        const days: Record<string, DailyStat> = {};
        filteredTransactions.forEach(t => {
            if (!days[t.date]) days[t.date] = { date: t.date, income: 0, expense: 0, profit: 0 };
            const amt = t.amount;
            if (t.type === 'income') {
                days[t.date].income += amt;
                days[t.date].profit += amt;
            } else {
                days[t.date].expense += amt;
                days[t.date].profit -= amt;
            }
        });
        return Object.values(days).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredTransactions]);

    const highestExpCatCalc = useMemo(() => {
        const entries = Object.entries(stats.allCatTotals);
        if (entries.length === 0) return null;
        return entries.reduce((a, b) => a[1] > b[1] ? a : b);
    }, [stats]);

    // Handlers
    const handleEdit = (t: Transaction) => {
        setDescription(t.description);
        setAmount(t.amount.toString());
        setType(t.type);
        setCategory(t.category);
        setDate(t.date);
        setEditingId(t.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const transactionData = {
            date,
            description,
            amount: parseFloat(amount),
            type,
            category
        };

        if (editingId) {
            // Update existing
            fetch(`/api/transactions/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            })
                .then(async res => {
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.error || 'Server error');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.message === 'success') {
                        setTransactions(transactions.map(t => t.id === editingId ? data.data : t));
                        setNotification({ message: 'Entry updated successfully!', type: 'success' });
                        setEditingId(null);
                        setDescription('');
                        setAmount('');
                        setCategory(categories[type][0]);
                    } else {
                        throw new Error(data.error || 'Unknown error');
                    }
                })
                .catch(err => {
                    console.error('Error updating transaction:', err);
                    setNotification({ message: 'Failed to update entry.', type: 'error' });
                });
        } else {
            // Create new
            fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            })
                .then(async res => {
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.error || 'Server error');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.message === 'success') {
                        setTransactions([data.data, ...transactions]);
                        setDescription('');
                        setAmount('');
                        setNotification({ message: 'Entry added successfully!', type: 'success' });
                    } else {
                        throw new Error(data.error || 'Unknown error');
                    }
                })
                .catch(err => {
                    console.error('Error saving transaction:', err);
                    setNotification({ message: 'Failed to save entry.', type: 'error' });
                });
        }
    };

    const deleteTransaction = (id: number) => {
        fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
        })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Server error');
                }
                return res.json();
            })
            .then(data => {
                if (data.message === 'deleted') {
                    setTransactions(transactions.filter(t => t.id !== id));
                    setNotification({ message: 'Entry deleted successfully', type: 'delete' });
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(err => {
                console.error('Error deleting transaction:', err);
                setNotification({ message: 'Failed to delete entry', type: 'error' });
            });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(val);
    };

    return (
        <div className="min-h-screen bg-background-light font-display text-[#181511] flex flex-col overflow-x-hidden">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg z-[100] animate-bounce-in ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {notification.type === 'success' ? <AlertCircle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e6e1db] bg-white px-4 py-3 lg:px-10 shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 sm:gap-4 text-[#181511]">
                    <div className="size-10 sm:size-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
                        <Image src="/logo.png" alt="Tummy Ticklers Logo" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-[#181511] text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em]">Tummy Ticklers</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 sm:h-10 bg-[#f5f2f0] hover:bg-[#e6e1db] transition-colors text-[#181511] gap-2 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-3 sm:px-4"
                        >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 hidden xxs:block" />
                            <span>{new Date(filterMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {isDatePickerOpen && (
                            <MonthPicker
                                selectedMonth={filterMonth}
                                onChange={setFilterMonth}
                                onClose={() => setIsDatePickerOpen(false)}
                            />
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={handleProfileClick}
                            className="hidden sm:flex size-10 rounded-full bg-[#f5f2f0] overflow-hidden border border-[#e6e1db] items-center justify-center bg-primary text-white font-bold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            {userInitials}
                        </button>

                        {/* Profile Popover */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-[#e6e1db] p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <h3 className="text-sm font-bold text-[#181511] mb-3">Edit Profile</h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-[#8c775f]">Display Name</label>
                                        <input
                                            className="w-full rounded-lg border border-[#e6e1db] bg-white h-9 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex-1 h-8 rounded-lg border border-[#e6e1db] text-xs font-bold text-[#5e5040] hover:bg-[#f5f2f0]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#c26a06]"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white border border-[#e6e1db] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-[#8c775f] text-sm font-medium leading-normal uppercase tracking-wider">Today's Income</p>
                            <div className="text-emerald-600 bg-emerald-50 p-1 rounded-full"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                        <p className="text-[#181511] tracking-light text-3xl font-bold leading-tight">{formatCurrency(todayStats.income)}</p>
                        {renderGrowth(incomeGrowth)}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white border border-[#e6e1db] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-[#8c775f] text-sm font-medium leading-normal uppercase tracking-wider">Today's Expenses</p>
                            <div className="text-rose-600 bg-rose-50 p-1 rounded-full"><TrendingDown className="w-5 h-5" /></div>
                        </div>
                        <p className="text-[#181511] tracking-light text-3xl font-bold leading-tight">{formatCurrency(todayStats.expense)}</p>
                        {renderGrowth(expenseGrowth, true)}
                    </div>

                    <div className={`flex flex-1 flex-col gap-2 rounded-xl p-6 text-white shadow-md relative overflow-hidden group ${todayStats.profit >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-white/80 text-sm font-medium leading-normal uppercase tracking-wider">{todayStats.profit >= 0 ? "Today's Net Profit" : "Today's Net Loss"}</p>
                            <div className="text-white bg-white/20 p-1 rounded-full"><Wallet className="w-5 h-5" /></div>
                        </div>
                        <p className="text-white tracking-light text-3xl font-bold leading-tight relative z-10">{formatCurrency(Math.abs(todayStats.profit))}</p>
                        <p className="text-white/90 text-sm font-medium leading-normal flex items-center gap-1 relative z-10">
                            {profitGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(profitGrowth).toFixed(1)}% vs yesterday
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Action & Insight (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Add Entry Form */}
                        <div className="bg-white rounded-xl border border-[#e6e1db] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#f5f2f0] flex justify-between items-center">
                                <h2 className="text-[#181511] text-lg font-bold leading-tight">{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
                                {editingId && (
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setDescription('');
                                            setAmount('');
                                        }}
                                        className="text-xs font-bold text-rose-600 hover:underline"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            <div className="p-6 flex flex-col gap-5">
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Type Toggle */}
                                    <div className="flex h-12 w-full items-center justify-center rounded-xl bg-[#f5f2f0] p-1">
                                        <button
                                            type="button"
                                            onClick={() => { setType('income'); setCategory(categories.income[0]); }}
                                            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === 'income' ? 'bg-white shadow-sm text-primary' : 'text-[#8c775f]'}`}
                                        >
                                            Income
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setType('expense'); setCategory(categories.expense[0]); }}
                                            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-[#8c775f]'}`}
                                        >
                                            Expense
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[#181511] text-sm font-medium">Date</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-xl border border-[#e6e1db] bg-white h-11 px-3 text-[#181511] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-shadow"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[#181511] text-sm font-medium">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c775f] text-xs font-bold">UGX</span>
                                                <input
                                                    className="w-full rounded-xl border border-[#e6e1db] bg-white h-11 pl-12 pr-3 text-[#181511] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-shadow"
                                                    placeholder="0.00"
                                                    type="number"
                                                    step="0.01"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[#181511] text-sm font-medium">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none rounded-xl border border-[#e6e1db] bg-white h-11 px-3 text-[#181511] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-shadow"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                            >
                                                {categories[type].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c775f] pointer-events-none w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[#181511] text-sm font-medium">Description</label>
                                        <textarea
                                            className="w-full rounded-xl border border-[#e6e1db] bg-white p-3 text-[#181511] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none transition-shadow"
                                            placeholder={type === 'income' ? "E.g., Morning Rush Sales" : "E.g., 50lbs Bread Flour"}
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <button className="flex w-full items-center justify-center rounded-xl bg-primary h-12 text-white text-base font-bold shadow-md hover:bg-[#c26a06] transition-colors gap-2">
                                        {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        {editingId ? 'Update Entry' : 'Save Entry'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Smart Optimization Insight */}
                        {highestExpCatCalc && (
                            <div className="bg-gradient-to-br from-[#fff8f0] to-white rounded-xl border border-primary/20 p-5 shadow-sm relative overflow-hidden">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#181511] text-sm font-bold mb-1">Smart Insight</h3>
                                        <p className="text-[#8c775f] text-sm leading-relaxed">
                                            Highest cost: <strong>{highestExpCatCalc[0]}</strong> ({formatCurrency(highestExpCatCalc[1])}).
                                            {highestExpCatCalc[0] === 'Ingredients' && " Check bulk discounts."}
                                            {highestExpCatCalc[0] === 'Utilities' && " Optimize oven usage."}
                                        </p>
                                    </div>
                                </div>
                                <PieChart className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 rotate-12 select-none pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Data View (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <div className="bg-white rounded-xl border border-[#e6e1db] shadow-sm flex flex-col h-full min-h-[500px]">
                            {/* Tabs Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#f5f2f0] px-4 sm:px-6 pt-4 gap-4">
                                <div className="flex gap-4 sm:gap-6 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
                                    <button
                                        onClick={() => setViewMode('transactions')}
                                        className={`pb-3 sm:pb-4 text-sm px-1 font-bold border-b-2 transition-colors whitespace-nowrap ${viewMode === 'transactions' ? 'text-primary border-primary' : 'text-[#8c775f] border-transparent hover:text-[#181511]'}`}
                                    >
                                        Transactions
                                    </button>
                                    <button
                                        onClick={() => setViewMode('daily')}
                                        className={`pb-3 sm:pb-4 text-sm px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${viewMode === 'daily' ? 'text-primary border-primary' : 'text-[#8c775f] border-transparent hover:text-[#181511]'}`}
                                    >
                                        Daily P&L
                                    </button>
                                    <button
                                        onClick={() => setViewMode('balance')}
                                        className={`pb-3 sm:pb-4 text-sm px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${viewMode === 'balance' ? 'text-primary border-primary' : 'text-[#8c775f] border-transparent hover:text-[#181511]'}`}
                                    >
                                        Monthly Balance
                                    </button>
                                </div>

                                {/* Filters */}
                                {viewMode === 'transactions' && (
                                    <div className="flex items-center gap-2 pb-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
                                        <button
                                            onClick={() => setTxnFilter('all')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border whitespace-nowrap ${txnFilter === 'all' ? 'bg-[#f5f2f0] text-[#181511] border-[#e6e1db]' : 'bg-white text-[#8c775f] border-transparent hover:bg-[#f8f7f5]'}`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setTxnFilter('income')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border whitespace-nowrap ${txnFilter === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-[#8c775f] border-transparent hover:bg-[#f8f7f5]'}`}
                                        >
                                            Sales
                                        </button>
                                        <button
                                            onClick={() => setTxnFilter('expense')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border whitespace-nowrap ${txnFilter === 'expense' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-white text-[#8c775f] border-transparent hover:bg-[#f8f7f5]'}`}
                                        >
                                            Purchases
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* List Content */}
                            <div className="flex-1 overflow-y-auto overflow-x-auto p-2">
                                {/* --- VIEW: TRANSACTIONS --- */}
                                {viewMode === 'transactions' && (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[#8c775f] text-xs uppercase tracking-wider border-b border-[#f5f2f0]">
                                                <th className="px-4 py-3 font-medium">Description</th>
                                                <th className="px-4 py-3 font-medium">Category</th>
                                                <th className="px-4 py-3 font-medium text-right">Date</th>
                                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {displayedTransactions.map(t => (
                                                <tr key={t.id} className="group hover:bg-[#f8f7f5] transition-colors border-b border-[#f5f2f0] last:border-0">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full bg-[#f5f2f0] flex items-center justify-center text-[#8c775f] group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                {t.category.includes('Sales') ? <ShoppingBag className="w-5 h-5" /> :
                                                                    t.category.includes('Inventory') || t.category.includes('Ingredients') ? <List className="w-5 h-5" /> :
                                                                        <FileText className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#181511]">{t.description}</p>
                                                                <p className="text-xs text-[#8c775f] sm:hidden">{t.type}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-[#5e5040]">{t.category}</td>
                                                    <td className="px-4 py-4 text-right text-[#5e5040]">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                                                    <td className={`px-4 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(t)}
                                                                className="p-2 text-[#8c775f] hover:text-primary hover:bg-[#f5f2f0] rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteTransaction(t.id)}
                                                                className="p-2 text-[#8c775f] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {displayedTransactions.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-[#8c775f]">No transactions found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {/* --- VIEW: DAILY P&L --- */}
                                {viewMode === 'daily' && (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[#8c775f] text-xs uppercase tracking-wider border-b border-[#f5f2f0]">
                                                <th className="px-4 py-3 font-medium">Date</th>
                                                <th className="px-4 py-3 font-medium text-right">Revenue</th>
                                                <th className="px-4 py-3 font-medium text-right">Expenses</th>
                                                <th className="px-4 py-3 font-medium text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {dailyStats.map(day => (
                                                <tr key={day.date} className="group hover:bg-[#f8f7f5] transition-colors border-b border-[#f5f2f0] last:border-0">
                                                    <td className="px-4 py-4 font-bold text-[#181511]">
                                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-emerald-600">{formatCurrency(day.income)}</td>
                                                    <td className="px-4 py-4 text-right text-rose-600">{formatCurrency(day.expense)}</td>
                                                    <td className={`px-4 py-4 text-right font-bold ${day.profit >= 0 ? 'text-[#181511]' : 'text-rose-600'}`}>
                                                        {day.profit >= 0 ? '+' : ''}{formatCurrency(day.profit)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* --- VIEW: MONTHLY BALANCE --- */}
                                {viewMode === 'balance' && (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-emerald-700 font-bold uppercase text-xs tracking-wider border-b border-emerald-100 pb-2 mb-3">Income</h3>
                                            <div className="space-y-3">
                                                {Object.entries(stats.catTotals.income).map(([cat, val]) => (
                                                    <div key={cat} className="flex justify-between items-center text-sm">
                                                        <span className="text-[#5e5040]">{cat}</span>
                                                        <span className="font-bold text-[#181511]">{formatCurrency(val)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-rose-700 font-bold uppercase text-xs tracking-wider border-b border-rose-100 pb-2 mb-3">Expenses</h3>
                                            <div className="space-y-3">
                                                {Object.entries(stats.catTotals.expense).map(([cat, val]) => (
                                                    <div key={cat} className="flex justify-between items-center text-sm">
                                                        <span className="text-[#5e5040]">{cat}</span>
                                                        <span className="font-bold text-[#181511]">{formatCurrency(val)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
