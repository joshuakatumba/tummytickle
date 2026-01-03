import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ShoppingBag, 
  AlertCircle,
  Calendar,
  Save,
  FileText,
  List,
  BarChart3
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-stone-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
    secondary: "bg-stone-100 hover:bg-stone-200 text-stone-700 focus:ring-stone-400",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 focus:ring-red-400",
    outline: "border border-stone-300 hover:bg-stone-50 text-stone-600",
    ghost: "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, type }) => {
  const styles = {
    income: "bg-emerald-100 text-emerald-800",
    expense: "bg-rose-100 text-rose-800",
    neutral: "bg-stone-100 text-stone-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

// --- Main Application ---

export default function App() {
  // State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('bakery_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: new Date().toISOString().split('T')[0], description: 'Morning Sourdough Sales', amount: 450.00, type: 'income', category: 'Counter Sales' },
      { id: 2, date: new Date().toISOString().split('T')[0], description: 'Flour (50kg)', amount: 120.00, type: 'expense', category: 'Ingredients' },
      { id: 3, date: new Date().toISOString().split('T')[0], description: 'Butter & Eggs', amount: 85.50, type: 'expense', category: 'Ingredients' },
    ];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Ingredients');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [viewMode, setViewMode] = useState('transactions'); // 'transactions', 'daily', 'balance'
  const [txnFilter, setTxnFilter] = useState('all'); // 'all', 'income', 'expense'

  // Categories specifically tailored for a bakery
  const categories = {
    expense: ['Ingredients', 'Packaging', 'Utilities', 'Rent', 'Equipment', 'Labor', 'Other'],
    income: ['Counter Sales', 'Wholesale', 'Catering/Custom', 'Other']
  };

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('bakery_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived State (Calculations)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(filterMonth)).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterMonth]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.filter(t => {
      if (txnFilter === 'all') return true;
      return t.type === txnFilter;
    });
  }, [filteredTransactions, txnFilter]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catTotals = { income: {}, expense: {} };
    const allCatTotals = {}; // For legacy support/general insights

    filteredTransactions.forEach(t => {
      const amt = parseFloat(t.amount);
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
  }, [filteredTransactions]);

  const dailyStats = useMemo(() => {
    const days = {};
    filteredTransactions.forEach(t => {
      if (!days[t.date]) days[t.date] = { date: t.date, income: 0, expense: 0, profit: 0 };
      const amt = parseFloat(t.amount);
      if (t.type === 'income') {
        days[t.date].income += amt;
        days[t.date].profit += amt;
      } else {
        days[t.date].expense += amt;
        days[t.date].profit -= amt;
      }
    });
    // Convert to array and sort by date descending
    return Object.values(days).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredTransactions]);

  const highestExpenseCategory = useMemo(() => {
    const entries = Object.entries(stats.allCatTotals);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b);
  }, [stats]);

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction = {
      id: Date.now(),
      date,
      description,
      amount: parseFloat(amount),
      type,
      category
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    // Keep date and type for rapid entry
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 leading-tight">Baker's Books</h1>
              <p className="text-xs text-stone-500">Daily Production & Sales Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-stone-400" />
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-stone-100 border-none rounded-lg px-3 py-2 text-sm font-medium text-stone-600 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-stone-500 text-sm font-medium">Total Income</p>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(stats.income)}</h3>
              </div>
              <div className="bg-emerald-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-rose-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-stone-500 text-sm font-medium">Total Expenses</p>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(stats.expense)}</h3>
              </div>
              <div className="bg-rose-100 p-2 rounded-full">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </Card>

          <Card className={`p-6 border-l-4 ${stats.profit >= 0 ? 'border-l-amber-500' : 'border-l-red-500'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-stone-500 text-sm font-medium">Net Profit</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats.profit >= 0 ? 'text-stone-900' : 'text-red-600'}`}>
                  {formatCurrency(stats.profit)}
                </h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Input Form & Insights */}
          <div className="space-y-6">
            {/* Add Transaction Form */}
            <Card className="p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                <Plus className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-stone-800">Add Entry</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Switcher */}
                <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategory(categories.expense[0]); }}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategory(categories.income[0]); }}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wider">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      {categories[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wider">Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder={type === 'income' ? "e.g., Morning Rush Sales" : "e.g., 50lbs Bread Flour"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <Button type="submit" className="w-full mt-2">
                  <Save className="w-4 h-4" />
                  Save Entry
                </Button>
              </form>
            </Card>

            {/* Smart Optimization Insight */}
            {highestExpenseCategory && (
              <Card className="p-5 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900 text-sm">Optimization Insight</h3>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                      Your highest cost this month is <span className="font-bold">{highestExpenseCategory[0]}</span> at <span className="font-mono font-bold">{formatCurrency(highestExpenseCategory[1])}</span>. 
                    </p>
                    <div className="mt-3 bg-white/60 p-2 rounded text-xs text-indigo-800 border border-indigo-100">
                      <span className="font-bold">💡 Tip:</span> 
                      {highestExpenseCategory[0] === 'Ingredients' && " Check if local suppliers offer bulk discounts for flour or sugar."}
                      {highestExpenseCategory[0] === 'Utilities' && " Ensure ovens are only on during baking hours to save energy."}
                      {highestExpenseCategory[0] === 'Packaging' && " Consider simpler packaging for wholesale orders."}
                      {highestExpenseCategory[0] === 'Labor' && " Review shift schedules during low-traffic hours."}
                      {!['Ingredients','Utilities','Packaging','Labor'].includes(highestExpenseCategory[0]) && " Review these expenses to see if they are recurring."}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Dynamic View (Tabs) */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex space-x-2 bg-stone-200/50 p-1 rounded-lg w-fit">
               <button 
                onClick={() => setViewMode('transactions')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'transactions' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                 <List className="w-4 h-4" /> Transactions
               </button>
               <button 
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'daily' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                 <BarChart3 className="w-4 h-4" /> Daily P&L
               </button>
               <button 
                onClick={() => setViewMode('balance')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'balance' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                 <FileText className="w-4 h-4" /> Monthly Balance
               </button>
            </div>

            <Card className="min-h-[400px] flex flex-col">
              {/* --- VIEW: TRANSACTIONS LIST --- */}
              {viewMode === 'transactions' && (
                <>
                  <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center bg-stone-50/50 rounded-t-xl gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-stone-800">Transaction Log</h2>
                      <span className="text-xs text-stone-500 bg-stone-200 px-2 py-1 rounded-full">
                        {displayedTransactions.length} entries
                      </span>
                    </div>
                    
                    <div className="flex bg-white border border-stone-200 rounded-lg p-1">
                      <button
                        onClick={() => setTxnFilter('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${txnFilter === 'all' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTxnFilter('income')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${txnFilter === 'income' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                        Sales
                      </button>
                      <button
                        onClick={() => setTxnFilter('expense')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${txnFilter === 'expense' ? 'bg-rose-50 text-rose-700' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                        Purchases
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    {displayedTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-stone-400 p-8">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        <p>No {txnFilter === 'all' ? '' : txnFilter} transactions found.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 sticky top-0 text-xs uppercase text-stone-500 font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-3 border-b border-stone-200">Date</th>
                            <th className="px-6 py-3 border-b border-stone-200">Description</th>
                            <th className="px-6 py-3 border-b border-stone-200 text-right">Amount</th>
                            <th className="px-6 py-3 border-b border-stone-200 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {displayedTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-amber-50/30 transition-colors group">
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-stone-600">
                                {new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-stone-900">{t.description}</span>
                                  <div className="flex gap-2 mt-0.5">
                                    <Badge type={t.type === 'income' ? 'income' : 'expense'}>{t.type}</Badge>
                                    <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">{t.category}</span>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-3 text-right font-mono text-sm font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-stone-800'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </td>
                              <td className="px-6 py-3 text-center">
                                <button 
                                  onClick={() => deleteTransaction(t.id)}
                                  className="text-stone-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete Entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* --- VIEW: DAILY P&L --- */}
              {viewMode === 'daily' && (
                 <>
                 <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-xl">
                   <h2 className="font-semibold text-stone-800">Daily Profit & Loss</h2>
                   <span className="text-xs text-stone-500 bg-stone-200 px-2 py-1 rounded-full">{dailyStats.length} days active</span>
                 </div>
                 <div className="flex-1 overflow-auto">
                    {dailyStats.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full text-stone-400 p-8">
                           <p>No activity recorded yet.</p>
                         </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 sticky top-0 text-xs uppercase text-stone-500 font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-3 border-b border-stone-200">Date</th>
                            <th className="px-6 py-3 border-b border-stone-200 text-right">Total Revenue</th>
                            <th className="px-6 py-3 border-b border-stone-200 text-right">Total Cost</th>
                            <th className="px-6 py-3 border-b border-stone-200 text-right">Daily Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {dailyStats.map((day) => (
                            <tr key={day.date} className="hover:bg-amber-50/30 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-stone-700">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                              </td>
                              <td className="px-6 py-3 text-right font-mono text-sm text-emerald-600">
                                {formatCurrency(day.income)}
                              </td>
                              <td className="px-6 py-3 text-right font-mono text-sm text-rose-600">
                                {formatCurrency(day.expense)}
                              </td>
                              <td className={`px-6 py-3 text-right font-mono text-sm font-bold ${day.profit >= 0 ? 'text-stone-800' : 'text-red-500'}`}>
                                {day.profit >= 0 ? '+' : ''}{formatCurrency(day.profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                 </div>
                 </>
              )}

              {/* --- VIEW: MONTHLY BALANCE SHEET --- */}
              {viewMode === 'balance' && (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-xl">
                    <h2 className="font-semibold text-stone-800">Monthly Financial Statement</h2>
                    <span className="text-xs font-mono text-stone-500">{filterMonth}</span>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Income Section */}
                      <div>
                        <h3 className="text-emerald-700 font-bold uppercase text-xs tracking-wider border-b border-emerald-100 pb-2 mb-3">Income Sources</h3>
                        <div className="space-y-3">
                          {Object.entries(stats.catTotals.income).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between items-center text-sm">
                              <span className="text-stone-600">{cat}</span>
                              <span className="font-mono font-medium text-stone-900">{formatCurrency(val)}</span>
                            </div>
                          ))}
                          {Object.keys(stats.catTotals.income).length === 0 && <p className="text-stone-400 text-sm italic">No income recorded.</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-dashed border-stone-200 flex justify-between items-center font-bold">
                          <span className="text-stone-500 text-sm">Total Revenue</span>
                          <span className="text-emerald-600">{formatCurrency(stats.income)}</span>
                        </div>
                      </div>

                      {/* Expense Section */}
                      <div>
                        <h3 className="text-rose-700 font-bold uppercase text-xs tracking-wider border-b border-rose-100 pb-2 mb-3">Expenses by Category</h3>
                        <div className="space-y-3">
                          {Object.entries(stats.catTotals.expense).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between items-center text-sm">
                              <span className="text-stone-600">{cat}</span>
                              <span className="font-mono font-medium text-stone-900">{formatCurrency(val)}</span>
                            </div>
                          ))}
                          {Object.keys(stats.catTotals.expense).length === 0 && <p className="text-stone-400 text-sm italic">No expenses recorded.</p>}
                        </div>
                         <div className="mt-4 pt-3 border-t border-dashed border-stone-200 flex justify-between items-center font-bold">
                          <span className="text-stone-500 text-sm">Total Cost</span>
                          <span className="text-rose-600">{formatCurrency(stats.expense)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-8 pt-6 border-t border-stone-200">
                      <div className="flex justify-between items-center p-4 bg-stone-50 rounded-lg">
                        <span className="font-bold text-stone-700">Net Profit (Loss)</span>
                        <span className={`text-xl font-bold font-mono ${stats.profit >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {formatCurrency(stats.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}