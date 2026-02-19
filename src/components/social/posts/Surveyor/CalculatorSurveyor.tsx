'use client';

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

interface Props {
  classificationId: string;
};

export default function SurveyorCalculator({ classificationId }: Props) {
  const router = useRouter();

  const [calculatorInputs, setCalculatorInputs] = useState({
    input1: "",
    input2: "",
    input3: "",
  });
  const [calculatorResult, setCalculatorResult] = useState<string>("");
  const [selectedCalculator, setSelectedCalculator] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [calculatedValueComment, setCalculatedValueComment] = useState<string>("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() && !calculatedValueComment.trim()) return;

    try {
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `Calculated Value: ${calculatedValueComment}\nGeneral Comment: ${newComment}`,
          configuration: { generalComment: newComment },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to add comment");

      setNewComment("");
      setCalculatedValueComment("");
      setShowSuccessPopup(true);
      
      // Show popup and redirect after 3 seconds
      const redirectTimeout = setTimeout(() => {
        try {
          router.push('/');
        } catch (error) {
          console.error('CalculatorSurveyor: Router.push error:', error);
          // Fallback to window.location
          window.location.href = '/';
        }
      }, 3000);
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
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${densityInput1}\n\n${densityInput2}`,
          configuration: { density: `${densityInput2}`, generalComment: newComment },
          surveyor: "TRUE",
          value: densityInput2,
          category: "Density",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to add density comment");

      
      setCalculatorInputs({ input1: "", input2: "", input3: "" });
      setShowSuccessPopup(true);
      
      // Show popup and redirect after 3 seconds
      setTimeout(() => {
        try {
          router.push('/');
        } catch (error) {
          console.error('CalculatorSurveyor: Router error:', error);
          window.location.href = '/';
        }
      }, 3000);

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
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${temperatureInput1}\n\n${temperatureInput2}`,
          configuration: { temperature: `${temperatureInput2}`, generalComment: newComment },
          surveyor: "TRUE",
          value: temperatureInput2,
          category: "Temperature",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to add temperature comment");

      
      setCalculatorInputs({ input1: "", input2: "", input3: "" });
      setShowSuccessPopup(true);
      
      // Show popup and redirect after 3 seconds
      setTimeout(() => {
        try {
          router.push('/');
        } catch (error) {
          console.error('CalculatorSurveyor: Router error:', error);
          window.location.href = '/';
        }
      }, 3000);

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
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${periodInput1}\n\n${periodInput2}`,
          configuration: { period: `${periodInput2}`, generalComment: newComment },
          surveyor: "TRUE",
          value: periodInput2,
          category: "Period",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to add period comment");

      console.log('CalculatorSurveyor: Period comment submitted successfully, showing popup...');
      setCalculatorInputs({ input1: "", input2: "", input3: "" });
      setShowSuccessPopup(true);
      
      // Show popup and redirect after 3 seconds
      setTimeout(() => {
        console.log('CalculatorSurveyor: Redirecting to dashboard from period...');
        try {
          router.push('/');
        } catch (error) {
          console.error('CalculatorSurveyor: Router error:', error);
          window.location.href = '/';
        }
      }, 3000);

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
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${newComment}`,
          configuration: { radius: `${radiusInput2}` },
          surveyor: "TRUE",
          value: radiusInput2,
          category: "Radius",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to add radius comment");

      console.log('CalculatorSurveyor: Radius comment submitted successfully, showing popup...');
      setCalculatorInputs({
        input1: "",
        input2: "",
        input3: "",
      });
      setShowSuccessPopup(true);
      
      // Show popup and redirect after 3 seconds
      setTimeout(() => {
        console.log('CalculatorSurveyor: Redirecting to dashboard from radius...');
        try {
          router.push('/');
        } catch (error) {
          console.error('CalculatorSurveyor: Router error:', error);
          window.location.href = '/';
        }
      }, 3000);
      
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calculation Submitted!
              </h3>
              <p className="text-gray-600">
                Your calculation has been entered into the research database. Redirecting you to the dashboard...
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
