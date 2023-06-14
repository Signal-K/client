import { Button } from "../_Core/ui/Button";
import { Checkbox } from "../_Core/ui/checkbox";
// import { ResponsiveLine } from "@nivo/line";
import { Input } from "../_Core/ui/input";

import { Textarea } from "../_Core/ui/TextArea";

export function RoverInterface() {
  return (
    <div className="bg-white text-gray-900 p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Map</h2>
              <Button className="text-xs" variant="secondary">
                Expand
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Checkbox id="position-a" />
                <label className="flex-1 ml-2" htmlFor="position-a">
                  Position A - 130m
                </label>
              </div>
              <div className="flex items-center justify-between">
                <Checkbox id="position-b" />
                <label className="flex-1 ml-2" htmlFor="position-b">
                  Position B - 75m
                </label>
              </div>
              <img
                alt="Map"
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
              <h2 className="text-lg font-semibold">Test Results</h2>
              <Button className="text-xs" variant="secondary">
                Expand
              </Button>
            </div>
            {/* <LineChart className="w-full h-[200px]" /> */}
          </div>
        </div>
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
              <img
                alt="Arm Cam"
                className="w-full h-auto"
                height="100"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "200/100",
                  objectFit: "cover",
                }}
                width="200"
              />
              <img
                alt="Corner Cam"
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
              <h2 className="text-lg font-semibold">Power Control</h2>
              <Button className="text-xs" variant="secondary">
                Expand
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Front Arm</span>
                {/* <Progress className="w-[60%]" value={0} /> */}
              </div>
              <div className="flex justify-between items-center">
                <span>Back Camera</span>
                {/* <Progress className="w-[60%]" value={36} /> */}
              </div>
              <div className="flex justify-between items-center">
                <span>Sensor (Main)</span>
                {/* <Progress className="w-[60%]" value={24} /> */}
              </div>
              <div className="flex justify-center items-center mt-4">
                <BatteryIcon className="text-4xl" />
                <span className="ml-2 text-2xl">34/100</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Command Log</h2>
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
              <h2 className="text-lg font-semibold">Command</h2>
              <Button className="text-xs" variant="secondary">
                Expand
              </Button>
            </div>
            <Input className="mb-4" placeholder="/Enter Manual Command" type="text" />
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">FD: Forward</Button>
              <Button variant="outline">BK: Backward</Button>
              <Button variant="outline">LT: Left</Button>
              <Button variant="outline">RT: Right</Button>
            </div>
            <Input className="mt-4" placeholder="Distance/Angle" type="text" />
            <Input className="mt-4" placeholder="Speed" type="text" />
          </div>
        </div>
      </div>
    </div>
  )
}


// function LineChart(props) {
//   return (
//     <div {...props}>
//       <ResponsiveLine
//         data={[
//           {
//             id: "Desktop",
//             data: [
//               { x: "Jan", y: 43 },
//               { x: "Feb", y: 137 },
//               { x: "Mar", y: 61 },
//               { x: "Apr", y: 145 },
//               { x: "May", y: 26 },
//               { x: "Jun", y: 154 },
//             ],
//           },
//           {
//             id: "Mobile",
//             data: [
//               { x: "Jan", y: 60 },
//               { x: "Feb", y: 48 },
//               { x: "Mar", y: 177 },
//               { x: "Apr", y: 78 },
//               { x: "May", y: 96 },
//               { x: "Jun", y: 204 },
//             ],
//           },
//         ]}
//         margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
//         xScale={{
//           type: "point",
//         }}
//         yScale={{
//           type: "linear",
//         }}
//         axisTop={null}
//         axisRight={null}
//         axisBottom={{
//           tickSize: 0,
//           tickPadding: 16,
//         }}
//         axisLeft={{
//           tickSize: 0,
//           tickValues: 5,
//           tickPadding: 16,
//         }}
//         colors={["#2563eb", "#e11d48"]}
//         pointSize={6}
//         useMesh={true}
//         gridYValues={6}
//         theme={{
//           tooltip: {
//             chip: {
//               borderRadius: "9999px",
//             },
//             container: {
//               fontSize: "12px",
//               textTransform: "capitalize",
//               borderRadius: "6px",
//             },
//           },
//           grid: {
//             line: {
//               stroke: "#f3f4f6",
//             },
//           },
//         }}
//         role="application"
//       />
//     </div>
//   )
// }


function BatteryIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </svg>
  );
};

