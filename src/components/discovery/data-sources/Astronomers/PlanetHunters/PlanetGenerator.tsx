
"use client";

import { useState, useEffect } from "react";
import PlanetViewer, { PlanetOnly } from "./planetViewer";
import { 
  type PlanetConfig, 
  defaultPlanetConfig,
  type MineralDeposit,
  type ChildClassification,
  getMineralState 
} from "@/src/components/discovery/planets/physics";
import SettingsPanel from "./SettingsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { mergeClassificationConfiguration } from "@/src/lib/gameplay/classification-configuration";

interface PlanetGeneratorProps {
  classificationId: string;
  editMode?: boolean;
  hideControls?: boolean;
  hideBackground?: boolean;
  hideSky?: boolean;
  hideZoom?: boolean;
  hideSettings?: boolean;
  style?: React.CSSProperties;
  cameraZoom?: number;
}

// Minimal variant: just the planet, no dialogs, no settings, no extra markup
export function PlanetGeneratorMinimal({
  classificationId,
  hideBackground,
  hideSky,
  hideZoom,
  style,
  cameraZoom,
}: {
  classificationId: string;
  hideBackground?: boolean;
  hideSky?: boolean;
  hideZoom?: boolean;
  style?: React.CSSProperties;
  cameraZoom?: number;
}) {
  const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig);
  const [planetStats, setPlanetStats] = useState<PlanetStats>({});

  useEffect(() => {
    const fetchExportedValues = async () => {
      const idAsNumber = Number.parseInt(classificationId);
      if (isNaN(idAsNumber)) return;

      const res = await fetch(`/api/gameplay/classifications?id=${idAsNumber}&limit=1`);
      const payload = await res.json().catch(() => ({}));
      const data = res.ok ? payload?.classifications?.[0] : null;
      const error = !res.ok ? payload?.error : null;

      if (error || !data?.classificationConfiguration?.exportedValue) return;

      const { exportedValue } = data.classificationConfiguration;
      setPlanetStats((prev) => ({
        ...prev,
        ...(exportedValue.mass && { mass: exportedValue.mass }),
        ...(exportedValue.radius && { radius: exportedValue.radius }),
      }));
    };
    fetchExportedValues();
  }, [classificationId]);

  // Merge handler for partial config
  const handleConfigChange = (config: Partial<PlanetConfig>) => {
    setPlanetConfig((prev) => ({ ...prev, ...config }));
  };
  return (
    <div className="w-full h-full min-h-[480px]">
      <PlanetOnly
        planetConfig={planetConfig}
      />
    </div>
  );
}

interface PlanetGeneratorProps {
  classificationId: string;
  editMode?: boolean;
  hideControls?: boolean;
  hideBackground?: boolean;
  hideSky?: boolean;
  hideZoom?: boolean;
  hideSettings?: boolean;
  style?: React.CSSProperties;
  cameraZoom?: number;
}

interface PlanetStats {
  mass?: number;
  radius?: number;
  [key: string]: any;
};

function secureRandomUnit(): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] / 4294967296;
}

