import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import PatientPage from './pages/PatientPage';
import DoctorPage from './pages/DoctorPage';
import StaffPage from './pages/StaffPage';
import HospitalPatientsPage from './pages/HospitalPatientsPage';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import tanuhLogo from './assets/tanuh.png';
import iiscLogo from './assets/IISc_logo.png';
import MammogramUploadPage from './pages/MammogramUploadPage';
import QuestionnairePage from './pages/QuestionnairePage';
import AssessmentsPage from './pages/AssessmentsPage';

function App() {
  const [hoveredPortal, setHoveredPortal] = useState(null);

  const portalLinks = [
    { path: '/patient', label: 'Patient Portal' },
    { path: '/doctor', label: 'Doctor Portal' },
    { path: '/staff', label: 'Hospital Portal' },
    { path: '/admin', label: 'Admin Portal' }
  ];

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route
            path="/"
            element={
              <div style={landingContainerStyle}>
                <h1 style={welcomeTitleStyle}>Welcome to Pinkshield AI</h1>
                <div style={landingCardStyle}>
                  <div style={heroRowStyle}>
                    <img src={tanuhLogo} alt="Tanuh Logo" style={logoStyle} />
                    <h1 style={landingTitleStyle}>Portal Links</h1>
                    <img src={iiscLogo} alt="IISc Logo" style={logoStyle} />
                  </div>
                  <div style={portalGridStyle}>
                    {portalLinks.map((portal) => (
                      <a
                        key={portal.path}
                        href={portal.path}
                        style={{
                          ...portalCardStyle,
                          ...(hoveredPortal === portal.path ? portalCardHoverStyle : {})
                        }}
                        onMouseEnter={() => setHoveredPortal(portal.path)}
                        onMouseLeave={() => setHoveredPortal(null)}
                      >
                        {portal.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/hospital/patients" element={<HospitalPatientsPage />} />
          <Route path="/mammogram-upload" element={<MammogramUploadPage />} />
          <Route path="/questionnaire/:patientId" element={<QuestionnairePage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </Router>
  );
}

const landingContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 20px',
  gap: '32px'
};

const landingCardStyle = {
  maxWidth: '820px',
  width: '100%',
  background: 'white',
  borderRadius: '16px',
  padding: '30px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  borderTop: '6px solid #8B008B'
};

const heroRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  gap: '24px',
  flexWrap: 'wrap'
};

const logoStyle = {
  height: '72px',
  width: '72px',
  objectFit: 'contain'
};

const landingTitleStyle = {
  marginTop: '20px',
  marginBottom: '20px',
  color: '#8B008B',
  textAlign: 'center'
};

const welcomeTitleStyle = {
  marginTop: 0,
  marginBottom: 0,
  color: '#8B008B',
  textAlign: 'center',
  fontSize: '40px',
  fontWeight: 700
};

const portalGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginTop: '10px',
  width: '100%'
};

const portalCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '18px 16px',
  borderRadius: '12px',
  border: '1px solid #8B008B',
  color: '#8B008B',
  textDecoration: 'none',
  fontWeight: 600,
  backgroundColor: '#fff5f7',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease'
};

const portalCardHoverStyle = {
  backgroundColor: '#fdf2f8',
  boxShadow: '0 6px 12px rgba(139,0,139,0.15)',
  transform: 'translateY(-2px)'
};

export default App;