export function RoverInterfaceDark() {
  return (
    <div className="bg-black bg-opacity-70 text-white min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-6 border border-white p-4">
          <div className="text-4xl font-bold">Planet Name</div>
          <div>
            <div className="font-semibold">ROVER #1 (Allow user to customise name)</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div>MISSION DAY</div>
                <div>SOL #3039</div>
                <div>Time: 2:36 pm</div>
              </div>
              <div>
                <div>SUNRISE</div>
                <div>6:37 am</div>
                <div>SUNSET</div>
                <div>6:35 pm</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div>PRESSURE</div>
              <div className="flex items-center">
                <GaugeIcon className="text-green-500" />
                <span>827 Pa</span>
              </div>
            </div>
            <div>
              <div>OXYGEN</div>
              <div className="flex items-center">
                <FuelIcon className="text-green-500" />
                <span>0.24%</span>
              </div>
            </div>
          </div>
          <div>
            <div>TEMPERATURE</div>
            <div className="flex items-center">
              <ThermometerIcon className="text-red-500" />
              <span>-29.16 °C</span>
            </div>
          </div>
          <div>
            <div>ATMOSPHERE</div>
            <div>Moderate sunny</div>
          </div>
          <div>
            <div>ROVER STATUS</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div>CELL</div>
                <div>65.25</div>
              </div>
              <div>
                <div>GAS PRESS</div>
                <div>12.48</div>
              </div>
            </div>
            <div>
              <div>MODE</div>
              <div>DRV</div>
            </div>
          </div>
          <div>
            <div>SPEED</div>
            <div>118 km/hour</div>
          </div>
        </div>
        <div className="col-span-1 space-y-6 border border-white p-4">
          <div className="text-xl font-semibold">CAMERA CONTROL PANEL</div>
          <div>
            <video
              className="w-full h-auto"
              height="300"
              src="/assets/Surface.mp4"
              style={{
                aspectRatio: "350/300",
                objectFit: "cover",
              }}
              width="350"
              autoPlay
              loop
              muted
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="ghost">Coordinates</Button>
              <Button variant="ghost">Angle</Button>
              <Button variant="ghost">Information</Button>
            </div>
            <div className="flex space-x-2">
              <ZoomInIcon className="text-white" />
              <ZoomOutIcon className="text-white" />
              <CameraIcon className="text-white" />
            </div>
          </div>
          <div>
            <Textarea placeholder="Write a command" />
            <div className="flex justify-between items-center">
              <Button>SEND COMMAND</Button>
              <div className="flex space-x-2">
                <Button variant="ghost">DIAGNOSTICS</Button>
                <Button variant="ghost">SELF-REPAIR</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 border border-white p-4">
          <div className="text-xl font-semibold">CONTROL CENTER</div>
          <div>
            <div>INDICATORS</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div>METEOROLOGICAL DATA</div>
                <div className="flex space-x-2">
                  <WindIcon className="text-white" />
                  <ThermometerIcon className="text-white" />
                  <ThermometerIcon className="text-white" />
                </div>
              </div>
              <div>
                <div>INFORMATION</div>
                <div className="flex space-x-2">
                  <InfoIcon className="text-white" />
                  <FileWarningIcon className="text-yellow-500" />
                  <BugIcon className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div>SOLAR SYSTEM</div>
            <div className="flex items-center">
              <SunIcon className="text-yellow-500" />
              <span>Angle</span>
              <span>Condition</span>
              <span className="text-red-500">#002034 Failed</span>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost">DIAGNOSTICS</Button>
              <Button variant="ghost">SELF-REPAIR</Button>
            </div>
          </div>
          <div>
            <div>ANTENNA FOR DATA TRANSMISSION</div>
            <div className="flex items-center">
              <AntennaIcon className="text-white" />
              <span>Angle</span>
              <span>Condition</span>
              <span className="text-red-500">#12-509 Failed</span>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost">DIAGNOSTICS</Button>
              <Button variant="ghost">SELF-REPAIR</Button>
            </div>
          </div>
          <div>
            <div>SURFACE COMPOSITION DETECTOR</div>
            <div className="flex items-center">
              <RadarIcon className="text-white" />
              <span>Coordinates</span>
              <span>Soil Sample</span>
              <span>Condition</span>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost">DIAGNOSTICS</Button>
              <Button variant="ghost">SELF-REPAIR</Button>
            </div>
          </div>
          <div>
            <div>HEATERS</div>
            <div className="flex items-center">
              <ThermometerIcon className="text-white" />
              <span>Coordinates</span>
              <span>Soil Sample</span>
              <span>Condition</span>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost">DIAGNOSTICS</Button>
              <Button variant="ghost">SELF-REPAIR</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AntennaIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12 7 2" />
      <path d="m7 12 5-10" />
      <path d="m12 12 5-10" />
      <path d="m17 12 5-10" />
      <path d="M4.5 7h15" />
      <path d="M12 16v6" />
    </svg>
  )
}


function BugIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  )
}


function CameraIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}


function FileWarningIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}


function FuelIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" x2="15" y1="22" y2="22" />
      <line x1="4" x2="14" y1="9" y2="9" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </svg>
  )
}


function GaugeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  )
}


function InfoIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}


function RadarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 18h.01" />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
      <circle cx="12" cy="12" r="2" />
      <path d="m13.41 10.59 5.66-5.66" />
    </svg>
  )
}


function SunIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}


function ThermometerIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  )
}


function WindIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}


function ZoomInIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  )
}


function ZoomOutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  )
};