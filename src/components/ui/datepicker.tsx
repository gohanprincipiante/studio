
"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale" // Import Spanish locale
import { Calendar as CalendarIcon } from "lucide-react"
import type { CaptionLayout } from "react-day-picker"
import type { PopoverContentProps as RadixPopoverContentProps } from "@radix-ui/react-popover"


import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  // Calendar specific props
  captionLayout?: CaptionLayout;
  fromYear?: number;
  toYear?: number;
  // PopoverContent specific props
  popoverSide?: RadixPopoverContentProps['side'];
  popoverAlign?: RadixPopoverContentProps['align'];
  popoverSideOffset?: RadixPopoverContentProps['sideOffset'];
}

export function DatePicker({ 
  date, 
  setDate, 
  placeholder = "Seleccione una fecha", 
  className, 
  disabled,
  captionLayout = "dropdown-buttons", // Default remains for clarity, Calendar will handle actual layout
  fromYear,
  toYear,
  popoverSide = "bottom", 
  popoverAlign = "center",
  popoverSideOffset = 10,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] p-0" 
        align={popoverAlign}
        side={popoverSide}
        sideOffset={popoverSideOffset}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}
          locale={es}
          captionLayout={captionLayout} // Calendar will override this to "buttons" and use footer
          fromYear={fromYear ?? 1900} 
          toYear={toYear ?? new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  )
}