function secureRandomBetween(min: number, max: number): number {
  return secureRandomUnit() * (max - min) + min;
}
export default function PlanetGenerator({
  classificationId,
  editMode,
  hideControls,
  hideBackground,
  hideSky,
  hideZoom,
  hideSettings,
  style,
  cameraZoom,
}: PlanetGeneratorProps) {
  const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [childClassificationDialogOpen, setChildClassificationDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<MineralDeposit | null>(null);
  const [selectedChildClassification, setSelectedChildClassification] = useState<ChildClassification | null>(null);
  const [deposits, setDeposits] = useState<MineralDeposit[]>([]);
  const [childClassifications, setChildClassifications] = useState<ChildClassification[]>([]);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [planetStats, setPlanetStats] = useState<PlanetStats>({});

  const handleConfigChange = (newConfig: Partial<PlanetConfig>) => {
    setPlanetConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleImport = () => {
    try {
      const config = JSON.parse(importText);
      setPlanetConfig(config);
      setImportDialogOpen(false);
      setImportError("");
    } catch {
      setImportError("Invalid JSON configuration");
    }
  };

  const handleExport = async () => {
    const idAsNumber = Number.parseInt(classificationId);
    if (isNaN(idAsNumber)) return;
    await mergeClassificationConfiguration(idAsNumber, {
      planetConfiguration: planetConfig,
    });
  };

  useEffect(() => {
    const fetchExportedValues = async () => {
      const idAsNumber = Number.parseInt(classificationId);
      if (isNaN(idAsNumber)) return;

      const classRes = await fetch(`/api/gameplay/classifications?id=${idAsNumber}&limit=1`);
      const classPayload = await classRes.json().catch(() => ({}));
      const data = classRes.ok ? classPayload?.classifications?.[0] : null;
      const error = !classRes.ok ? classPayload?.error : null;

      if (error || !data?.classificationConfiguration?.exportedValue) return;

      const { exportedValue } = data.classificationConfiguration;
      const temperature = exportedValue.temperature || 288;
      
      setPlanetStats((prev) => ({
        ...prev,
        ...(exportedValue.mass && { mass: exportedValue.mass }),
        ...(exportedValue.radius && { radius: exportedValue.radius }),
      }));

      // Fetch mineral deposits by classification ID (discovery field)
      const depositsRes = await fetch(`/api/gameplay/mineral-deposits?discovery=${idAsNumber}`);
      const depositsPayload = await depositsRes.json().catch(() => ({}));
      const depositsData = depositsRes.ok ? depositsPayload?.deposits : [];
      const depositsError = !depositsRes.ok ? depositsPayload?.error : null;


      if (!depositsError && depositsData) {
          const parsedDeposits: MineralDeposit[] = depositsData.map((deposit: any) => {
            // Parse mineralconfiguration JSON string
            let config;
            try {
              config = typeof deposit.mineral_configuration === 'string'
                ? JSON.parse(deposit.mineral_configuration)
                : deposit.mineral_configuration;
            } catch (e) {
              console.error("Error parsing mineral_configuration:", e);
              config = {};
            }

            const type = config?.type || config?.mineralType || "water-ice";
            const state = getMineralState(type, temperature);

            // Parse location JSON string or plain text
            let position: { latitude: number; longitude: number };
            if (deposit.location) {
              try {
                if (typeof deposit.location === 'string') {
                  if (deposit.location.trim().startsWith('{') || deposit.location.trim().startsWith('[')) {
                    position = JSON.parse(deposit.location);
                  } else {
                    // Plain string, generate random
                    position = {
                      latitude: secureRandomBetween(-90, 90),
                      longitude: secureRandomBetween(-180, 180),
                    };
                  }
                } else {
                  position = deposit.location;
                }
              } catch (e) {
                position = {
                  latitude: secureRandomBetween(-90, 90),
                  longitude: secureRandomBetween(-180, 180),
                };
              }
            } else {
              position = {
                latitude: secureRandomBetween(-90, 90),
                longitude: secureRandomBetween(-180, 180),
              };
            }

            return {
              id: deposit.id,
              type,
              state,
              position,
              size: secureRandomBetween(0.02, 0.05),
              purity: config?.purity || 50,
              amount: config?.amount,
              classificationId: deposit.discovery
            };
          });

          setDeposits(parsedDeposits);
        }

      // Fetch child classifications
      const childRes = await fetch(
        `/api/gameplay/classifications?classificationParent=${idAsNumber}&orderBy=created_at&ascending=false&limit=500`
      );
      const childPayload = await childRes.json().catch(() => ({}));
      const childClassData = childRes.ok ? childPayload?.classifications : [];
      const childError = !childRes.ok ? childPayload?.error : null;

      

      if (!childError && childClassData) {
        const parsedChildren: ChildClassification[] = childClassData.map((c: any) => {
          let position: { latitude: number; longitude: number };
          const configLocation = c.classificationConfiguration?.location;
          if (configLocation) {
            try {
              position = typeof configLocation === 'string' ? JSON.parse(configLocation) : configLocation;
            } catch {
              position = {
                latitude: secureRandomBetween(-90, 90),
                longitude: secureRandomBetween(-180, 180),
              };
            }
          } else {
            position = {
              latitude: secureRandomBetween(-90, 90),
              longitude: secureRandomBetween(-180, 180),
            };
          }

          return {
            id: c.id,
            type: c.classificationtype || "unknown",
            position,
            content: c.content
          };
        });

        setChildClassifications(parsedChildren);
      }
    };

    fetchExportedValues();
  }, [classificationId]);

  const exportConfig = JSON.stringify(planetConfig, null, 2);

  return (
    <main className="w-full" style={style}>
      {/* Debug info */}
      <div className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-3 rounded-lg shadow-lg text-sm font-bold border-2 border-white">
        🔍 Deposits: {deposits.length} | Children: {childClassifications.length}
      </div>
      
      <div className="flex flex-col md:flex-row w-full">
        {/* Planet Viewer */}
        <div className="w-full md:flex-1 md:min-h-screen">
          <PlanetViewer
            planetConfig={planetConfig}
            deposits={deposits}
            childClassifications={childClassifications}
            onConfigChange={handleConfigChange}
            onDepositClick={(deposit) => {
              setSelectedDeposit(deposit);
              setDepositDialogOpen(true);
            }}
            onChildClassificationClick={(child) => {
              setSelectedChildClassification(child);
              setChildClassificationDialogOpen(true);
            }}
            hideBackground={hideBackground}
            hideSky={hideSky}
            hideZoom={hideZoom}
            cameraZoom={cameraZoom}
          />
        </div>

        {/* Settings Panel */}
        {!hideControls && !hideSettings && (
          <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 relative z-10">
            <SettingsPanel
              planetConfig={planetConfig}
              onChange={handleConfigChange}
              classificationId={parseInt(classificationId)}
            />
          </div>
        )}
      </div>

      {/* Import Dialog */}
      {!hideControls && (
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Planet Configuration</DialogTitle>
              <DialogDescription>Paste JSON below</DialogDescription>
            </DialogHeader>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="min-h-[200px]"
            />
            {importError && <p className="text-red-500 text-sm">{importError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Dialog */}
      {!hideControls && (
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Planet Configuration</DialogTitle>
              <DialogDescription>Copy this JSON</DialogDescription>
            </DialogHeader>
            <Textarea
              value={exportConfig}
              readOnly
              className="min-h-[200px] font-mono text-sm"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={async () => {
                  await handleExport();
                  navigator.clipboard.writeText(exportConfig);
                  setExportDialogOpen(false);
                }}
              >
                Copy & Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="bg-white sm:max-w-lg">
          {selectedDeposit && (
            <div>
              <DialogHeader>
                <DialogTitle>Mineral Deposit</DialogTitle>
                <DialogDescription>
                  {selectedDeposit.type.charAt(0).toUpperCase() + selectedDeposit.type.slice(1)} deposit in {selectedDeposit.state} state
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2 mt-4">
                <p><strong>Purity:</strong> {selectedDeposit.purity}%</p>
                {selectedDeposit.amount && <p><strong>Amount:</strong> {selectedDeposit.amount}</p>}
                <p><strong>Location:</strong> {selectedDeposit.position.latitude.toFixed(2)}°, {selectedDeposit.position.longitude.toFixed(2)}°</p>
                
                {selectedDeposit.classificationId && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => {
                        window.open(`/posts/${selectedDeposit.classificationId}`, '_blank');
                      }}
                    >
                      View Discovery Classification →
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Child Classification Dialog */}
      <Dialog open={childClassificationDialogOpen} onOpenChange={setChildClassificationDialogOpen}>
        <DialogContent className="bg-white sm:max-w-lg">
          {selectedChildClassification && (
            <div>
              <DialogHeader>
                <DialogTitle>Classification on Planet</DialogTitle>
                <DialogDescription>
                  {selectedChildClassification.type} at location on planet surface
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2 mt-4">
                <p><strong>Type:</strong> {selectedChildClassification.type}</p>
                <p><strong>ID:</strong> {selectedChildClassification.id}</p>
                <p><strong>Location:</strong> {selectedChildClassification.position.latitude.toFixed(2)}°, {selectedChildClassification.position.longitude.toFixed(2)}°</p>
                {selectedChildClassification.content && (
                  <p><strong>Content:</strong> {selectedChildClassification.content}</p>
                )}
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600"
                    onClick={() => {
                      window.open(`/posts/${selectedChildClassification.id}`, '_blank');
                    }}
                  >
                    View Full Classification →
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setChildClassificationDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};
