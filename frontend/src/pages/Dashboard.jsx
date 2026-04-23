import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    if (!amount) return;
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
      <div className="auth-wrapper">
        <div className="loading-text">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <h1>Budget Advisor</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="container">
        <div className={`status-message ${overspending ? 'status-warning' : 'status-stable'}`}>
          {overspending ? "⚠️ You are overspending. Time to review your budget!" : "✅ Finances are stable. Keep up the good work!"}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Income</h3>
            <p className="income-text">${income.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Expense</h3>
            <p className="expense-text">${expense.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Balance</h3>
            <p className="balance-text">${balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="add-transaction-section">
          <h3>Add New Transaction</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="add-form-row">
              <div className="form-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </form>
          {successMsg && <div className="success-message">{successMsg}</div>}
        </div>

        <div className="transaction-section">
          <h3>Recent Transactions</h3>
          <ul className="transaction-list">
            {transactions.map(t => (
              <li key={t._id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-date">
                    {new Date(t.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={`transaction-type-badge ${t.type === 'income' ? 'income-text' : 'expense-text'}`}>
                    {t.type}
                  </span>
                </div>
                <span className={`transaction-amount ${t.type === 'income' ? 'income-text' : 'expense-text'}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
            {transactions.length === 0 && (
              <li className="empty-state">No transactions yet. Add one above!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
