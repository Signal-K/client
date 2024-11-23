import { create } from 'zustand';
import { Annotation, Tool, PresetConfig } from '@/types/Annotation';

interface AnnotationStore {
  image: string | null;
  annotations: Annotation[];
  selectedTool: Tool;
  selectedAnnotation: string | null;
  presets: PresetConfig[];
  setImage: (image: string | null) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, annotation: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  setSelectedTool: (tool: Tool) => void;
  setSelectedAnnotation: (id: string | null) => void;
  addPreset: (preset: PresetConfig) => void;
  deletePreset: (id: string) => void;
}

export const useStore = create<AnnotationStore>((set) => ({
  image: null,
  annotations: [],
  selectedTool: null,
  selectedAnnotation: null,
  presets: [
    { id: '1', label: 'Cloud', color: '#4299E1', type: 'rectangle' },
    { id: '2', label: 'Bird', color: '#48BB78', type: 'circle' },
  ],
  setImage: (image) => set({ image }),
  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  updateAnnotation: (id, updatedAnnotation) =>
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updatedAnnotation } : ann
      ),
    })),
  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
    })),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedAnnotation: (id) => set({ selectedAnnotation: id }),
  addPreset: (preset) =>
    set((state) => ({ presets: [...state.presets, preset] })),
  deletePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((preset) => preset.id !== id),
    })),
}));