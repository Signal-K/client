import React, { useState } from 'react';
import axios from 'axios';

const StarInfoComponent = () => {
  const [ticId, setTicId] = useState('');
  const [starInfo, setStarInfo] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');

  const handleTicIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicId(e.target.value);
  };

  const getStarInfo = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/get_star_info', { ticId });
      setStarInfo(response.data);
      setError('');
    } catch (error) {
      setError('Error: Unable to fetch star information.');
      setStarInfo({});
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Star Information</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter TIC ID"
          value={ticId}
          onChange={handleTicIdChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <button onClick={getStarInfo} className="w-full bg-blue-500 text-white py-2 rounded-md">
        Get Star Info
      </button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {Object.keys(starInfo).length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Star Info:</h2>
          <ul>
            {Object.entries(starInfo).map(([key, value]) => (
              <li key={key} className="mt-2">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StarInfoComponent;