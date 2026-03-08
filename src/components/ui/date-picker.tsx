import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", required }: DatePickerProps) {
  const selected = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="border-t p-2">
          <PopoverClose asChild>
            <Button size="sm" className="w-full">
              Done
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
