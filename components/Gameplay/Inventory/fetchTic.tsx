import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface LightkurveData {
  tic_id: string;
  median_flux: number;
  num_trees: number;
  flux: number[];
}

const LightkurveForm: React.FC = () => {
  const [ticId, setTicId] = useState('');
  const [graphData, setGraphData] = useState<LightkurveData | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTicId(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post<LightkurveData>(`https://flask-8gn2.onrender.com/api/resultss`, { tic_id: ticId });
      setGraphData(response.data);
    } catch (error) {
      console.error('An error occurred while fetching the data:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={ticId} onChange={handleInputChange} />
        <button type="submit">Fetch Lightkurve Data</button>
      </form>
      {graphData && (
        <div>
          <h2>TIC ID: {graphData.tic_id}</h2>
          <p>Median Flux: {graphData.median_flux}</p>
          <p>Number of Trees: {graphData.num_trees}</p>
          <h3>Flux Values:</h3>
          <ul>
            {graphData.flux.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LightkurveForm;