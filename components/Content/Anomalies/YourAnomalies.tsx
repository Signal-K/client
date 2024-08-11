import { useUserAnomalies } from '@/context/UserAnomalies';
import { useEffect } from 'react';

const UserAnomaliesComponent = () => {
  const { userAnomalies, fetchUserAnomalies } = useUserAnomalies();

  useEffect(() => {
    fetchUserAnomalies();
  }, []);

  return (
    <div>
      <h2>User Anomalies</h2> 
      <ul>
        {userAnomalies.map(anomaly => (
          <li key={anomaly.id}>Anomaly ID: {anomaly.anomaly_id}, Owned since: {anomaly.ownership_date}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserAnomaliesComponent;