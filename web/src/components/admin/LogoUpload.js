import React, { useState } from 'react';
import axios from 'axios';
import '../../assets/styles/logoupload.css';

const LogoUpload = ({ teamId, onUpload }) => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus('uploading');
    setError('');

    const formData = new FormData();
    formData.append('logo', e.target.logo.files[0]);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/teams/${teamId}/logo`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          validateStatus: status => status < 500
        }
      );

      if (response.status === 200) {
        setUploadStatus('success');
        setSelectedFile(null);
        e.target.reset();
        onUpload();
      } else {
        setError(response.data.error || 'Upload failed');
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Network error occurred');
      setUploadStatus('error');
    }
  };

  return (
    <div className="logo-upload">
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          name="logo" 
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          required
        />
        <button 
          type="submit" 
          disabled={!selectedFile || uploadStatus === 'uploading'}
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Logo'}
        </button>
      </form>
      
      {uploadStatus === 'success' && (
        <div className="upload-status success">
          Logo uploaded successfully!
        </div>
      )}
      
      {error && (
        <div className="upload-status error">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoUpload;