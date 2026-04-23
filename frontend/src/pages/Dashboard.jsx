import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
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
    try {
      const res = await axios.get(`http://localhost:5000/transactions/${userId}`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount) return;
    try {
      await axios.post('http://localhost:5000/add-transaction', {
        userId,
        type,
        amount: Number(amount)
      });
      setAmount('');
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
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

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Income</h3>
          <p className="income-text">${income}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expense</h3>
          <p className="expense-text">${expense}</p>
        </div>
        <div className="stat-card">
          <h3>Balance</h3>
          <p>${balance}</p>
        </div>
      </div>

      <div className={`status-message ${overspending ? 'status-warning' : 'status-stable'}`}>
        {overspending ? "You are overspending" : "Finances are stable"}
      </div>

      <div className="add-transaction-form">
        <h3>Add Transaction</h3>
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Amount</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <button type="submit" style={{ width: 'auto', marginTop: 0 }}>Add</button>
        </form>
      </div>

      <ul className="transaction-list">
        {transactions.map(t => (
          <li key={t._id} className="transaction-item">
            <span>{new Date(t.date).toLocaleDateString()}</span>
            <span className={t.type === 'income' ? 'income-text' : 'expense-text'}>
              {t.type === 'income' ? '+' : '-'}${t.amount}
            </span>
          </li>
        ))}
        {transactions.length === 0 && <p style={{textAlign: 'center', color: '#666'}}>No transactions yet.</p>}
      </ul>
    </div>
  );
};

export default Dashboard;
