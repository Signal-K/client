import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const FileOrWebcamUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [webcamImage, setWebcamImage] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log('File selected:', e.target.files[0].name);
    }
  };

  // Capture image from webcam
  const captureWebcamImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setWebcamImage(imageSrc);
      console.log('Webcam image captured');
    }
  };

  // Handle upload (file or webcam image)
  const handleUpload = async () => {
    setUploading(true);
    const image = file ? file : webcamImage;
    if (!image) return;

    console.log('Preparing to upload image...');
    const formData = new FormData();
    formData.append('file', image);

    try {
      setLoading(true);
      console.log('Uploading image to API...');
      const response = await axios.post('/api/zoodex/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get classification result from API response
      console.log('Received classification result:', response.data);
      setClassificationResult(response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Webcam reference
  const webcamRef = React.useRef<Webcam>(null);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Upload a File or Use Webcam</h2>
        <div className="flex space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded"
            accept="image/*"
          />
          <button
            onClick={captureWebcamImage}
            className="border p-2 rounded bg-blue-500 text-white"
          >
            Use Webcam
          </button>
        </div>
      </div>

      {webcamImage && (
        <div className="mb-4">
          <img src={webcamImage} alt="Captured from webcam" className="w-80 h-80 object-cover" />
        </div>
      )}

      {file && (
        <div className="mb-4">
          <p>Selected File: {file.name}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        className="border p-2 rounded bg-green-500 text-white mb-4"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {loading && <p>Classifying...</p>}

      {classificationResult && (
        <div className="mt-4 p-4 border rounded bg-gray-100 w-full max-w-md">
          <h3 className="text-xl font-semibold">Classification Result:</h3>
          <p className="mt-2">Lifeform: {classificationResult.name}</p>
          <p className="mt-1">Traits: {classificationResult.traits.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default FileOrWebcamUpload;