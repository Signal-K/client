"use client";

import React, { useState, useEffect } from "react";

interface Classification {
  classification_id: number;
  content: string | null;
  classificationtype: string;
  created_at: string;
};

interface AnomaliesGroup {
  anomaly_id: number;
  content: string | null;
  created_at: string;
};

interface ClassificationsData {
  [anomalytype: string]: {
    [anomalySet: string]: {
      [author: string]: Classification[];
    };
  };
};

interface AnomaliesData {
  [anomalytype: string]: AnomaliesGroup[];
};

interface ClassificationsAndAnomaliesResponse {
  classifications: ClassificationsData;
  anomalies: AnomaliesData;
};

const ClassificationsAndAnomalies: React.FC = () => {
  const [data, setData] = useState<ClassificationsAndAnomaliesResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/citizen/output");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result: ClassificationsAndAnomaliesResponse =
          await response.json();
        setData(result);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Classifications and Anomalies</h1>

      {/* Render Classifications */}
      {data && data.classifications ? (
        <div>
          <h2>Classifications</h2>
          {Object.keys(data.classifications).map((anomalyType) => (
            <div key={anomalyType}>
              <h3>Anomaly Type: {anomalyType}</h3>
              {Object.keys(data.classifications[anomalyType]).map(
                (anomalySet) => (
                  <div key={anomalySet}>
                    <h4>Anomaly Set: {anomalySet}</h4>
                    {Object.keys(
                      data.classifications[anomalyType][anomalySet]
                    ).map((author) => (
                      <div key={author}>
                        <h5>Author: {author}</h5>
                        <ul>
                          {data.classifications[anomalyType][anomalySet][
                            author
                          ].map((classification) => (
                            <li key={classification.classification_id}>
                              <p>
                                <strong>Classification ID:</strong>{" "}
                                {classification.classification_id}
                              </p>
                              <p>
                                <strong>Content:</strong>{" "}
                                {classification.content ?? "N/A"}
                              </p>
                              <p>
                                <strong>Classification Type:</strong>{" "}
                                {classification.classificationtype}
                              </p>
                              <p>
                                <strong>Created At:</strong>{" "}
                                {new Date(
                                  classification.created_at
                                ).toLocaleString()}
                              </p>
                              <hr />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No classifications found.</p>
      )}

      {/* Render Anomalies */}
      {data && data.anomalies ? (
        <div>
          <h2>Anomalies</h2>
          {Object.keys(data.anomalies).map((anomalyType) => (
            <div key={anomalyType}>
              <h3>Anomaly Type: {anomalyType}</h3>
              <ul>
                {data.anomalies[anomalyType].map((anomaly) => (
                  <li key={anomaly.anomaly_id}>
                    <p>
                      <strong>Anomaly ID:</strong> {anomaly.anomaly_id}
                    </p>
                    <p>
                      <strong>Content:</strong> {anomaly.content ?? "N/A"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(anomaly.created_at).toLocaleString()}
                    </p>
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No anomalies found.</p>
      )}
    </div>
  );
};

export default ClassificationsAndAnomalies;