import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
 * ROLE: a transient menu. shadcn/ui dropdown-menu, styled with Linaw tokens:
 * 16px radius, hairline border, card elevation. Radix handles focus, typeahead,
 * arrow keys, Escape, and portals the content so headers never clip it.
 */
const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

function DropdownMenuContent({ className, sideOffset = 8, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-card border border-line bg-popover p-1.5 text-popover-foreground shadow-float',
          'animate-menu-in motion-reduce:animate-none',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuLabel({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('px-3 pt-2 pb-1.5 text-sm font-semibold text-subtle', className)}
      {...props}
    />
  )
}

function DropdownMenuRadioItem({ className, children, ...props }) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'relative flex min-h-11 cursor-pointer items-center gap-3 rounded-btn py-2 pr-9 pl-3 text-base outline-none select-none',
        'transition-colors data-[highlighted]:bg-surface-2 data-[state=checked]:font-semibold data-[state=checked]:text-brand',
        className,
      )}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="absolute right-3 grid place-items-center">
        <CheckIcon size={18} aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
}
