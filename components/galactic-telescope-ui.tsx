import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Circle, Pencil, Square } from "lucide-react"
import * as THREE from "three"

interface PlanetProps {
  period: number
}

interface Classification {
  repeatingDips: boolean
  alignedDips: boolean
  noDips: boolean
  similarSizeDips: boolean
}

function Planet({ period }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01
      }
    }, 16)
    return () => clearInterval(interval)
  }, [])

  let color
  if (period < 3) {
    color = "#ff79c6" // Dracula pink
  } else if (period >= 3 && period <= 7) {
    color = "#8be9fd" // Dracula cyan
  } else {
    color = "#bd93f9" // Dracula purple
  }

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export function GalacticTelescopeUi() {
  const [imageUrl, setImageUrl] = useState("/placeholder.svg?height=400&width=600")
  const [classification, setClassification] = useState({
    repeatingDips: false,
    alignedDips: false,
    noDips: false,
    similarSizeDips: false,
  })
  const [period, setPeriod] = useState("")
  const [t0, setT0] = useState("")
  const [currentTool, setCurrentTool] = useState(null)
  const [notes, setNotes] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleClassificationChange = (option: keyof Classification) => {
    if (option === "noDips") {
      setClassification({ ...classification, [option]: !classification[option] })
      setPeriod("")
      setT0("")
    } else {
      setClassification({ ...classification, [option]: !classification[option], noDips: false })
    }
  }

  // const handleAnnotation = (tool: string) => {
  //   setCurrentTool(tool)
  // }

  useEffect(() => {
    if (canvasRef.current && currentTool) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let isDrawing = false
      let lastX = 0
      let lastY = 0

      const startDrawing = (e: MouseEvent) => {
        isDrawing = true
        lastX = e.offsetX
        lastY = e.offsetY
      }

      const draw = (e: MouseEvent) => {
        if (!isDrawing) return
        ctx.beginPath()
        ctx.strokeStyle = "#f8f8f2" // Dracula foreground
        ctx.lineWidth = 2

        if (currentTool === "pen") {
          ctx.moveTo(lastX, lastY)
          ctx.lineTo(e.offsetX, e.offsetY)
        } else if (currentTool === "circle") {
          const radius = Math.sqrt((e.offsetX - lastX) ** 2 + (e.offsetY - lastY) ** 2)
          ctx.arc(lastX, lastY, radius, 0, 2 * Math.PI)
        } else if (currentTool === "square") {
          ctx.rect(lastX, lastY, e.offsetX - lastX, e.offsetY - lastY)
        }

        ctx.stroke()
        lastX = e.offsetX
        lastY = e.offsetY
      }

      const stopDrawing = () => {
        isDrawing = false
      }

      canvas.addEventListener("mousedown", startDrawing)
      canvas.addEventListener("mousemove", draw)
      canvas.addEventListener("mouseup", stopDrawing)
      canvas.addEventListener("mouseout", stopDrawing)

      return () => {
        canvas.removeEventListener("mousedown", startDrawing)
        canvas.removeEventListener("mousemove", draw)
        canvas.removeEventListener("mouseup", stopDrawing)
        canvas.removeEventListener("mouseout", stopDrawing)
      }
    }
  }, [currentTool])

  const isInputDisabled = classification.noDips || Object.values(classification).every((v) => !v)

  return (
    <div className="container mx-auto p-4 space-y-6 bg-[#1e2129] text-[#f8f8f2] min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-[#82aaff]">Galactic Telescope UI</h1>
      <div className="space-y-6">
        <div className="relative">
          <img src={imageUrl} alt="Telescope image" className="w-full h-auto rounded-lg" />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ pointerEvents: currentTool ? "auto" : "none" }}
          />
        </div>
        {/* <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleAnnotation("pen")}
            variant={currentTool === "pen" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Pen
          </Button>
          <Button
            onClick={() => handleAnnotation("circle")}
            variant={currentTool === "circle" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Circle className="w-4 h-4 mr-2" />
            Circle
          </Button>
          <Button
            onClick={() => handleAnnotation("square")}
            variant={currentTool === "square" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Square className="w-4 h-4 mr-2" />
            Square
          </Button>
        </div> */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(classification).map(([key, value]) => (
            <Button
              key={key}
              onClick={() => handleClassificationChange(key as keyof Classification)}
              variant={value ? "secondary" : "outline"}
              className={`w-full ${
                value ? "bg-[#ff79c6] text-[#282a36]" : "bg-[#44475a] text-[#f8f8f2]"
              } hover:bg-[#bd93f9]`}
            >
              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="period" className="block text-sm font-medium text-[#8be9fd]">
              Orbital Period (days)
            </label>
            <input
              id="period"
              type="number"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={isInputDisabled}
              className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="t0" className="block text-sm font-medium text-[#8be9fd]">
              T0 (time of first transit)
            </label>
            <input
              id="t0"
              type="number"
              value={t0}
              onChange={(e) => setT0(e.target.value)}
              disabled={isInputDisabled}
              className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-[#8be9fd]">
            Notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
          />
        </div>
        <div>
          <Canvas className="w-full h-64 bg-[#282a36] rounded-lg">
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 15, 10]} angle={0.3} />
            <Planet period={period ? parseFloat(period) : 5} />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  )
}
