import React, { useState, useEffect } from 'react';

const CitizenData: React.FC = () => {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/citizen');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.text(); // assuming plain text response
        setData(result);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      };
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{data}</div>;
};

export default CitizenData;