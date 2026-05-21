import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const HospitalPatientsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalName');
    navigate('/');
  };

  const convertGcsToHttp = (gcsUrl) => {
    if (!gcsUrl) return null;
    if (gcsUrl.startsWith('gs://')) {
      return `https://storage.googleapis.com/${gcsUrl.replace('gs://', '')}`;
    }
    return gcsUrl;
  };

  const extractPatientId = (responses = []) => {
    const sortedResponses = [...responses].sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();
      return leftTime - rightTime;
    });

    const match = sortedResponses.find((response) =>
      response.question?.toLowerCase().includes('enter your patient id') ||
      response.question?.toLowerCase().includes('patient id')
    );

    return match?.answer || null;
  };

  useEffect(() => {
    const fetchHospitalPatients = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view hospital patients.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const sessionsResponse = await fetch(`${apiUrl}/api/v1/doctor/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sessionsResponse.ok) {
          const errorData = await sessionsResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to fetch hospital patients');
        }

        const sessionList = await sessionsResponse.json();
        const enrichedSessions = await Promise.all(
          sessionList.map(async (session) => {
            const detailResponse = await fetch(`${apiUrl}/api/v1/doctor/sessions/${session.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!detailResponse.ok) {
              return {
                ...session,
                patient_id: null,
                responses: [],
              };
            }

            const detail = await detailResponse.json();
            return {
              ...detail,
              patient_id: extractPatientId(detail.responses),
            };
          })
        );

        setSessions(enrichedSessions.filter((session) => session.patient_id));
      } catch (err) {
        setError(err.message || 'An error occurred while loading patients');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalPatients();
  }, []);

  return (
    <Layout userRole="staff" handleLogout={handleLogout} maxWidth="1000px" padding="20px">
      <div style={contentStyle}>
        <div style={headerRowStyle}>
          <h2 style={titleStyle}>Hospital Patient Details</h2>
          <button type="button" style={backButtonStyle} onClick={() => navigate('/staff')}>
            Back to Login
          </button>
        </div>

        {loading && <p>Loading hospital patients...</p>}
        {error && <p style={{ color: 'red', marginTop: 0 }}>{error}</p>}

        {!loading && !error && (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyleTable}>
                  <th style={thStyle}>Patient ID</th>
                  <th style={thStyle}>Session ID</th>
                  <th style={thStyle}>Consent Date</th>
                  <th style={thStyle}>Consent Image</th>
                  <th style={thStyle}>Responses</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={tdStyle}>No patient sessions found.</td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} style={rowStyle}>
                      <td style={tdStyle}>
                        {session.patient_id ? (
                          <Link to={`/questionnaire/${session.patient_id}`} style={{ color: '#8B008B', textDecoration: 'none' }}>
                            {session.patient_id}
                          </Link>
                        ) : (
                          'Not provided'
                        )}
                      </td>
                      <td style={tdStyle}>{session.id}</td>
                      <td style={tdStyle}>{session.consent_timestamp ? new Date(session.consent_timestamp).toLocaleString() : 'N/A'}</td>
                      <td style={tdStyle}>
                        {session.consent_scanned_url ? (
                          <img
                            src={convertGcsToHttp(session.consent_scanned_url)}
                            alt="Consent"
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                            onClick={() => window.open(convertGcsToHttp(session.consent_scanned_url), '_blank')}
                          />
                        ) : 'No Image'}
                      </td>
                      <td style={tdStyle}>{session.responses?.length || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

const contentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '16px'
};

const titleStyle = {
  margin: 0,
  color: '#8B008B'
};

const backButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600
};

const tableContainerStyle = {
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const headerRowStyleTable = {
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #dee2e6'
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  color: '#495057',
  fontWeight: 600
};

const rowStyle = {
  borderBottom: '1px solid #dee2e6'
};

const tdStyle = {
  padding: '12px',
  verticalAlign: 'middle'
};

export default HospitalPatientsPage;
