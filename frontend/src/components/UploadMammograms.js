import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UploadMammograms = ({ patientId }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState({
    rmlo: null,
    rcc: null,
    lmlo: null,
    lcc: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles.length > 0) {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: inputFiles[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('patient_id', patientId);

    let fileUploaded = false;
    for (const key in files) {
      if (files[key]) {
        formData.append('files', files[key], `${patientId}_${key.toUpperCase()}.dcm`);
        fileUploaded = true;
      }
    }

    if (!fileUploaded) {
      setUploadMessage('Please select at least one file to upload.');
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch('/api/mammograms/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage('Files uploaded successfully!');
        console.log('Upload successful:', result);
      } else {
        const errorResult = await response.json();
        setUploadMessage(`Upload failed: ${errorResult.detail || 'Unknown error'}`);
        console.error('Upload failed:', errorResult);
      }
    } catch (error) {
      setUploadMessage('An error occurred during upload.');
      console.error('An error occurred during upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-mammograms-container">
      <h2>{t('upload_mammograms.title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rmlo">{t('upload_mammograms.rmlo_label')}</label>
          <input type="file" id="rmlo" name="rmlo" onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label htmlFor="rcc">{t('upload_mammograms.rcc_label')}</label>
          <input type="file" id="rcc" name="rcc" onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label htmlFor="lmlo">{t('upload_mammograms.lmlo_label')}</label>
          <input type="file" id="lmlo" name="lmlo" onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label htmlFor="lcc">{t('upload_mammograms.lcc_label')}</label>
          <input type="file" id="lcc" name="lcc" onChange={handleFileChange} />
        </div>
        <button type="submit" disabled={isUploading}>
          {isUploading ? t('upload_mammograms.uploading_button') : t('upload_mammograms.upload_button')}
        </button>
      </form>
      {uploadMessage && <p>{uploadMessage}</p>}
    </div>
  );
};

export default UploadMammograms;
