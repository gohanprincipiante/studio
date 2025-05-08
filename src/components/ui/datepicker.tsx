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
  captionLayout = "dropdown-buttons",
  fromYear,
  toYear,
  popoverSide = "bottom", 
  popoverAlign = "center", // Defaulted to center after previous request
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
        className="w-[320px] p-0" // Increased width from w-auto
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
          captionLayout={captionLayout}
          fromYear={fromYear ?? 1900} 
          toYear={toYear ?? new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  )
}
