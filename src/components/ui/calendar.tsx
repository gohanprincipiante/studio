
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import * as SelectPrimitive from "@radix-ui/react-select"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const CustomFooterContent: React.FC = () => {
  const { currentMonth, goToMonth, fromDate, toDate, locale } = useDayPicker();

  if (!currentMonth) return null;

  const startYear = fromDate ? fromDate.getFullYear() : currentMonth.getFullYear() - 100;
  const endYear = toDate ? toDate.getFullYear() : currentMonth.getFullYear();

  const years: number[] = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }

  const monthLabels: string[] = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(currentMonth.getFullYear(), i, 1);
    let label = format(monthDate, "MMMM", { locale: locale || es });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
  
  return (
    <div className="flex justify-center items-center gap-2 px-3 pt-3 pb-1 border-t border-border mt-2">
      <SelectPrimitive.Root
        value={currentMonth.getMonth().toString()}
        onValueChange={(value) => {
          goToMonth(new Date(currentMonth.getFullYear(), parseInt(value, 10)));
        }}
      >
        <SelectPrimitive.Trigger 
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground w-[120px]")}
          aria-label="Seleccionar mes"
        >
          <SelectPrimitive.Value />
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content 
            position="popper" 
            side="top" 
            align="center" 
            className="max-h-56 z-[100] w-[--radix-select-trigger-width]" // Ensure z-index, max height and width
            sideOffset={5}
          >
            <SelectPrimitive.Viewport>
              {monthLabels.map((month, index) => (
                <SelectPrimitive.Item key={index} value={index.toString()}>
                  {month}
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      <SelectPrimitive.Root
        value={currentMonth.getFullYear().toString()}
        onValueChange={(value) => {
          goToMonth(new Date(parseInt(value, 10), currentMonth.getMonth()));
        }}
      >
        <SelectPrimitive.Trigger 
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground w-[80px]")}
          aria-label="Seleccionar año"
        >
          <SelectPrimitive.Value />
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content 
            position="popper" 
            side="top" 
            align="center" 
            className="max-h-56 z-[100] w-[--radix-select-trigger-width]" // Ensure z-index, max height and width
            sideOffset={5}
          >
            <SelectPrimitive.Viewport>
              {years.map((year) => (
                <SelectPrimitive.Item key={year} value={year.toString()}>
                  {year}
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center", // mb-4 removed, footer will handle spacing
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: (iconProps) => <ChevronLeft {...iconProps} className={cn("h-4 w-4", iconProps.className)} />,
        IconRight: (iconProps) => <ChevronRight {...iconProps} className={cn("h-4 w-4", iconProps.className)} />,
        Footer: CustomFooterContent,
      }}
      captionLayout="buttons" // Use "buttons" to show only prev/next and label in caption
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
