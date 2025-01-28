interface ProgressProps {
  value: number
  max: number
}

export function Progress({ value, max }: ProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
      </div>
    </div>
  )
}

