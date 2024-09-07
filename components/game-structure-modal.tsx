'use client'

import { useState } from "react"
import { Plus, Minus, Hammer } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function GameStructureModal() {
  const [durability, setDurability] = useState(100)

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F5E9]">
      <Card className="w-80 bg-[#2C4F64] text-[#F7F5E9] shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <div className="w-16 h-16 bg-[#5FCBC3] rounded-full flex items-center justify-center">
            <Hammer className="w-10 h-10 text-[#2C4F64]" />
          </div>
          <CardTitle className="text-2xl font-bold">Structure Name</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Durability:</span>
              <span className="text-2xl font-bold">{durability}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-[#5FCBC3] text-[#2C4F64] hover:bg-[#85DDA2]"
                onClick={() => setDurability(Math.max(0, durability - 10))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={durability}
                onChange={(e) => setDurability(Math.max(0, Math.min(1000, parseInt(e.target.value) || 0)))}
                className="w-20 text-center bg-[#F7F5E9] text-[#2C4F64]"
              />
              <Button
                variant="outline"
                size="icon"
                className="bg-[#5FCBC3] text-[#2C4F64] hover:bg-[#85DDA2]"
                onClick={() => setDurability(Math.min(1000, durability + 10))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-2">
            <label htmlFor="mineral" className="block text-sm font-medium">
              Power with Mineral:
            </label>
            <Select>
              <SelectTrigger className="w-full bg-[#F7F5E9] text-[#2C4F64]">
                <SelectValue placeholder="Select mineral" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iron">Iron</SelectItem>
                <SelectItem value="copper">Copper</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}