import React, { useState } from 'react';


const createBreastFinding = () => ({
 composition: '',
 has_masses: false,
 mass_location: '',
 mass_description: '',
 has_calcification: false,
 calcification_type: '',
 skin_thickening: false,
 nipple_retraction: false,
 has_lymph_nodes: false,
 lymph_node_type: '',
 architectural_distortion: false,
 focal_asymmetry: false,
 asymmetry: false,
 birads_category: '',
 acr_density: ''
});

const DoctorAssessmentForm = ({ sessionId, onSaveSuccess, initialFormData = {}, initialBreastFindings = {} }) => {
 const [formData, setFormData] = useState({
 questionnaire_feedback: '',
 is_questionnaire_correct: false,
 routine_views_uploaded: false,
 mammo_birads: '',
 mammo_density: '',
 us_biopsy_birads: '',
 us_biopsy_density: '',
 precision_diagnosis: '',
 datapoint_feedback: '',
 recommendation_followup: '',
 ...initialFormData
 });

 const [breastFindings, setBreastFindings] = useState({
 right: {
 ...createBreastFinding(),
 ...initialBreastFindings.right
 },
 left: {
 ...createBreastFinding(),
 ...initialBreastFindings.left
 }
 });

 const [files, setFiles] = useState({
 mammo_dicom: [],
 mammo_reading: null,
 us_video: null,
 us_reading: null,
 biopsy_doc: null
 });

 const [isSubmitting, setIsSubmitting] = useState(false);
 const [message, setMessage] = useState({ type: '', text: '' });

 const handleInputChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));
 };

 const handleBreastFindingChange = (side, field, value) => {
 setBreastFindings(prev => ({
 ...prev,
 [side]: {
 ...prev[side],
 [field]: value
 }
 }));
 };

 const handleFindingCheckboxChange = (side, field, checked) => {
 setBreastFindings(prev => {
 const nextFinding = {
 ...prev[side],
 [field]: checked
 };

 if (field === 'has_calcification' && !checked) {
 nextFinding.calcification_type = '';
 }
 if (field === 'has_lymph_nodes' && !checked) {
 nextFinding.lymph_node_type = '';
 }

 return {
 ...prev,
 [side]: nextFinding
 };
 });
 };

 const handleFileChange = (e) => {
 const { name, files: selectedFiles } = e.target;
 if (name === 'mammo_dicom') {
 const fileList = Array.from(selectedFiles).slice(0, 10);
 setFiles(prev => ({ ...prev, [name]: fileList }));
 } else {
 setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
 }
 };

 const appendIfPresent = (formDataObject, key, value) => {
 if (value !== undefined && value !== null) {
 formDataObject.append(key, value);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setMessage({ type: '', text: '' });

 const submitData = new FormData();
 submitData.append('patient_session_id', sessionId);
 submitData.append('questionnaire_feedback', formData.questionnaire_feedback);
 submitData.append('is_questionnaire_correct', formData.is_questionnaire_correct);
 submitData.append('routine_views_uploaded', formData.routine_views_uploaded);
 submitData.append('mammo_birads', formData.mammo_birads);
 submitData.append('mammo_density', formData.mammo_density);
 submitData.append('us_biopsy_birads', formData.us_biopsy_birads);
 submitData.append('us_biopsy_density', formData.us_biopsy_density);
 submitData.append('precision_diagnosis', formData.precision_diagnosis);
 submitData.append('datapoint_feedback', formData.datapoint_feedback);
 submitData.append('recommendation_followup', formData.recommendation_followup);
 submitData.append('right_breast_findings', JSON.stringify(breastFindings.right));
 submitData.append('left_breast_findings', JSON.stringify(breastFindings.left));

 files.mammo_dicom.forEach(file => {
 submitData.append('mammo_dicom', file);
 });
 appendIfPresent(submitData, 'mammo_reading', files.mammo_reading);
 appendIfPresent(submitData, 'us_video', files.us_video);
 appendIfPresent(submitData, 'us_reading', files.us_reading);
 appendIfPresent(submitData, 'biopsy_doc', files.biopsy_doc);

 try {
 const token = localStorage.getItem('token');
 const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
 const response = await fetch(`${apiUrl}/api/v1/patient/assessment`, {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`
 },
 body: submitData
 });

 if (response.ok) {
 setMessage({ type: 'success', text: 'Assessment saved successfully!' });
 if (onSaveSuccess) onSaveSuccess();
 } else {
 const errorData = await response.json();
 setMessage({ type: 'error', text: `Failed to save assessment: ${errorData.detail || 'Unknown error'}` });
 }
 } catch (err) {
 console.error(err);
 setMessage({ type: 'error', text: 'An error occurred while saving the assessment.' });
 } finally {
 setIsSubmitting(false);
 }
 };

 const renderYesNoCheckbox = (label, checked, onChange) => (
 <label style={checkboxContainerStyle}>
 <input
 type="checkbox"
 checked={checked}
 onChange={(e) => onChange(e.target.checked)}
 style={{ marginRight: '10px' }}
 />
 {label}: {checked ? 'Yes' : 'No'}
 </label>
 );

 const renderBenignMalignant = (side, field, value) => (
 <div style={inlineRadioGroupStyle}>
 {['benign', 'malignant'].map(option => (
 <label key={option} style={radioLabelStyle}>
 <input
 type="radio"
 name={`${side}_${field}`}
 value={option}
 checked={value === option}
 onChange={(e) => handleBreastFindingChange(side, field, e.target.value)}
 />
 {option.charAt(0).toUpperCase() + option.slice(1)}
 </label>
 ))}
 </div>
 );

 const renderBreastSection = (side, title, biradsOptions) => {
 const finding = breastFindings[side];

 return (
 <div style={subsectionStyle}>
 <h4 style={{ marginBottom: '15px', color: '#333' }}>{title}</h4>

 <label style={labelStyle}>Breast Composition</label>
 <textarea
 value={finding.composition}
 onChange={(e) => handleBreastFindingChange(side, 'composition', e.target.value)}
 style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
 placeholder={`${title} composition notes...`}
 />

 {renderYesNoCheckbox(
 'Presence of any masses',
 finding.has_masses,
 (checked) => handleFindingCheckboxChange(side, 'has_masses', checked)
 )}

 {finding.has_masses && (
 <div style={conditionalBlockStyle}>
 <label style={labelStyle}>Location</label>
 <input
 value={finding.mass_location}
 onChange={(e) => handleBreastFindingChange(side, 'mass_location', e.target.value)}
 style={inputStyle}
 placeholder="Mass location"
 />

 <label style={labelStyle}>Description</label>
 <textarea
 value={finding.mass_description}
 onChange={(e) => handleBreastFindingChange(side, 'mass_description', e.target.value)}
 style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
 placeholder="Mass description"
 />
 </div>
 )}

 {renderYesNoCheckbox(
 'Presence of any calcification',
 finding.has_calcification,
 (checked) => handleFindingCheckboxChange(side, 'has_calcification', checked)
 )}
 {finding.has_calcification && (
 <div style={conditionalBlockStyle}>
 <label style={labelStyle}>Calcification Type</label>
 {renderBenignMalignant(side, 'calcification_type', finding.calcification_type)}
 </div>
 )}

 <div style={featureGridStyle}>
 {renderYesNoCheckbox(
 'Skin thickening',
 finding.skin_thickening,
 (checked) => handleFindingCheckboxChange(side, 'skin_thickening', checked)
 )}
 {renderYesNoCheckbox(
 'Nipple retraction',
 finding.nipple_retraction,
 (checked) => handleFindingCheckboxChange(side, 'nipple_retraction', checked)
 )}
 {renderYesNoCheckbox(
 'Lymph nodes',
 finding.has_lymph_nodes,
 (checked) => handleFindingCheckboxChange(side, 'has_lymph_nodes', checked)
 )}
 {renderYesNoCheckbox(
 'Architectural distortion',
 finding.architectural_distortion,
 (checked) => handleFindingCheckboxChange(side, 'architectural_distortion', checked)
 )}
 {renderYesNoCheckbox(
 'Focal asymmetry',
 finding.focal_asymmetry,
 (checked) => handleFindingCheckboxChange(side, 'focal_asymmetry', checked)
 )}
 {renderYesNoCheckbox(
 'Asymmetry',
 finding.asymmetry,
 (checked) => handleFindingCheckboxChange(side, 'asymmetry', checked)
 )}
 </div>

 {finding.has_lymph_nodes && (
 <div style={conditionalBlockStyle}>
 <label style={labelStyle}>Lymph Node Type</label>
 {renderBenignMalignant(side, 'lymph_node_type', finding.lymph_node_type)}
 </div>
 )}

 <div style={twoColumnStyle}>
 <div>
 <label style={labelStyle}>BIRADS Category</label>
 <select
 value={finding.birads_category}
 onChange={(e) => handleBreastFindingChange(side, 'birads_category', e.target.value)}
 style={selectStyle}
 >
 <option value="">Select BIRADS</option>
 {biradsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>ACR Breast Density</label>
 <select
 value={finding.acr_density}
 onChange={(e) => handleBreastFindingChange(side, 'acr_density', e.target.value)}
 style={selectStyle}
 >
 <option value="">Select Density</option>
 {densityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div style={formStyle}>
 <form onSubmit={handleSubmit}>
 <div style={sectionStyle}>
 <label style={labelStyle}>Questionnaire Feedback</label>
 <textarea
 name="questionnaire_feedback"
 value={formData.questionnaire_feedback}
 onChange={handleInputChange}
 style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
 placeholder="Enter feedback regarding the questionnaire..."
 />
 <label style={checkboxContainerStyle}>
 <input
 type="checkbox"
 id="is_questionnaire_correct"
 name="is_questionnaire_correct"
 checked={formData.is_questionnaire_correct}
 onChange={handleInputChange}
 style={{ marginRight: '10px' }}
 />
 Questionnaire is correct
 </label>
 </div>

 <div style={sectionStyle}>
 <h4 style={{ marginBottom: '10px' }}>Uploads</h4>
 {renderYesNoCheckbox(
 'Routine CC/MLO views of both breasts uploaded',
 formData.routine_views_uploaded,
 (checked) => setFormData(prev => ({ ...prev, routine_views_uploaded: checked }))
 )}

 <label style={labelStyle}>Upload DICOM Images (up to 10)</label>
 <input
 type="file"
 name="mammo_dicom"
 multiple
 accept=".dcm,application/dicom"
 onChange={handleFileChange}
 style={inputStyle}
 />

 <label style={labelStyle}>Mammography Reading (Image or PDF)</label>
 <input
 type="file"
 name="mammo_reading"
 accept="image/*,.pdf"
 onChange={handleFileChange}
 style={inputStyle}
 />

 <label style={labelStyle}>Ultrasound Video</label>
 <input
 type="file"
 name="us_video"
 accept="video/*"
 onChange={handleFileChange}
 style={inputStyle}
 />

 <label style={labelStyle}>Ultrasound Reading (Image or PDF)</label>
 <input
 type="file"
 name="us_reading"
 accept="image/*,.pdf"
 onChange={handleFileChange}
 style={inputStyle}
 />

 <label style={labelStyle}>Biopsy Document (Image or PDF)</label>
 <input
 type="file"
 name="biopsy_doc"
 accept="image/*,.pdf"
 onChange={handleFileChange}
 style={inputStyle}
 />
 </div>

 <div style={sectionStyle}>
 <h4 style={{ marginBottom: '10px' }}>Legacy Mammography Summary</h4>
 <div style={twoColumnStyle}>
 <div>
 <label style={labelStyle}>Mammography BIRADS</label>
 <select
 name="mammo_birads"
 value={formData.mammo_birads}
 onChange={handleInputChange}
 style={selectStyle}
 >
 <option value="">Select BIRADS</option>
 {legacyBiradsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Mammography Density</label>
 <select
 name="mammo_density"
 value={formData.mammo_density}
 onChange={handleInputChange}
 style={selectStyle}
 >
 <option value="">Select Density</option>
 {densityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 </div>
 </div>

 <div style={sectionStyle}>
 {renderBreastSection('right', 'Right Breast Composition', rightBiradsOptions)}
 {renderBreastSection('left', 'Left Breast Composition', leftBiradsOptions)}
 </div>

 <div style={sectionStyle}>
 <h4 style={{ marginBottom: '10px' }}>Ultrasound & Biopsy Summary</h4>
 <div style={twoColumnStyle}>
 <div>
 <label style={labelStyle}>US/Biopsy BIRADS</label>
 <select
 name="us_biopsy_birads"
 value={formData.us_biopsy_birads}
 onChange={handleInputChange}
 style={selectStyle}
 >
 <option value="">Select BIRADS</option>
 {legacyBiradsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>US/Biopsy Density</label>
 <select
 name="us_biopsy_density"
 value={formData.us_biopsy_density}
 onChange={handleInputChange}
 style={selectStyle}
 >
 <option value="">Select Density</option>
 {densityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
 </select>
 </div>
 </div>
 </div>

 <div style={sectionStyle}>
 <h4 style={{ marginBottom: '10px' }}>Final Assessment</h4>
 <label style={labelStyle}>Precision Diagnosis</label>
 <select
 name="precision_diagnosis"
 value={formData.precision_diagnosis}
 onChange={handleInputChange}
 style={selectStyle}
 >
 <option value="">Select Diagnosis</option>
 <option value="4A">4A</option>
 <option value="4B">4B</option>
 <option value="4C">4C</option>
 </select>

 <label style={labelStyle}>Datapoint Feedback</label>
 <textarea
 name="datapoint_feedback"
 value={formData.datapoint_feedback}
 onChange={handleInputChange}
 style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
 placeholder="Additional datapoint feedback..."
 />

 <label style={labelStyle}>Recommendation and Follow-up</label>
 <textarea
 name="recommendation_followup"
 value={formData.recommendation_followup}
 onChange={handleInputChange}
 style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
 placeholder="Enter recommendation and follow-up plan..."
 />
 </div>

 {message.text && (
 <div style={{
 padding: '10px',
 marginBottom: '15px',
 borderRadius: '4px',
 backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
 color: message.type === 'success' ? '#155724' : '#721c24',
 border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
 }}>
 {message.text}
 </div>
 )}

 <button
 type="submit"
 disabled={isSubmitting}
 style={{
 ...submitButtonStyle,
 opacity: isSubmitting ? 0.7 : 1
 }}
 >
 {isSubmitting ? 'Saving...' : 'Save Assessment'}
 </button>
 </form>
 </div>
 );
};

const legacyBiradsOptions = ['0', '1', '2', '3', '4', '5', '6'];
const rightBiradsOptions = ['1', '2', '3', '4A', '4B', '4C', '5', '6'];
const leftBiradsOptions = ['1', '2', '3', '4A', '4B', '4C', '5', '6'];
const densityOptions = ['A', 'B', 'C', 'D'];

const formStyle = {
 marginTop: '20px',
 padding: '0 0 20px',
 border: '1px solid #ddd',
 borderRadius: '8px',
 backgroundColor: '#f9f9f9',
 overflow: 'hidden'
};

const brandHeaderStyle = {
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 gap: '18px',
 padding: '18px 20px',
 marginBottom: '20px',
 backgroundColor: '#fff',
 borderBottom: '1px solid #eadce6',
 flexWrap: 'wrap'
};

const logoClusterStyle = {
 display: 'flex',
 alignItems: 'center',
 gap: '14px',
 minWidth: '280px',
 flex: '1 1 360px'
};

const headerTextStyle = {
 minWidth: 0
};

const eyebrowStyle = {
 display: 'block',
 color: '#8B008B',
 fontSize: '12px',
 fontWeight: 700,
 textTransform: 'uppercase',
 marginBottom: '4px'
};

const titleStyle = {
 margin: 0,
 color: '#242124',
 fontSize: '22px',
 lineHeight: 1.25
};

const subtitleStyle = {
 margin: '4px 0 0',
 color: '#666',
 fontSize: '13px',
 lineHeight: 1.4
};

const partnerLogoRowStyle = {
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'flex-end',
 gap: '14px',
 flex: '1 1 280px'
};

const partnerLogoStyle = {
 width: '58px',
 height: '58px',
 objectFit: 'contain',
 flexShrink: 0
};

const moeLogoStyle = {
 width: '180px',
 maxWidth: '42vw',
 height: '60px',
 objectFit: 'contain',
 flexShrink: 1,
 backgroundColor: '#fff',
 borderRadius: '6px',
 border: '1px solid #e6e0e6',
 padding: '8px',
 filter: 'brightness(1.8) contrast(1.25)'
};

const sectionStyle = {
 marginBottom: '20px',
 marginLeft: '20px',
 marginRight: '20px',
 paddingBottom: '15px',
 borderBottom: '1px solid #eee'
};

const subsectionStyle = {
 marginBottom: '20px',
 padding: '16px',
 border: '1px solid #ddd',
 borderRadius: '6px',
 backgroundColor: '#fff'
};

const conditionalBlockStyle = {
 padding: '12px',
 marginBottom: '12px',
 borderLeft: '3px solid #8B008B',
 backgroundColor: '#fff5f7'
};

const labelStyle = {
 display: 'block',
 marginBottom: '5px',
 fontWeight: 'bold',
 color: '#555'
};

const inputStyle = {
 width: '100%',
 padding: '8px',
 marginBottom: '10px',
 borderRadius: '4px',
 border: '1px solid #ccc',
 boxSizing: 'border-box'
};

const selectStyle = {
 width: '100%',
 padding: '8px',
 marginBottom: '10px',
 borderRadius: '4px',
 border: '1px solid #ccc',
 backgroundColor: 'white'
};

const checkboxContainerStyle = {
 display: 'flex',
 alignItems: 'center',
 marginBottom: '12px',
 color: '#333'
};

const inlineRadioGroupStyle = {
 display: 'flex',
 gap: '16px',
 marginBottom: '10px'
};

const radioLabelStyle = {
 display: 'flex',
 alignItems: 'center',
 gap: '6px',
 color: '#333'
};

const featureGridStyle = {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
 gap: '4px 16px',
 margin: '10px 0'
};

const twoColumnStyle = {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
 gap: '15px'
};

const submitButtonStyle = {
 backgroundColor: '#007bff',
 color: 'white',
 padding: '10px 20px',
 border: 'none',
 borderRadius: '4px',
 cursor: 'pointer',
 fontSize: '16px',
 fontWeight: 'bold',
 width: '100%'
};

export default DoctorAssessmentForm;
