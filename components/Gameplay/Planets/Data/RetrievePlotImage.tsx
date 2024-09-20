import { useState } from "react";

function GeneratePlot() {
  const [plotPath, setPlotPath] = useState("");

  const generateSectorPlot = async (ticId) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_sector_plot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticId }),
      });
      const data = await response.json();
      setPlotPath(data.plot_path);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={() => generateSectorPlot("55525572")}>Generate Sector Plot</button>
      {plotPath && <img src={plotPath} alt="Sector Plot" />}
    </div>
  );
}

export default GeneratePlot;