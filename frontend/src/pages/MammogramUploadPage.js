import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MammogramUploadPage.css';
import Layout from '../components/Layout';

const MammogramUploadPage = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState({});

  const mammogramViews = [
    {
      id: 'RCC',
      label: 'Right Cranio-Caudal',
      shortLabel: 'RCC',
      description: 'Right breast from top to bottom'
    },
    {
      id: 'RMLO',
      label: 'Right Medio-Lateral Oblique',
      shortLabel: 'RMLO',
      description: 'Right breast at an angle'
    },
    {
      id: 'LCC',
      label: 'Left Cranio-Caudal',
      shortLabel: 'LCC',
      description: 'Left breast from top to bottom'
    },
    {
      id: 'LMLO',
      label: 'Left Medio-Lateral Oblique',
      shortLabel: 'LMLO',
      description: 'Left breast at an angle'
    }
  ];

  const handleFileChange = (e, viewId) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [viewId]: file
      }));
    }
  };

  const handleNavigateToAssessments = () => {
    navigate('/assessments');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalName');
    navigate('/');
  };

  return (
    <Layout userRole="staff" handleLogout={handleLogout} maxWidth="1200px" padding="20px">
      <div className="mammogram-container">
        <div className="mammogram-content">
          <h1 className="page-title">Upload Mammogram Images</h1>
          <p className="page-subtitle">
            Please upload all four mammogram views for accurate breast cancer screening
          </p>

          <div className="views-grid">
            {mammogramViews.map((view) => (
              <div key={view.id} className="view-card">
                <div className="view-header">
                  <h2 className="view-label">{view.shortLabel}</h2>
                  {uploadedFiles[view.id] && (
                    <div className="upload-tick">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="tick-icon"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                <p className="view-description">{view.label}</p>

                <div className="image-preview-area">
                  {uploadedFiles[view.id] ? (
                    <div className="uploaded-info">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="success-icon"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="file-name">{uploadedFiles[view.id].name}</p>
                      <p className="file-size">
                        ({(uploadedFiles[view.id].size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <p className="placeholder-text">{view.shortLabel}</p>
                  )}
                </div>

                <label htmlFor={`${view.id}-upload`} className="upload-button-label">
                  <input
                    id={`${view.id}-upload`}
                    type="file"
                    accept="image/jpeg,image/png,image/dicom,image/x-dcm"
                    onChange={(e) => handleFileChange(e, view.id)}
                    className="file-input"
                    aria-label={`Upload ${view.label}`}
                  />
                  <span className="upload-button">
                    {uploadedFiles[view.id] ? 'Change Image' : 'Upload Image'}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="upload-status">
            <p className="status-text">
              {Object.keys(uploadedFiles).length} of 4 images uploaded
            </p>
            <div className="status-indicators">
              {mammogramViews.map((view) => (
                <div
                  key={view.id}
                  className={`status-dot ${uploadedFiles[view.id] ? 'uploaded' : ''}`}
                  title={view.shortLabel}
                  aria-label={`${view.shortLabel} ${uploadedFiles[view.id] ? 'uploaded' : 'pending'}`}
                ></div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNavigateToAssessments}
            className="proceed-button"
            aria-label="Proceed to assessment results"
          >
            Proceed to Assessment Results
          </button>
          
        </div>
      </div>
    </Layout>
  );
};

export default MammogramUploadPage;
