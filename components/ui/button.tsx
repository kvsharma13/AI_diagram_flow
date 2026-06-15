import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-[#2563EB] hover:bg-[#3B82F6] active:bg-[#1D4ED8] text-white shadow-[0_0_16px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]",
        destructive:
          "bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] hover:bg-[#EF4444]/20 hover:border-[#EF4444]/40",
        outline:
          "border border-white/[0.08] bg-white/[0.03] text-[#F3F4F6] hover:bg-white/[0.06] hover:border-white/[0.12]",
        secondary:
          "bg-white/[0.05] border border-white/[0.08] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-[#F3F4F6] hover:border-white/[0.12]",
        ghost:
          "text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F3F4F6]",
        link:
          "text-[#3B82F6] underline-offset-4 hover:underline hover:text-[#2563EB]",
        success:
          "bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] hover:bg-[#22C55E]/20",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-11 px-7 text-base",
        xl:      "h-13 px-9 text-lg",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
