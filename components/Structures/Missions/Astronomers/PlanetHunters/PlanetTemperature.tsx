import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { SimplePostSingle } from "@/content/Posts/SimplePostSingle";
import { SciFiPanel } from "@/components/ui/styles/sci-fi/panel";
import PickPlanet from "../../PickPlanetStandalone";
// import PlanetTempCalculator from "./TemperatureCalc";
import { SciFiButton } from "@/components/ui/styles/sci-fi/button";

interface ClassificationConfiguration {
  classificationOptions: { [key: string]: any };
  temperature?: string;
  votes?: number;
};

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  classificationConfiguration?: ClassificationConfiguration;
  image_url?: string;
  images?: string[];
  votes?: number;
};

// const calculatePlanetTemperature = (
//   surfaceTempStar: number,
//   orbitalPeriodDays: number,
//   albedo: number = 0.3
// ): number => {
//   const orbitalPeriodSeconds = orbitalPeriodDays * 24 * 60 * 60;
//   const semiMajorAxis = Math.cbrt((orbitalPeriodSeconds ** 2 * 6.67430e-11 * 1.989e30) / (4 * Math.PI ** 2));
//   const flux = (surfaceTempStar ** 4 * 5.670374419e-8) / (4 * Math.PI * semiMajorAxis ** 2);
//   const equilibriumTemp = ((1 - albedo) * flux / (4 * 5.670374419e-8)) ** 0.25;
//   return Math.round(equilibriumTemp - 273.15);
// };

// const Calculator: React.FC = () => {
//   const [surfaceTempStar, setSurfaceTempStar] = useState("");
//   const [orbitalPeriodDays, setOrbitalPeriodDays] = useState("");
//   const [albedo, setAlbedo] = useState("0.3");
//   const [result, setResult] = useState<number | null>(null);

//   const handleCalculate = () => {
//     const tempStar = parseFloat(surfaceTempStar);
//     const periodDays = parseFloat(orbitalPeriodDays);
//     const albedoValue = parseFloat(albedo);
//     if (!isNaN(tempStar) && !isNaN(periodDays) && !isNaN(albedoValue)) {
//       setResult(calculatePlanetTemperature(tempStar, periodDays, albedoValue));
//     }
//   };

//   return (
//     <div className="p-4 rounded shadow-md text-white bg-blackboard">
//       <h3 className="text-lg font-bold mb-4">Temperature Calculator</h3>
//       <div className="mb-2">
//         <label className="block text-gray-300">Star Surface Temperature (K)</label>
//         <input
//           type="number"
//           value={surfaceTempStar}
//           onChange={(e) => setSurfaceTempStar(e.target.value)}
//           className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block text-gray-300">Orbital Period (days)</label>
//         <input
//           type="number"
//           value={orbitalPeriodDays}
//           onChange={(e) => setOrbitalPeriodDays(e.target.value)}
//           className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block text-gray-300">Albedo</label>
//         <input
//           type="number"
//           step="0.01"
//           value={albedo}
//           onChange={(e) => setAlbedo(e.target.value)}
//           className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
//         />
//       </div>
//       <button
//         onClick={handleCalculate}
//         className="w-full p-2 bg-blue-500 rounded text-white hover:bg-blue-600"
//       >
//         Calculate
//       </button>
//       {result !== null && (
//         <p className="mt-4 text-green-400 text-center">
//           Estimated Temperature: {result}°C
//         </p>
//       )}
//     </div>
//   );
// };

export default function PlanetHuntersTemperatureWrapper() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {!selectedAnomaly && <PickPlanet onSelectAnomaly={setSelectedAnomaly} />}
      {selectedAnomaly && <PlanetTemperatureForm anomalyid={selectedAnomaly} />}
    </div>
  );
}''

interface FormProps {
  anomalyid: number;
}''

function PlanetTemperatureForm({ anomalyid }: FormProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [currentClassification, setCurrentClassification] = useState<Classification | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ comment: string; temperature: string }>({ comment: "", temperature: "" });

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("anomaly", anomalyid)
          .eq("classificationtype", "planet");

        if (error) throw error;

        const processedData = data?.map((classification) => {
          const media = classification.media;
          let images: string[] = [];

          if (Array.isArray(media)) {
            media.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                images.push(item);
              } else if (typeof item === "object" && item.uploadUrl) {
                images.push(item.uploadUrl);
              }
            });
          }

          return { ...classification, images, votes: classification.classificationConfiguration?.votes || 0 };
        });

        setClassifications(processedData || []);
        setCurrentClassification(processedData?.[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      };
    };

    fetchClassifications();
  }, [anomalyid, supabase]);

  const handleProposeTempComment = async () => {
    if (!currentClassification) return;
    const { comment, temperature } = commentInputs;
    if (!comment || !temperature) {
      console.error("Both comment and temperature are required!");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: comment,
            classification_id: currentClassification.id,
            author: session?.user?.id,
            configuration: { temperature },
            surveyor: "True",
          },
        ]);

      if (error) {
        throw error;
      };

      setCommentInputs({ comment: "", temperature: "" });
      console.log("Comment inserted successfully with temperature value");
    } catch (err) {
      console.error("Error inserting comment: ", err);
    };
  };

  const handleInputChange = (field: "comment" | "temperature", value: string) => {
    setCommentInputs((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <>Loading...</>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {currentClassification ? (
        <>
            <SimplePostSingle
              id={currentClassification.id.toString()}
              title={`Planet discovery #${currentClassification.id}`}
              author={currentClassification.author || "Unknown"}
              content={currentClassification.content || ""}
              category={currentClassification.classificationtype || "Planet"}
              images={currentClassification.images || []}
            />
            {/* <PlanetTempCalculator /> */}
          <SciFiPanel>
          <div className="flex flex-col items-center mt-4 gap-4">
              <textarea
                value={commentInputs.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                placeholder="Enter your comment"
                className="w-full p-2 border text-gray-500 border-gray-300 rounded"
              />
              <input
                type="number"
                value={commentInputs.temperature}
                onChange={(e) => handleInputChange("temperature", e.target.value)}
                placeholder="Temp (°C)"
                className="w-full p-2 border text-gray-500 border-gray-300 rounded"
              />
              <SciFiButton
                onClick={handleProposeTempComment}
                className="px-4 py-2 text-white bg-blue-500 rounded"
              >
                Submit
              </SciFiButton>
            </div>
          </SciFiPanel>
        </>
      ) : (
        <div>No classifications found for this anomaly.</div>
      )}
    </div>
  );
};