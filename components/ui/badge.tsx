import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(37,99,235,0.35)] bg-[rgba(37,99,235,0.14)] text-[#3B82F6]",
        secondary:
          "border-white/[0.08] bg-white/[0.05] text-[#A1A1AA]",
        destructive:
          "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] text-[#EF4444]",
        outline:
          "border-white/[0.10] text-[#71717A]",
        success:
          "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] text-[#22C55E]",
        warning:
          "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] text-[#F59E0B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
