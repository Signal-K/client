'use client';

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

interface Props {
  classificationId: string;
};

export default function SurveyorCalculator({ classificationId }: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [calculatorInputs, setCalculatorInputs] = useState({
    input1: "",
    input2: "",
    input3: "",
  });
  const [calculatorResult, setCalculatorResult] = useState<string>("");
  const [selectedCalculator, setSelectedCalculator] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [calculatedValueComment, setCalculatedValueComment] = useState<string>("");

  const handleAddComment = async () => {
    if (!newComment.trim() && !calculatedValueComment.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          content: `Calculated Value: ${calculatedValueComment}\nGeneral Comment: ${newComment}`,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { generalComment: newComment }, // Include the general comment here
        },
      ]);

      if (error) throw error;
      setNewComment("");
      setCalculatedValueComment("");
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
    }
  };

  const calculatePlanetRadius = (stellarRadius: string, fluxDifferential: string) => {
    const R_star = Number.parseFloat(stellarRadius);
    const F_planet = Number.parseFloat(fluxDifferential);

    if (isNaN(R_star) || isNaN(F_planet) || F_planet <= 0) {
      return { radius: "", planetType: "" };
    }

    const radius = R_star * Math.sqrt(F_planet);
    const planetType = radius > 2.4 ? "Gaseous" : "Terrestrial";

    return { radius: radius.toFixed(2), planetType };
  };

  const calculatePlanetDensity = (stellarRadius: string, fluxDifferential: string) => {
    const R_star = parseFloat(stellarRadius);
    const deltaF = parseFloat(fluxDifferential);

    if (isNaN(R_star) || isNaN(deltaF) || deltaF <= 0) {
      return { density: "", unit: "kg/m³" };
    }

    const K = 0.414;
    const alpha = 2.06;
    const pi = Math.PI;

    const M_earth = 5.972e24;
    const R_earth = 6.371e6;
    const R_sun = 6.957e8;

    const Rp_solar = R_star * Math.sqrt(deltaF);
    const Rp_meters = Rp_solar * R_sun;
    const mass_earth = K * Math.pow(Rp_meters / R_earth, alpha);
    const mass_kg = mass_earth * M_earth;
    const volume = (4 / 3) * pi * Math.pow(Rp_meters, 3);
    const density = mass_kg / volume;

    return { density: density.toFixed(2), unit: "kg/m³" };
  };

  const calculatePlanetTemperature = (starTemp: string, period: string): string => {
    const T_star = parseFloat(starTemp);
    const P = parseFloat(period);

    if (isNaN(T_star) || isNaN(P) || P <= 0) {
      return "";
    }

    return (T_star * Math.pow(P, -0.5)).toFixed(2);
  };

  const handleCalculate = () => {
    let result = "";
    if (selectedCalculator === "radius") {
      const { radius, planetType } = calculatePlanetRadius(
        calculatorInputs.input1,
        calculatorInputs.input2
      );
      result = `${radius} (Type: ${planetType})`;
      setCalculatedValueComment(result);
    } else if (selectedCalculator === "density") {
      const { density } = calculatePlanetDensity(
        calculatorInputs.input1,
        calculatorInputs.input2
      );
      result = density;
      setCalculatedValueComment(result);
    } else if (selectedCalculator === "temperature") {
      result = calculatePlanetTemperature(calculatorInputs.input1, calculatorInputs.input2);
      setCalculatedValueComment(result);
    }
    setCalculatorResult(result);
  };

  const handleAddDensityComment = async () => {
    const densityInput1 = calculatorInputs.input1;
    const densityInput2 = calculatorInputs.input2;

    if (!densityInput1?.trim() || !densityInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${densityInput1}\n\n${densityInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { density: `${densityInput2}`, generalComment: newComment }, // Include general comment in config
            surveyor: "TRUE",
            value: densityInput2,
            category: "Density",
          },
        ]);

      if (error) throw error;

      setCalculatorInputs({ input1: "", input2: "", input3: "" });

    } catch (error) {
      console.error("Error adding density comment:", error);
    }
  };

  const handleAddTemperatureComment = async () => {
    const temperatureInput1 = calculatorInputs.input1;
    const temperatureInput2 = calculatorInputs.input2;

    if (!temperatureInput1?.trim() || !temperatureInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${temperatureInput1}\n\n${temperatureInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { temperature: `${temperatureInput2}`, generalComment: newComment }, // Include general comment in config
            surveyor: "TRUE",
            value: temperatureInput2,
            category: 'Temperature'
          },
        ]);

      if (error) throw error;

      setCalculatorInputs({ input1: "", input2: "", input3: "" });

    } catch (error) {
      console.error("Error adding temperature comment:", error);
    }
  };

  const handleAddPeriodComment = async () => {
    const periodInput1 = calculatorInputs.input1;
    const periodInput2 = calculatorInputs.input2;

    if (!periodInput1?.trim() || !periodInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${periodInput1}\n\n${periodInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { period: `${periodInput2}`, generalComment: newComment }, // Include general comment in config
            surveyor: "TRUE",
            value: periodInput2,
            category: 'Period'
          },
        ]);

      if (error) throw error;

      setCalculatorInputs({ input1: "", input2: "", input3: "" });

    } catch (error) {
      console.error("Error adding period comment: ", error);
    };
  };

  const handleAddRadiusComment = async () => {
    const radiusInput1 = calculatorInputs.input1;
    const radiusInput2 = calculatorInputs.input2;

    if (!radiusInput1?.trim() || !radiusInput2?.trim()) {
      console.error("Both text areas must be filled!");
      return;
    };

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${newComment}`,
            classification_id: classificationId,
            author: session?.user.id,
            configuration: {
              radius: `${radiusInput2}`
            },
            surveyor: "TRUE",
            value: radiusInput2,
            category: "Radius"
          },
        ]);

      if (error) {
        throw error;
      };

    setCalculatorInputs({
      input1: "",
      input2: "",
      input3: "",
    });
  } catch (error: any) {
    console.error("Error adding your comment: ", error)
  }
}

  return (
    <div className="space-y-4">
      <div className="bg-[#E5E9F0] p-3 rounded-md border border-[#D8DEE9]">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-medium text-[#2E3440]">Planet Calculator</h4>
        </div>
        <div className="space-y-3 relative z-50">
          <Select
            value={selectedCalculator}
            onValueChange={(val) =>
              setSelectedCalculator(val as "radius" | "density" | "temperature" | "period")
            }
          >
            <SelectTrigger className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440]">
              <SelectValue placeholder="Select calculator" />
            </SelectTrigger>
            <div className="space-y-3 relative z-50">
              <SelectContent position="popper" className="bg-white border-[#D8DEE9] text-[#2E3440] z-50">
                <SelectItem value="radius">Planet Radius</SelectItem>
                <SelectItem value="density">Planet Density</SelectItem>
                <SelectItem value="temperature">Planet Temperature</SelectItem>
                <SelectItem value="period">Orbital Period</SelectItem>
              </SelectContent>
            </div>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            {selectedCalculator === "radius" || selectedCalculator === "density" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Stellar Radius (R☉)</label>
                  <Input
                    value={calculatorInputs.input1}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input1: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Flux Differential</label>
                  <Input
                    value={calculatorInputs.input2}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input2: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number"
                    step="0.01"
                  />
                </div>
              </>
            ) : selectedCalculator === "temperature" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Star Temperature (K)</label>
                  <Input
                    value={calculatorInputs.input1}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input1: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Orbital Period (days)</label>
                  <Input
                    value={calculatorInputs.input2}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input2: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number" 
                    step="0.01"
                  />
                </div>
              </>
            ) : selectedCalculator === "period" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Star Temperature (K)</label>
                  <Input
                    value={calculatorInputs.input1}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input1: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#4C566A]">Orbital Period (days)</label>
                  <Input
                    value={calculatorInputs.input2}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, input2: e.target.value })
                    }
                    className="bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440] h-8"
                    type="number"
                    step="0.01"
                  />
                </div>
              </>
            ) : null}
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-[#5E81AC] text-white hover:bg-[#5E81AC]/90"
          >
            Calculate
          </Button>

          <div className="bg-[#E5E9F0] p-2 rounded border-[#D8DEE9] flex justify-between items-center">
            <span className="text-xs text-[#4C566A]">Result:</span>
            <span className="text-sm font-medium text-[#B48EAD] font-mono">
              {calculatorResult || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="General comment or observations"
          className="bg-[#E5E9F0] border-[#D8DEE9] text-[#2E3440] min-h-[80px]"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Textarea
          placeholder="Calculated Value (Auto-filled after calculation)"
          className="bg-[#E5E9F0] border-[#D8DEE9] text-[#2E3440] min-h-[80px] opacity-50"
          value={calculatedValueComment || ""}
          readOnly
        />
        <div className="flex justify-end">
          <Button
            onClick={
              selectedCalculator === "period"
                ? handleAddPeriodComment
                : selectedCalculator === "density"
                ? handleAddDensityComment
                : selectedCalculator === "radius"
                ? handleAddRadiusComment
                : handleAddTemperatureComment
            }
            className="bg-[#B48EAD] text-[#ECEFF4] hover:bg-[#B48EAD]/90"
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
};