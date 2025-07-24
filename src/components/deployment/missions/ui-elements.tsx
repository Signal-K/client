"use client";

import type React from "react"

import type { ElementType } from "react"

// Decorative bolt component
export const Bolt = ({ className = "" }: { className?: string }) => (
  <div className={`w-3 h-3 rounded-full bg-secondary/70 border border-secondary/30 ${className}`}></div>
)

// Status indicator component
export const StatusIndicator = ({ active = true, className = "" }: { active?: boolean; className?: string }) => (
  <div className="flex items-center space-x-1">
    <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
    <span className="text-xs text-muted-foreground">{active ? "Online" : "Offline"}</span>
  </div>
)

// Device button component
export const DeviceButton = ({
  icon: Icon,
  label,
  onClick,
  className = "",
}: {
  icon: ElementType
  label: string
  onClick?: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors ${className}`}
  >
    <Icon className="w-4 h-4 mb-1 text-muted-foreground" />
    <span className="text-xs text-muted-foreground">{label}</span>
  </button>
)

// Create our own simplified Card components
export const Card = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => (
  <div onClick={onClick} className={`rounded-lg border bg-card shadow-sm ${className}`}>
    {children}
  </div>
)

export const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => <div className={`${className}`}>{children}</div>

// Star component for difficulty ratings
export const Star = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// Clock component
export const Clock = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);