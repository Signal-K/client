'use client';

import { useState, useEffect } from "react";
import PlanetViewer from "./planetViewer";
import { type PlanetConfig, defaultPlanetConfig } from "@/src/components/discovery/planets/physics";
import SettingsPanel from "./SettingsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PlanetGeneratorProps {
  classificationId: string;
  editMode?: boolean;
}

interface PlanetStats {
  mass?: number;
  radius?: number;
  [key: string]: any;
}

export default function PlanetGenerator({ classificationId }: PlanetGeneratorProps) {
  const supabase = useSupabaseClient();
  const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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

    const { data, error: fetchError } = await supabase
      .from("classifications")
      .select("classificationConfiguration")
      .eq("id", idAsNumber)
      .single();

    if (fetchError || !data) return;

    const updatedConfig = {
      ...data.classificationConfiguration,
      planetConfiguration: planetConfig,
    }; 

    await supabase
      .from("classifications")
      .update({ classificationConfiguration: updatedConfig })
      .eq("id", idAsNumber);
  };

  useEffect(() => {
    const fetchExportedValues = async () => {
      const idAsNumber = Number.parseInt(classificationId);
      if (isNaN(idAsNumber)) return;

      const { data, error } = await supabase
        .from("classifications")
        .select("classificationConfiguration")
        .eq("id", idAsNumber)
        .single();

      if (error || !data?.classificationConfiguration?.exportedValue) return;

      const { exportedValue } = data.classificationConfiguration;
      setPlanetStats((prev) => ({
        ...prev,
        ...(exportedValue.mass && { mass: exportedValue.mass }),
        ...(exportedValue.radius && { radius: exportedValue.radius }),
      }));
    };

    fetchExportedValues();
  }, [classificationId, supabase]);

  const exportConfig = JSON.stringify(planetConfig, null, 2);

  return (
    <main className="w-full">
      <div className="flex flex-col md:flex-row w-full">
        {/* Planet Viewer */}
        <div className="w-full md:flex-1 md:min-h-screen">
          <PlanetViewer
            planetConfig={planetConfig}
            onConfigChange={handleConfigChange}
            // classificationId={classificationId}
            // editMode={editMode}
            // showSettings={false}
            // onToggleSettings={() => {}}
          />
        </div>

        {/* Settings Panel */}
        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 bg-white relative z-10">
          <SettingsPanel
            planetConfig={planetConfig}
            onChange={handleConfigChange}
            classificationId={parseInt(classificationId)}
          />
        </div>
      </div>

      {/* Import Dialog */}
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

      {/* Export Dialog */}
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
    </main>
  );
};