import type { NextApiRequest, NextApiResponse } from 'next'
 
export interface Product {
    Product:             string;
    Platform:            string;
    Description:         string;
    RasterType:          RasterType;
    Resolution:          Resolution;
    TemporalGranularity: TemporalGranularity;
    Version:             string;
    Available:           boolean;
    DocLink:             string;
    Source:              Source;
    TemporalExtentStart: string;
    TemporalExtentEnd:   Date | TemporalExtentEndEnum;
    Deleted:             boolean;
    DOI:                 string;
    Info:                Info;
    ProductAndVersion:   string;
}

export interface Info {
    provider_id?:     string;
    platform?:        string;
    extension?:       string;
    is_utm_zonal?:    boolean;
    cmr_date_parse?:  string;
    edc_provider_id?: string;
}

export enum RasterType {
    Swath = "Swath",
    Tile = "Tile",
}

export enum Resolution {
    The1000M = "1000m",
    The250M = "250m",
    The30M = "30m",
    The36000M = "36000m",
    The4000M = "4000m",
    The5001000M = "500/1000m",
    The500M = "500m",
    The70M = "70m",
    The9000M = "9000m",
    The90M = "90m",
}

export enum Source {
    LpDaac = "LP DAAC",
    NsidcDaac = "NSIDC DAAC",
    Ornl = "ORNL",
    Sedac = "SEDAC",
    Usgs = "USGS",
}

export enum TemporalExtentEndEnum {
    Present = "Present",
    The2212000 = "2/21/2000",
}

export enum TemporalGranularity {
    Daily = "Daily",
    Hourly = "Hourly",
    ISSDependent = "ISS-dependent",
    Monthly = "Monthly",
    Quinquennial = "Quinquennial",
    Static = "Static",
    The16Day = "16 day",
    The4Day = "4 day",
    The8Day = "8 day",
    Yearly = "Yearly",
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const response = await fetch('https://appeears.earthdatacloud.nasa.gov/api/product');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: Product[] = await response.json();
      console.log(data);
      console.log(data.length)
      const random = Math.floor(Math.random() * data.length);
        console.log(random, data[random]);
  
      res.status(200).json(data[random]); // Send the fetched data as a JSON response
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }