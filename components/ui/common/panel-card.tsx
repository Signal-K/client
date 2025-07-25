import type * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/src/shared/utils"

interface PanelCardProps extends React.ComponentProps<typeof Card> {
  borderColorClass: string
  panelTitle?: string | React.ReactNode
  icon?: React.ElementType
  headerRightContent?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
};

export function PanelCard({
  borderColorClass,
  panelTitle,
  icon: Icon,
  headerRightContent,
  children,
  className,
  contentClassName,
  ...props
}: PanelCardProps) {
  return (
    <Card className={cn("bg-card", borderColorClass, className)} {...props}>
      {(panelTitle || Icon || headerRightContent) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-sm flex items-center gap-2", borderColorClass.replace("border-", "text-"))}>
              {Icon && <Icon className="w-4 h-4" />}
              {panelTitle}
            </CardTitle>
            {headerRightContent}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("p-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
};