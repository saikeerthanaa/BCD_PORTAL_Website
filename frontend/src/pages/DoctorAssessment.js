import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DoctorAssessmentForm from '../components/DoctorAssessmentForm';

const DoctorAssessment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, patientId } = location.state || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalName');
    navigate('/');
  };

  return (
    <Layout userRole="staff" handleLogout={handleLogout}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e6d3d8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #fdf2f8', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#8B008B', margin: 0, fontSize: '24px', fontWeight: 700 }}>Clinical Assessment</h2>
            {patientId && (
              <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 10px', backgroundColor: '#fff5f7', color: '#8B008B', borderRadius: '20px', fontSize: '13px', fontWeight: 600, border: '1px solid #eadce6' }}>
                Patient ID: {patientId}
              </span>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/hospital/patients')}
            style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              color: '#8B008B',
              border: '1.5px solid #8B008B',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#8B008B';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#8B008B';
            }}
          >
            ← Back to Patients
          </button>
        </div>
        
        {sessionId ? (
          <DoctorAssessmentForm 
            sessionId={sessionId} 
            onSaveSuccess={() => navigate('/hospital/patients')} 
          />
        ) : (
          <div style={{ padding: '30px 20px', border: '1.5px dashed #ffccd5', borderRadius: '8px', backgroundColor: '#fff5f7', color: '#a71d2a', textAlign: 'center', margin: '20px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '12px', color: '#8B008B' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"></path>
            </svg>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 700, color: '#8B008B' }}>Session Session Information Missing</h3>
            <p style={{ margin: '0 auto', maxLines: 3, maxWidth: '500px', fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
              We could not find active patient session information. To complete a clinical assessment, please navigate to the <strong>Patients List</strong>, select a patient, and proceed through the questionnaire response review and mammogram upload.
            </p>
            <button
              onClick={() => navigate('/hospital/patients')}
              style={{
                marginTop: '18px',
                padding: '10px 20px',
                backgroundColor: '#8B008B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(139,0,139,0.2)'
              }}
            >
              Go to Patients List
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorAssessment;
