import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';
import LanguageSwitcher from './LanguageSwitcher';

function Questionnaire({ patientData, responses = [], onSubmit, isSubmitting }) {
  const { t, i18n } = useTranslation('questionnaire');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(patientData?.answers || {});
  const [formDataEn, setFormDataEn] = useState(patientData?.answers || {});
  const [validationErrors, setValidationErrors] = useState([]);
  const [q27VideoConfirmed, setQ27VideoConfirmed] = useState(false);
  const [showQ27VideoPrompt, setShowQ27VideoPrompt] = useState(false);

  const formStructure = t('formStructure', { returnObjects: true });
  const questions = t('questions', { returnObjects: true });

  const tEn = i18n.getFixedT('en', 'questionnaire');
  const questionsEn = tEn('questions', { returnObjects: true });

  useEffect(() => {
    const defaults = t('ui.defaults', { returnObjects: true });
    const initialFormData = { ...(patientData?.answers || {}) };
    const initialFormDataEn = { ...(patientData?.answers || {}) };

    if (defaults.q45 && !initialFormData.Q45) {
      initialFormData.Q45 = defaults.q45;
      initialFormDataEn.Q45 = tEn('ui.defaults.q45');
    }
    setFormData(initialFormData);
    setFormDataEn(initialFormDataEn);
  }, [t, tEn, patientData]);

  const handleInputChange = (key, value, type) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    let valueEn = value;
    if (type === 'radio' || type === 'select') {
      const questionData = questions[key];
      const questionDataEn = questionsEn[key];
      if (questionData && questionDataEn && questionData.answers) {
        const index = questionData.answers.indexOf(value);
        if (index !== -1) {
          valueEn = questionDataEn.answers[index];
        }
      }
    }
    
    setFormDataEn(prev => ({ ...prev, [key]: valueEn }));

    if (key === "Q27") {
        const noValueEn = tEn('questions.Q27.answers.1');
        if (valueEn === noValueEn) {
            setShowQ27VideoPrompt(true);
        } else {
            setShowQ27VideoPrompt(false);
            setQ27VideoConfirmed(false);
        }
    }

    if (validationErrors.includes(key)) {
      setValidationErrors(prev => prev.filter(k => k !== key));
    }
  };

  const validate = () => {
    const errors = [];
    const checkRequired = (qs) => {
      qs.forEach(q => {
        if (q.required && !formData[q.key]) {
          errors.push(q.key);
        }
        if (q.subQuestions) {
          const conditionValue = q.condition ? q.condition.value : null;
          if (!conditionValue || formDataEn[q.key] === conditionValue) {
            checkRequired(q.subQuestions);
          }
        }
      });
    };

    formStructure.forEach(section => checkRequired(section.questions));
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to the mammogram upload page
    navigate('/mammogram-upload');
  };

  const renderInput = (qConfig) => {
    const { key, type, placeholder, min, max, step } = qConfig;
    const questionData = questions[key];
    if (!questionData) return null;

    switch (type) {
      case 'text':
      case 'number':
        return (
          <input
            type={type}
            placeholder={placeholder}
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            min={min}
            max={max}
            step={step}
            className={validationErrors.includes(key) ? 'error' : ''}
          />
        );
      case 'radio':
        return (
          <div className="radio-group">
            {questionData.answers.map((answer, i) => (
              <label key={i} className="radio-label">
                <input
                  type="radio"
                  name={key}
                  value={answer}
                  checked={formData[key] === answer}
                  onChange={(e) => handleInputChange(key, e.target.value, type)}
                />
                {answer}
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            className={validationErrors.includes(key) ? 'error' : ''}
          >
            <option value="">{t('ui.inputs.selectDefault')}</option>
            {questionData.answers.map((answer, i) => (
              <option key={i} value={answer}>{answer}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderQuestions = (qs, counter) => {
    let currentCounter = counter;
    return qs.map((qConfig) => {
      const { key, subQuestions, condition, videoUrlOnNo } = qConfig;
      const questionData = questions[key];
      if (!questionData) return null;

      currentCounter++;
      const showSub = subQuestions && condition && formDataEn[condition.key] === condition.value;
      const isQ27No = key === "Q27" && formDataEn[key] === tEn('questions.Q27.answers.1');

      return (
        <React.Fragment key={key}>
          <div className={`question-block ${validationErrors.includes(key) ? 'error' : ''}`}>
            <label>
              {currentCounter}. {questionData.question}
              {qConfig.required && <span className="required-asterisk">*</span>}
            </label>
            {renderInput(qConfig)}
          </div>
          {showSub && (
            <div className="sub-question-container visible">
              {renderQuestions(subQuestions, currentCounter * 100)}
            </div>
          )}
          {key === "Q27" && isQ27No && (
            <div className="video-section">
              {!q27VideoConfirmed && showQ27VideoPrompt && (
                <div className="video-prompt">
                  <p>{t('ui.videoPrompt.note')}</p>
                  <button type="button" onClick={() => setQ27VideoConfirmed(true)}>
                    {t('ui.videoPrompt.button')}
                  </button>
                </div>
              )}
              {q27VideoConfirmed && videoUrlOnNo && (
                <div className="video-container">
                  <iframe 
                    width="100%" 
                    height="315" 
                    src={videoUrlOnNo} 
                    title={t('ui.videoPrompt.videoTitle')} 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  // Calculate progress
  const totalRequired = formStructure.reduce((acc, section) => 
    acc + section.questions.filter(q => q.required).length, 0);
  const filledRequired = formStructure.reduce((acc, section) => 
    acc + section.questions.filter(q => q.required && formData[q.key]).length, 0);
  const progress = totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;

  return (
    <div className="questionnaire-page">
      <div className="progress-bar-container">
        <div className="progress-bar-text">
          {t('ui.progressBarTemplate', { progress })}
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <form className="questionnaire-container" onSubmit={handleSubmit}>
        <LanguageSwitcher />

        <div className="form-header">
          <h1>{t('ui.header.title')}</h1>
          {patientData?.patient_id && (
            <p className="patient-id-display">
              <strong>Patient ID:</strong> {patientData.patient_id}
            </p>
          )}
          <p className="instructions">{t('ui.header.instructions')}</p>
          <p className="mandatory-note">
            {t('ui.header.mandatoryPre')}
            <span className="required-asterisk">{t('ui.header.mandatorySymbol')}</span>
            {t('ui.header.mandatoryPost')}
          </p>
        </div>

        {responses && responses.length > 0 && (
          <div className="response-summary" style={responseSummaryStyle}>
            <h2 style={{ marginTop: 0 }}>Mapped Questionnaire Responses</h2>
            <table style={responseTableStyle}>
              <thead>
                <tr style={responseHeaderRowStyle}>
                  <th style={responseThStyle}>Question</th>
                  <th style={responseThStyle}>Answer</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} style={responseRowStyle}>
                    <td style={responseTdStyle}>{response.question}</td>
                    <td style={responseTdStyle}>{response.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {formStructure.map((section, idx) => (
          <div key={idx} className="form-section">
            <h2>{section.title}</h2>
            {renderQuestions(section.questions, idx * 10)}
          </div>
        ))}

        <div className="submit-section">
          <button 
            type="submit" 
            className={`submit-button`}
          >
            {t('Upload Mammogram')}
          </button>
        </div>
      </form>
    </div>
  );
}

const responseSummaryStyle = {
  marginBottom: '24px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  border: '1px solid #e6d3d8'
};

const responseTableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const responseHeaderRowStyle = {
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #dee2e6'
};

const responseThStyle = {
  padding: '10px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#495057'
};

const responseRowStyle = {
  borderBottom: '1px solid #dee2e6'
};

const responseTdStyle = {
  padding: '10px',
  verticalAlign: 'top'
};

export default Questionnaire;
