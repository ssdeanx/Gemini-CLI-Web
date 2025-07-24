import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:-translate-y-0.5 active:translate-y-0 morph-hover",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-layered hover:shadow-elevated hover:bg-primary/90 glow-minimal",
        destructive:
          "bg-destructive text-destructive-foreground shadow-layered hover:bg-destructive/90 glow-minimal",
        outline:
          "border border-input bg-background shadow-layered hover:bg-accent hover:text-accent-foreground neumorphic dark:neumorphic-dark",
        secondary:
          "bg-secondary text-secondary-foreground shadow-layered hover:bg-secondary/80 neumorphic dark:neumorphic-dark",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline glow-neon",
        gemini: "gradient-gemini text-white shadow-elevated hover:shadow-elevated glow-sidebar",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }