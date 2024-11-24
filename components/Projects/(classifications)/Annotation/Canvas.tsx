import React, { useState, useRef } from 'react';
// import { Stage, Layer, Image, Rect, Text, Line } from 'react-konva';
import useImage from 'use-image';
import { Annotation } from '@/types/Annotation';


interface CanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  currentTool: string;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  onAddAnnotation: (annotation: Annotation) => void;
}

export default function Canvas() {
    return (
        <></>
    )
}

// export default function Canvas({ 
//   imageUrl, 
//   annotations, 
//   currentTool, 
//   isDrawing,
//   setIsDrawing,
//   onAddAnnotation 
// }: CanvasProps) {
//   const [image] = useImage(imageUrl);
//   const [points, setPoints] = useState<number[]>([]);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const stageRef = useRef(null);

//   const handleMouseDown = (e: any) => {
//     if (!currentTool) return;

//     const pos = e.target.getStage().getPointerPosition();
//     setPosition({ x: pos.x, y: pos.y });
    
//     if (currentTool === 'pen') {
//       setIsDrawing(true);
//       setPoints([pos.x, pos.y]);
//     }
//   };

//   const handleMouseMove = (e: any) => {
//     if (!isDrawing || currentTool !== 'pen') return;

//     const pos = e.target.getStage().getPointerPosition();
//     setPoints([...points, pos.x, pos.y]);
//   };

//   const handleMouseUp = (e: any) => {
//     if (!currentTool) return;

//     const pos = e.target.getStage().getPointerPosition();
    
//     if (currentTool === 'pen') {
//       setIsDrawing(false);
//       onAddAnnotation({
//         type: 'pen',
//         points: points,
//         label: 'Drawing'
//       });
//       setPoints([]);
//     } else if (currentTool === 'rectangle') {
//       const width = pos.x - position.x;
//       const height = pos.y - position.y;
      
//       onAddAnnotation({
//         type: 'rectangle',
//         x: position.x,
//         y: position.y,
//         width,
//         height,
//         label: 'Rectangle'
//       });
//     }
//   };

//   return (
//     <Stage
//       ref={stageRef}
//       width={800}
//       height={600}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       className="border border-gray-300 rounded-lg"
//     >
//       <Layer>
//         {image && (
//           <Image
//             image={image}
//             width={800}
//             height={600}
//             alt="Uploaded image"
//           />
//         )}
        
//         {annotations.map((annotation, i) => {
//   if (annotation.type === 'rectangle') {
//     return (
//       <React.Fragment key={i}>
//         <Rect
//           x={annotation.x ?? 0} 
//           y={annotation.y ?? 0}
//           width={annotation.width ?? 0} 
//           height={annotation.height ?? 0} 
//           stroke="#00ff00"
//           strokeWidth={2}
//         />
//         <Text
//           x={annotation.x ?? 0}
//           y={(annotation.y ?? 0) - 20}
//           text={annotation.label || 'Label'}
//           fontSize={16}
//           fill="#00ff00"
//         />
//       </React.Fragment>
//     );
//   } else if (annotation.type === 'pen') {
//     return (
//       <React.Fragment key={i}>
//         <Line
//           points={annotation.points ?? []} // Default to empty array if undefined
//           stroke="#ff0000"
//           strokeWidth={2}
//           tension={0.5}
//           lineCap="round"
//         />
//         {annotation.points?.[0] !== undefined && annotation.points?.[1] !== undefined && (
//           <Text
//             x={annotation.points[0]}
//             y={annotation.points[1] - 20}
//             text={annotation.label || 'Label'}
//             fontSize={16}
//             fill="#ff0000"
//           />
//         )}
//       </React.Fragment>
//     );
//   }
//   return null;
// })}

        
//         {isDrawing && (
//           <Line
//             points={points}
//             stroke="#ff0000"
//             strokeWidth={2}
//             tension={0.5}
//             lineCap="round"
//           />
//         )}
//       </Layer>
//     </Stage>
//   );
// };