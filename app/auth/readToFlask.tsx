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
        const result = await response.text();
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

interface Anomaly {
  id: number;
  content: string | null;
  anomalytype: string | null;
  anomalySet: string | null;
  type: string | null;
  classification_status: string | null;
  avatar_url: string | null;
  created_at: string;
  deepnote: string | null;
  configuration: any;
  parentAnomaly: number | null;
}

export const AnomaliesData: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const response = await fetch('/citizen/anomalies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: Anomaly[] = await response.json();
        setAnomalies(result);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Anomalies List</h1>
      {anomalies.length > 0 ? (
        <ul>
          {anomalies.map(anomaly => (
            <li key={anomaly.id}>
              <p><strong>ID:</strong> {anomaly.id}</p>
              <p><strong>Content:</strong> {anomaly.content ?? 'N/A'}</p>
              <p><strong>Type:</strong> {anomaly.type ?? 'N/A'}</p>
              <p><strong>Classification Status:</strong> {anomaly.classification_status ?? 'N/A'}</p>
              <p><strong>Created At:</strong> {new Date(anomaly.created_at).toLocaleString()}</p>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No anomalies found.</p>
      )}
    </div>
  );
};