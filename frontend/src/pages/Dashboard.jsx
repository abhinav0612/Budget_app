import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
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

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = income - expense;
  const overspending = expense > income;

  if (isFetching && transactions.length === 0) {
    return (
      <div className="dash-loading-wrapper">
        <div className="dash-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="dash-wrapper">
      {/* Top Navbar */}
      <nav className="dash-navbar">
        <div className="dash-nav-container">
          <div className="dash-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Smart Budget Advisor</span>
          </div>
          <button onClick={handleLogout} className="dash-logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="dash-container">
        
        {/* Advisor Section */}
        <div className="dash-advisor-section">
          <div className={`advisor-box ${overspending ? 'advisor-warning' : 'advisor-success'}`}>
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
          <div className="dash-stat-card income-card">
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
          
          <div className="dash-stat-card expense-card">
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
          
          <div className="dash-stat-card balance-card">
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

        <div className="dash-content-grid">
          {/* Add Transaction Form */}
          <div className="dash-add-section">
            <div className="dash-card">
              <h2 className="dash-card-title">New Transaction</h2>
              <form onSubmit={handleAddTransaction} className="dash-form">
                <div className="dash-input-group">
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
                
                <div className="dash-input-group">
                  <label>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="dash-submit-btn">
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

          {/* Transactions List */}
          <div className="dash-list-section">
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Recent Transactions</h2>
                {isFetching && transactions.length > 0 && <span className="dash-loading-mini">Syncing...</span>}
              </div>
              
              <div className="dash-transactions-container">
                {transactions.length === 0 ? (
                  <div className="dash-empty-state">
                    <div className="empty-icon">📁</div>
                    <p>No transactions found.</p>
                    <span>Start by adding your first income or expense!</span>
                  </div>
                ) : (
                  <ul className="dash-transaction-list">
                    {transactions.map(t => (
                      <li key={t._id} className="dash-transaction-item">
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
      </main>
    </div>
  );
};

export default Dashboard;
