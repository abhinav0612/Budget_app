import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [userId, navigate]);

  const fetchTransactions = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`http://localhost:5000/transactions/${userId}`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      await axios.post('http://localhost:5000/add-transaction', {
        userId,
        type,
        amount: Number(amount)
      });
      setAmount('');
      setSuccessMsg('Transaction added successfully!');
      fetchTransactions();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Calculations
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = income - expense;
  const overspending = expense > income;

  // Chart Data preparation
  const expenseTransactions = [...transactions].filter(t => t.type === 'expense').reverse();

  const monthlyExpenses = expenseTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {});
  const monthlyData = Object.entries(monthlyExpenses).map(([name, expense]) => ({ name, expense }));

  const dailyExpenses = expenseTransactions.reduce((acc, t) => {
    const day = new Date(t.date).toLocaleDateString('default', { month: 'short', day: 'numeric' });
    acc[day] = (acc[day] || 0) + t.amount;
    return acc;
  }, {});
  const dailyData = Object.entries(dailyExpenses).map(([name, expense]) => ({ name, expense }));

  if (isFetching && transactions.length === 0) {
    return (
      <div className="dash-loading-wrapper">
        <div className="dash-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Budget Advisor</span>
        </div>
        <ul className="sidebar-nav">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span>
            Dashboard
          </li>
          <li className={activeTab === 'add_expense' ? 'active' : ''} onClick={() => setActiveTab('add_expense')}>
            <span className="nav-icon">➕</span>
            Add Expenses
          </li>
          <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            <span className="nav-icon">📈</span>
            Reports & Analytics
          </li>
        </ul>
        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="sidebar-logout">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h2>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'add_expense' && 'Record Transactions'}
            {activeTab === 'reports' && 'Reports & Analytics'}
          </h2>
        </header>

        <div className="content-area" key={activeTab}>
          {activeTab === 'dashboard' && (
            <div className="tab-dashboard">
              {/* Advisor Section */}
              <div className="dash-advisor-section animate-entrance delay-1">
                <div className={`advisor-box ${overspending ? 'advisor-warning pulse-red' : 'advisor-success pulse-green'}`}>
                  <span className="advisor-icon">{overspending ? '⚠️' : '✅'}</span>
                  <span className="advisor-text">
                    {overspending 
                      ? "You are overspending. Consider cutting back on expenses to improve your financial health." 
                      : "Your finances are stable. Great job staying within your means!"}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="dash-stats-grid">
                <div className="dash-stat-card income-card animate-entrance delay-2">
                  <div className="stat-icon-wrapper income-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total Income</h3>
                    <p className="stat-amount income-text">${income.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="dash-stat-card expense-card animate-entrance delay-3">
                  <div className="stat-icon-wrapper expense-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                      <polyline points="17 18 23 18 23 12"></polyline>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total Expense</h3>
                    <p className="stat-amount expense-text">${expense.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="dash-stat-card balance-card animate-entrance delay-4">
                  <div className="stat-icon-wrapper balance-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <line x1="2" y1="10" x2="22" y2="10"></line>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Available Balance</h3>
                    <p className="stat-amount balance-text">${balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Transactions List */}
              <div className="dash-list-section animate-entrance delay-5">
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h2 className="dash-card-title">Recent Transactions</h2>
                    {isFetching && transactions.length > 0 && <span className="dash-loading-mini">Syncing...</span>}
                  </div>
                  
                  <div className="dash-transactions-container">
                    {transactions.length === 0 ? (
                      <div className="dash-empty-state animate-entrance delay-6">
                        <div className="empty-icon">📁</div>
                        <p>No transactions found.</p>
                        <span>Start by adding your first income or expense!</span>
                      </div>
                    ) : (
                      <ul className="dash-transaction-list">
                        {transactions.map((t, index) => (
                          <li 
                            key={t._id} 
                            className="dash-transaction-item animate-entrance"
                            style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                          >
                            <div className="dash-tx-left">
                              <div className={`dash-tx-icon ${t.type === 'income' ? 'income-icon-bg' : 'expense-icon-bg'}`}>
                                {t.type === 'income' ? '+' : '-'}
                              </div>
                              <div className="dash-tx-info">
                                <span className="dash-tx-type">{t.type}</span>
                                <span className="dash-tx-date">
                                  {new Date(t.date).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className={`dash-tx-amount ${t.type === 'income' ? 'income-text' : 'expense-text'}`}>
                              {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add_expense' && (
            <div className="tab-add-expense animate-entrance delay-1">
              <div className="dash-add-section">
                <div className="dash-card max-w-lg">
                  <h2 className="dash-card-title">New Transaction</h2>
                  <p className="dash-card-subtitle">Record your new income or expense below.</p>
                  <form onSubmit={handleAddTransaction} className="dash-form">
                    <div className="dash-input-group animate-entrance delay-2">
                      <label>Amount</label>
                      <div className="dash-input-wrapper">
                        <span className="dash-currency">$</span>
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={e => setAmount(e.target.value)} 
                          required 
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="dash-input-group animate-entrance delay-3">
                      <label>Type</label>
                      <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="dash-submit-btn animate-entrance delay-4">
                      {isSubmitting ? 'Processing...' : 'Add Transaction'}
                    </button>
                  </form>
                  
                  {successMsg && (
                    <div className="dash-success-msg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      {successMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="tab-reports animate-entrance delay-1">
              <div className="reports-grid">
                <div className="dash-card chart-card animate-entrance delay-2">
                  <h2 className="dash-card-title">Monthly Spending</h2>
                  {monthlyData.length > 0 ? (
                    <div className="chart-wrapper animate-entrance delay-3">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Expense']} cursor={{fill: '#f1f5f9'}} />
                          <Bar dataKey="expense" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="no-data-msg">No expense data available yet.</p>
                  )}
                </div>

                <div className="dash-card chart-card animate-entrance delay-4">
                  <h2 className="dash-card-title">Daily Spending Trend</h2>
                  {dailyData.length > 0 ? (
                    <div className="chart-wrapper animate-entrance delay-5">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Expense']} />
                          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="no-data-msg">No expense data available yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
