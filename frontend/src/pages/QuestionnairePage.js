import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const QuestionnairePage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/patient/sessions/by-patient-id/${encodeURIComponent(patientId)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to load questionnaire data');
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(err.message || 'An error occurred while loading the questionnaire');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [patientId]);

  const mappedResponses = session?.responses || [];

  return (
    <Layout userRole="staff">
      <div>
        <h2>Questionnaire for Patient: {patientId}</h2>
        {loading && <p>Loading questionnaire data...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <div style={responsePanelStyle}>
              <h3 style={responseTitleStyle}>Stored Questions and Answers</h3>
              {mappedResponses.length > 0 ? (
                <table style={responseTableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedResponses.map((response) => (
                      <tr key={response.id} style={rowStyle}>
                        <td style={tdStyle}>{response.question}</td>
                        <td style={tdStyle}>{response.answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No stored questionnaire responses found for this patient ID.</p>
              )}
            </div>
            <div style={uploadPanelStyle}>
              <Link to="/mammogram-upload" style={uploadLinkStyle}>
                Upload Mammogram
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const responsePanelStyle = {
  marginBottom: '24px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  border: '1px solid #e6d3d8',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
};

const responseTitleStyle = {
  marginTop: 0,
  color: '#8B008B'
};

const responseTableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const headerRowStyle = {
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #dee2e6'
};

const thStyle = {
  padding: '10px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#495057'
};

const rowStyle = {
  borderBottom: '1px solid #dee2e6'
};

const tdStyle = {
  padding: '10px',
  verticalAlign: 'top'
};

const uploadPanelStyle = {
  marginTop: '24px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  border: '1px solid #e6d3d8',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
};

const uploadLinkStyle = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '6px',
  backgroundColor: '#8B008B',
  color: 'white',
  textDecoration: 'none',
  fontWeight: 600
};

export default QuestionnairePage;
