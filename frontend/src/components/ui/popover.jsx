import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

/*
 * ROLE: a small floating panel anchored to a trigger. shadcn/ui popover, styled with Linaw tokens
 * (same shell as dropdown-menu). Radix handles focus, Escape, outside click, collision, and portals it.
 */
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

function PopoverContent({ className, align = 'center', sideOffset = 8, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          'z-50 w-80 max-w-[calc(100vw-24px)] origin-(--radix-popover-content-transform-origin) rounded-card border border-line bg-popover p-4 text-popover-foreground shadow-float outline-none',
          'animate-menu-in motion-reduce:animate-none',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
