"use client";

import React, { useState, useEffect } from "react";
import { Battery, Droplet, Zap, AlertTriangle, BarChart2, Rocket, Satellite, Box, PieChart, X, Cpu, Navigation, Heart, Radio, Radar } from 'lucide-react';
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlanetSwitcher } from "../../(scenes)/planetScene/SwitchPlanet";

const TravelLaunch = () => <div><PlanetSwitcher /></div>;
const DeployProbesLaunch = () => <div>Not available yet</div>;
const TransportLaunch = () => <div>Not available yet</div>;

export default function LaunchpadStructure() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [modalContent, setModalContent] = useState<string | null>(null);
    const [researchOptions, setResearchOptions] = useState<any[]>([]);
    const [researchedItems, setResearchedItems] = useState<number[]>([]); 
    const [loadingResearch, setLoadingResearch] = useState<boolean>(false);

    const systemStatus = [
        { name: 'Engines', icon: Cpu, color: '#5FCBC3' },
        { name: 'Navigation', icon: Navigation, color: '#FFD580' },
        { name: 'Life Support', icon: Heart, color: '#D689E3' },
        { name: 'Comms', icon: Radio, color: '#FF695D' },
    ];

    const launchOptions = [
        { name: 'Travel', icon: Rocket, color: '#FFD580', item: 94, component: <TravelLaunch /> },
        { name: 'Deploy Probes', icon: Satellite, color: '#D689E3', item: 95, component: <DeployProbesLaunch /> },
        { name: 'Transport', icon: Box, color: '#5FCBC3', item: 96, component: <TransportLaunch /> }
    ];

    const openModal = (content: string) => {
        if (content === 'Research Launch Options') {
            fetchLaunchOptions();
        }
        setModalContent(content);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    useEffect(() => {
        fetchLaunchOptions();
        console.log(session?.user.id);
    }, []);

    const fetchLaunchOptions = async () => {
        try {
            const res = await fetch('/api/gameplay/research/travel');
            const data = await res.json();
            console.log('Data from API:', data);
            setResearchOptions(data);
    
            const { data: researched, error } = await supabase
                .from('researched')
                .select('tech_id')
                .eq('tech_type', 3107)
                .eq('user_id', session?.user?.id);        
    
            if (error) throw error;
    
            const researchedIds = researched?.map(item => item.tech_id) || [];
            setResearchedItems(researchedIds);
        } catch (error) {
            console.error('Error fetching research options:', error);
        };
    };    

    const [rocketParts, setRocketParts] = useState<any[]>([]);


    useEffect(() => {
        fetchRocketParts();
    }, [session, activePlanet]);

    const fetchRocketParts = async () => {
        if (!session?.user?.id || !activePlanet?.id) return;

        try {
            const { data: parts, error } = await supabase
                .from('inventory')
                .select('item, quantity')
                .eq('anomaly', activePlanet.id)
                .eq('owner', session.user.id)
                .in('item', [3108, 3109, 31010, 31011])
                .gte('quantity', 1);

            if (error) throw error;

            const mappedParts = parts.map(part => {
                switch (part.item) {
                    case 3108:
                        return { name: 'Shuttle (manned rocket)', icon: Rocket, quantity: part.quantity, color: "#FFD580" };
                    case 3109:
                        return { name: 'Deep-space Probe', icon: Radar, quantity: part.quantity, color: "#4DB6AC" };
                    case 31010:
                        return { name: 'Robotic Arm', icon: Cpu, quantity: part.quantity, color: "#5FCBC3" };
                    case 31011:
                        return { name: 'Warp Ship', icon: Satellite, quantity: part.quantity, color: "#FF695D" };
                    default:
                        return null;
                }
            }).filter(Boolean); 

            setRocketParts(mappedParts);
        } catch (error) {
            console.error("Error fetching rocket parts:", error);
        }
    };

    const rocketItems = [
        { name: 'Probe', icon: Radar, id: 3109, color: "#4DB6AC" },
        { name: 'Shuttle', icon: Rocket, id: 3108, color: "#FFD580" }
    ];

    const researchLaunchOption = async (optionId: number) => {
        setLoadingResearch(true);
        try {
            const { data, error } = await supabase
                .from('researched')
                .insert({
                    user_id: session?.user?.id,
                    tech_id: optionId,
                    tech_type: 3107,
                });

            if (error) throw error;

            setResearchedItems([...researchedItems, optionId]);
        } catch (error) {
            console.error('Error researching launch option:', error);
        } finally {
            setLoadingResearch(false);
        };
    };

    const buildRocket = async (rocketItemId: number) => {
        if (!session?.user?.id || !activePlanet) return;

        try {
            const { error } = await supabase
                .from('inventory')
                .insert({
                    anomaly: activePlanet.id,
                    owner: session.user.id,
                    item: rocketItemId,
                    quantity: 1
                });

            if (error) throw error;

            console.log(`${rocketItems.find(item => item.id === rocketItemId)?.name} built successfully.`);
        } catch (error) {
            console.error('Error building rocket:', error);
        };
    };

    return (
        <div className="min-h-screen bg-[#303F51] text-[#F7F5E9] p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-[#2C4F64] rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-center text-[#5FCBC3]">Launchpad Control Center</h1>
                    
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <Droplet className="text-[#5FCBC3]" />
                                Fuel Capacity
                            </h2>
                            <div className="h-2 bg-[#303F51] rounded-full overflow-hidden">
                                <div className="h-full bg-[#5FCBC3] w-3/4" style={{transition: 'width 1s ease-in-out'}}></div>
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="text-[#FF695D]" />
                                Power Supply
                            </h2>
                            <div className="h-2 bg-[#303F51] rounded-full overflow-hidden">
                                <div className="h-full bg-[#FF695D] w-5/6" style={{transition: 'width 1s ease-in-out'}}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Actions</h2>
                        <div className="flex justify-between gap-4">
                            {launchOptions.map((option, index) => (
                                <button
                                    key={index}
                                    className={`flex-1 bg-[#303F51] p-4 rounded-lg flex flex-col items-center space-y-2 ${researchedItems.includes(option.item) ? 'hover:bg-[#3a4b5f] transition-colors' : 'opacity-50 cursor-not-allowed'}`}
                                    onClick={() => researchedItems.includes(option.item) ? openModal(`Launch ${option.name}`) : openModal('Research Launch Options')}
                                >
                                    <option.icon size={48} style={{ color: option.color }} />
                                    <span className="text-sm">{option.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Build Rockets</h2> 
                        <div className="flex justify-between gap-4">
                            {rocketItems.map((rocket) => (
                                <button
                                    key={rocket.id}
                                    className="flex-1 bg-[#303F51] p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-[#3a4b5f] transition-colors"
                                    onClick={() => buildRocket(rocket.id)}
                                >
                                    <rocket.icon size={48} style={{ color: rocket.color }} />
                                    <span className="text-sm">{rocket.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Available parts</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {rocketParts.map((part, index) => (
                                <div key={index} className="bg-[#303F51] p-4 rounded-lg flex items-center space-x-3">
                                    <part.icon size={32} style={{ color: part.color }} />
                                    <div>
                                        <h3 className="text-sm font-medium">{part.name}</h3>
                                        <p className="text-xs text-gray-400">Quantity: {part.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <AlertTriangle className="text-[#FF695D]" />
                                System Status
                            </h2>
                            <div className="flex justify-around">
                                {systemStatus.map((system, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center" style={{ borderColor: system.color }}>
                                            <system.icon size={24} style={{ color: system.color }} />
                                        </div>
                                        <span className="text-xs mt-2">{system.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <BarChart2 className="text-[#5FCBC3]" />
                                Launch Statistics
                            </h2>
                            <div className="flex justify-center">
                                <PieChart size={120} className="text-[#5FCBC3]" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center"><span className="w-3 h-3 bg-[#5FCBC3] mr-2"></span>Successful: 24</div>
                                <div className="flex items-center"><span className="w-3 h-3 bg-[#FF695D] mr-2"></span>Failed: 2</div>
                                <div className="flex items-center"><span className="w-3 h-3 bg-[#FFD580] mr-2"></span>Upcoming: 5</div>
                                <div className="flex items-center"><span className="w-3 h-3 bg-[#D689E3] mr-2"></span>Payload: 1,280t</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-[#303F51] p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Battery className="text-[#5FCBC3]" />
                        <div className="w-20 h-2 bg-[#2C4F64] rounded-full overflow-hidden">
                            <div className="h-full bg-[#5FCBC3] w-full"></div>
                        </div>
                    </div>
                    <button 
                        className="bg-[#5FCBC3] text-[#303F51] px-4 py-2 rounded-md hover:bg-[#4db1a9] transition-colors"
                        onClick={() => openModal('Research Launch Options')}
                    >
                        Research Launch Options
                    </button>
                </div>
            </div>

            {modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#303F51] p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">{modalContent}</h2>
                        {modalContent.includes('Launch') ? (
                            launchOptions.find(option => modalContent.includes(option.name))?.component
                        ) : (
                            <div>
                                {researchOptions.map((option, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b">
                                        <span>{option.name}</span>
                                        <button 
                                            className="bg-[#5FCBC3] text-[#303F51] px-2 py-1 rounded hover:bg-[#4db1a9] transition-colors"
                                            onClick={() => researchLaunchOption(option.id)}
                                            disabled={researchedItems.includes(option.id) || loadingResearch}
                                        >
                                            {loadingResearch ? 'Researching...' : 'Research'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button 
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            onClick={closeModal}
                        >
                            <X size={16} /> Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};