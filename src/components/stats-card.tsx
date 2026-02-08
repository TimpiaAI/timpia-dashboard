import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("border-foreground/5", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Icon className="h-5 w-5 text-foreground/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
