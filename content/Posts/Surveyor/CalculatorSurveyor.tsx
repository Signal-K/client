'use client';

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Calculator, ChevronDown, MessageCircleDashed, Send, Share2, ThumbsUp } from "lucide-react";
import { Avatar, AvatarGenerator } from "@/components/Account/Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import html2canvas from "html2canvas"

interface Props {
    classificationId: string;
};

export default function SurveyorCalculator({
    classificationId
}: Props) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>();

    // Calculators
    const calculatePlanetRadius = (
        stellarRadius: string,
        fluxDifferential: string
    ) => {
        const R_star = Number.parseFloat(stellarRadius);
        const F_planet = Number.parseFloat(fluxDifferential);

        if (isNaN(R_star) || isNaN(F_planet) || F_planet <= 0) {
            return {
                radius: "",
                planetType: ""
            };
        };

        const radius = R_star * Math.sqrt(F_planet);
        const planetType = radius > 2.4 ? "Gaseous" : "Terrestrial";

        return {
            radius: radius.toFixed(2),
            planetType
        };
    };

    const calculatePlanetDensity = (
        stellarRadius: string,
        fluxDifferential: string
    ) => {
        const R_star = parseFloat(stellarRadius);
        const deltaF = parseFloat(fluxDifferential);

        if (isNaN(R_star) || isNaN(deltaF) || deltaF <= 0) {
            return { density: "", unit: "kg/m³" };
          }
        
          const K = 0.414; // empirical constant for gas giants
          const alpha = 2.06;
          const pi = Math.PI;
        
          const M_earth = 5.972e24; // kg
          const R_earth = 6.371e6; // m
          const R_sun = 6.957e8; // m
        
          const Rp_solar = R_star * Math.sqrt(deltaF);
          const Rp_meters = Rp_solar * R_sun;
          const mass_earth = K * Math.pow((Rp_meters / R_earth), alpha);
          const mass_kg = mass_earth * M_earth;
          const volume = (4 / 3) * pi * Math.pow(Rp_meters, 3);
          const density = mass_kg / volume;
        
          return { density: density.toFixed(2), unit: "kg/m³" };
    };    

    const calculatePlanetTemperature = (
        starTemp: string,
        period: string,
    ) => {
        const T_star = parseFloat(starTemp);
        const P = parseFloat(period);

        if (isNaN(T_star) || isNaN(P) || P <= 0) {
            return { temperature: "", unit: "K" };
        };

        if (isNaN(T_star) || isNaN(P) || P <= 0) {
            return "Invalid input";
        };
        
        return (T_star * Math.pow(P, -0.5)).toFixed(2);
    };

    const calculatePeriod = (periodValue: string) => {
        return { period: periodValue };
    };    

    // Post content
    const [calculatorInputs, setCalculatorInputs] = useState({
        input1: '',
        input2: ''
    });
    const [calculatorResult, setCalculatorResult] = useState<string>("");
    const [selectedCalculator, setSelectedCalculator] = useState<string>('');

    const [newComment, setNewComment] = useState<string>("");

    const [temperatureInputs, setTemperatureInputs] = useState<Record<string, string>>({});  
    const [densityInputs, setDensityInputs] = useState<Record<string, string>>({});
    const [radiusInputs, setRadiusInputs] = useState<Record<string, string>>({});
    const [periodInputs, setPeriodInputs] = useState<Record<string, string>>({});

    const handleDensityInputChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        const value = e.target.value;
        setDensityInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: value,
        }));
    };

    const handleRadiusInputChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        const value = e.target.value;
        setRadiusInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: value,
        }));

        const {
            radius,
            planetType
        } = calculatePlanetRadius(value, '1');
        setRadiusInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: radius,
            [`${classificationId}-2`]: planetType,
        }));
    };

    const handlePeriodInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
    
        setPeriodInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: value,
        }));
    
        const { period } = calculatePeriod(value);
        setCalculatorResult(period);
    };    

    const handleTemperatureInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        inputType: "starTemp" | "period"
    ) => {
        const value = e.target.value;
      
        setTemperatureInputs((prev) => ({
          ...prev,
          [`${classificationId}-${inputType}`]: value,
        }));
      
        const starTemp = inputType === "starTemp"
          ? value
          : temperatureInputs[`${classificationId}-starTemp`] || "";
      
        const period = inputType === "period"
          ? value
          : temperatureInputs[`${classificationId}-period`] || "";
      
        const result = calculatePlanetTemperature(starTemp, period);
      
        if (typeof result === "object" && result.temperature === "") {
          setCalculatorResult(""); // Invalid input case
        } else {
          setCalculatorResult(result as string);
        };
    };    
    
    
    // Publishing comments
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            return;
        };

        try {
            const {
                error
            } = await supabase
                .from("comments")
                .insert([
                    {
                        content: newComment,
                        classification_id: classificationId,
                        author: session?.user?.id,
                    },
                ]);

            if (error) {
                throw error;
            };

            setNewComment("");

        } catch (error: any) {
            console.error("Error adding comment:", error.message);
        };
    };

    return (
        <div className="space-y-4">
            <div className="bg-[#2C3A4A] p-3 rounded-md border border-[#5FCBC3]/20">
                <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-[#B9E678]" />
                    <h4 className="text-sm font-medium text-black">Planet Calculator</h4>
                </div>
            </div>
        </div>
    )
}