import { Button } from "../ui/Button";
import { Checkbox } from "../ui/checkbox";
import { Line } from "react-chartjs-2";

export function RoverMobileTest() {
  return (
    <div className="bg-white text-gray-900 p-4">
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-md shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Camera Feed</h2>
            <Button className="text-xs" variant="secondary">
              Expand
            </Button>
          </div>
          <div className="space-y-2">
            <img
              alt="Dash Cam"
              className="w-full h-auto"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "200/100",
                objectFit: "cover",
              }}
              width="200"
            />
          </div>
        </div>
        <div className="p-4 bg-white rounded-md shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Command Terminal</h2>
            <Button className="text-xs" variant="secondary">
              Expand
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Checkbox id="cmd1" />
              <label className="flex-1 ml-2" htmlFor="cmd1">
                Rotate Camera 39° - Sent 15:35
              </label>
            </div>
            <div className="flex items-center justify-between">
              <Checkbox id="cmd2" />
              <label className="flex-1 ml-2" htmlFor="cmd2">
                Rotate Side Camera 56° - Sent 15:24
              </label>
            </div>
            <div className="flex items-center justify-between">
              <Checkbox id="cmd3" />
              <label className="flex-1 ml-2" htmlFor="cmd3">
                Movement Control Initiated - Sent 15:23
              </label>
            </div>
            <Button className="mt-4" variant="destructive">
              Clear Log
            </Button>
          </div>
        </div>
        <div className="p-4 bg-white rounded-md shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Test Results</h2>
            <Button className="text-xs" variant="secondary">
              Expand
            </Button>
          </div>
          {/* <LineChart className="w-full h-[200px]" /> */}
        </div>
      </div>
    </div>
  );
};

function LineChart(props) {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Desktop",
        data: [43, 137, 61, 145, 26, 154],
        borderColor: "#2563eb",
        fill: false,
      },
      {
        label: "Mobile",
        data: [60, 48, 177, 78, 96, 204],
        borderColor: "#e11d48",
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category', // Specify the scale type explicitly
        ticks: {
          color: "black",
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          color: "black",
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "black",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return <Line data={data} options={options} {...props} />;
}

export default LineChart;
