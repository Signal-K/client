import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.post(
      "https://appeears.earthdatacloud.nasa.gov/api/login",
      {
        auth: {
          username: "mcdepth",
          password: "VgZ#MNYz5&Fv$@TPF!q*kJCeKw",
        },
      }
    );
    const tokenResponse = await response.json();
    res.status(200).json(tokenResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
