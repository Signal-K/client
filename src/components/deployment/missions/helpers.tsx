import { Star } from "./ui-elements"

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 border-green-200"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Advanced":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export const getMissionStatusColor = (status: string | undefined) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "offline":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export const getStructureStatusColor = (status: string | undefined) => {
  switch (status) {
    case "operational":
      return "bg-green-100 text-green-800 border-green-200"
    case "limited":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "offline":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export const renderDifficultyStars = (difficulty: number | undefined) => {
  if (!difficulty) return null
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < difficulty ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
      ))}
    </div>
  )
};