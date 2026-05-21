import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const StaffPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospitalName: '',
    staffName: '',
    email: '',
    password: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/hospitals`);
        if (!response.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        const data = await response.json();
        setHospitals(data);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setMessage({ type: 'error', text: 'Failed to load hospitals list.' });
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalName');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.hospitalName || !formData.staffName || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in hospital name, staff name, email, and password.' });
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospital_name: formData.hospitalName,
          role: 'Staff',
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', 'staff');
        localStorage.setItem('hospitalName', formData.hospitalName);
        setMessage({ type: 'success', text: 'Login successful!' });
        navigate('/hospital/patients');
      } else {
        const errorMsg = data.detail || 'Incorrect email or password';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({ type: 'error', text: 'An error occurred during login. Please try again.' });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Layout userRole="staff" handleLogout={handleLogout}>
      <div style={contentStyle}>
        <h2 style={titleStyle}>Hospital Portal</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="hospitalName">Hospital Name</label>
            <select
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading hospitals...' : 'Select Hospital'}</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.name}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="staffName">Staff Name</label>
            <input
              id="staffName"
              name="staffName"
              type="text"
              value={formData.staffName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {message.text && (
            <div
              style={{
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...submitButtonStyle,
              backgroundColor: loginLoading ? '#ccc' : '#8B008B',
              cursor: loginLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={loginLoading}
          >
            {loginLoading ? 'Logging in...' : 'Submit'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

const contentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  minHeight: '260px',
  maxWidth: '600px',
  margin: '0 auto'
};

const titleStyle = {
  color: '#8B008B',
  marginBottom: '20px',
  textAlign: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontWeight: 500,
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const submitButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#8B008B',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default StaffPage;
