// pages/api/[tic_id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tic_id } = req.query;
  try {
    const response = await axios.post('https://flask-8gn2.onrender.com', { tic_id });
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
}