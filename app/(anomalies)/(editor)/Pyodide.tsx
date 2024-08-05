"use client";

import { useState, useEffect } from 'react';
import { PyodideInterface } from 'pyodide';

const SandpackComponent = () => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [TIC, setTIC] = useState('Trappist-1f');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const initPyodide = async () => {
      try {
        // Dynamically import pyodide only when running on the client-side
        const { loadPyodide } = await import('pyodide');
        const pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/',
        });
        await pyodideInstance.loadPackage('matplotlib');
        await pyodideInstance.loadPackage('lightkurve');
        setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
      }
    };

    initPyodide();
  }, []);

  const handleGenerateImage = async () => {
    if (!pyodide) return;

    try {
      const code = `
import lightkurve as lk
import matplotlib.pyplot as plt
import io
from base64 import b64encode

TIC = '${TIC}'
sector_data = lk.search_lightcurve(TIC, author='SPOC', sector=70)
lc = sector_data.download()
lc_stitched = lc.normalize()

plt.figure()
lc_stitched.plot(color='gold', lw=0, marker='.')
bin_time = 15/24/60
lc_collection_binned = lc_stitched.bin(bin_time)
lc_collection_binned.plot(color='gold', lw=0, marker='.')

buffer = io.BytesIO()
plt.savefig(buffer, format='png')
buffer.seek(0)
image_base64 = b64encode(buffer.read()).decode('ascii')
image_base64
      `;

      const result = await pyodide.runPythonAsync(code);
      setImageSrc(`data:image/png;base64,${result}`);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={TIC} 
        onChange={(e) => setTIC(e.target.value)} 
        placeholder="Enter TIC value" 
      />
      <button onClick={handleGenerateImage} disabled={!pyodide}>
        Generate Plot
      </button>
      {imageSrc && <img src={imageSrc} alt="Lightkurve Plot" />}
    </div>
  );
};

export default SandpackComponent;
