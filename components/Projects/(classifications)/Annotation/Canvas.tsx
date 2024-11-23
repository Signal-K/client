import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/context/AnnotationStore';
import * as d3 from 'd3';
import { Annotation } from '@/types/Annotation';

export const Canvas = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const {
    image,
    annotations,
    selectedTool,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    presets,
  } = useStore();
  const [drawing, setDrawing] = useState(false);
  const [tempAnnotation, setTempAnnotation] = useState<Partial<Annotation> | null>(
    null
  );

  useEffect(() => {
    if (!svgRef.current || !image) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a group for the image
    const imageGroup = svg.append('g').attr('class', 'image-layer');
    
    // Add image
    imageGroup
      .append('image')
      .attr('href', image)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create a group for annotations
    const annotationGroup = svg.append('g').attr('class', 'annotation-layer');

    // Render existing annotations
    annotations.forEach((ann) => {
      const group = annotationGroup.append('g');

      switch (ann.type) {
        case 'rectangle':
          group
            .append('rect')
            .attr('x', ann.x)
            .attr('y', ann.y)
            .attr('width', ann.width)
            .attr('height', ann.height)
            .attr('fill', 'none')
            .attr('stroke', ann.color)
            .attr('stroke-width', 2)
            .attr('data-id', ann.id);
          break;
        case 'circle':
          group
            .append('circle')
            .attr('cx', ann.x)
            .attr('cy', ann.y)
            .attr('r', ann.radius)
            .attr('fill', 'none')
            .attr('stroke', ann.color)
            .attr('stroke-width', 2)
            .attr('data-id', ann.id);
          break;
        case 'text':
          group
            .append('text')
            .attr('x', ann.x)
            .attr('y', ann.y)
            .text(ann.text)
            .attr('fill', ann.color)
            .attr('data-id', ann.id);
          break;
        case 'freehand':
          group
            .append('path')
            .attr('d', ann.path)
            .attr('fill', 'none')
            .attr('stroke', ann.color)
            .attr('stroke-width', 2)
            .attr('data-id', ann.id);
          break;
      }

      // Add labels
      group
        .append('text')
        .attr('x', ann.x)
        .attr('y', ann.y - 10)
        .text(ann.label)
        .attr('fill', ann.color)
        .attr('font-size', '12px');
    });

    // Render temporary annotation while drawing
    if (tempAnnotation && drawing) {
      const tempGroup = annotationGroup.append('g').attr('class', 'temp');
      
      switch (tempAnnotation.type) {
        case 'rectangle':
          tempGroup
            .append('rect')
            .attr('x', tempAnnotation.x)
            .attr('y', tempAnnotation.y)
            .attr('width', tempAnnotation.width)
            .attr('height', tempAnnotation.height)
            .attr('fill', 'none')
            .attr('stroke', tempAnnotation.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4');
          break;
        case 'circle':
          tempGroup
            .append('circle')
            .attr('cx', tempAnnotation.x)
            .attr('cy', tempAnnotation.y)
            .attr('r', tempAnnotation.radius)
            .attr('fill', 'none')
            .attr('stroke', tempAnnotation.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4');
          break;
        case 'freehand':
          tempGroup
            .append('path')
            .attr('d', tempAnnotation.path)
            .attr('fill', 'none')
            .attr('stroke', tempAnnotation.color)
            .attr('stroke-width', 2);
          break;
      }
    }
  }, [image, annotations, tempAnnotation, drawing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedTool || !image) return;

    const svg = svgRef.current;
    if (!svg) return;

    const point = d3.pointer(e.nativeEvent, svg);
    const newAnnotation: Partial<Annotation> = {
      id: Date.now().toString(),
      type: selectedTool,
      x: point[0],
      y: point[1],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Fixed color assignment
    };

    setTempAnnotation(newAnnotation);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !tempAnnotation || !svgRef.current) return;

    const point = d3.pointer(e.nativeEvent, svgRef.current);
    const updated = { ...tempAnnotation };

    switch (tempAnnotation.type) {
      case 'rectangle':
        updated.width = point[0] - tempAnnotation.x!;
        updated.height = point[1] - tempAnnotation.y!;
        break;
      case 'circle':
        const dx = point[0] - tempAnnotation.x!;
        const dy = point[1] - tempAnnotation.y!;
        updated.radius = Math.sqrt(dx * dx + dy * dy);
        break;
      case 'freehand':
        const path = tempAnnotation.path || `M ${tempAnnotation.x} ${tempAnnotation.y}`;
        updated.path = `${path} L ${point[0]} ${point[1]}`;
        break;
    }

    setTempAnnotation(updated);
  };

  const handleMouseUp = () => {
    if (!drawing || !tempAnnotation) return;

    const label = prompt('Enter label for this annotation:');
    if (label) {
      if (tempAnnotation.type === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          addAnnotation({ ...tempAnnotation, text, label } as Annotation);
        }
      } else {
        addAnnotation({ ...tempAnnotation, label } as Annotation);
      }
    }

    setDrawing(false);
    setTempAnnotation(null);
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full border border-gray-300 rounded-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};