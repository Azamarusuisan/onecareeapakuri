"use client";

import { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, X, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TimeSlot {
  start_at: string;
  end_at: string;
}

interface DateTimeSlotPickerProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  maxSlots?: number;
}

export function DateTimeSlotPicker({
  slots,
  onChange,
  maxSlots = 5,
}: DateTimeSlotPickerProps) {
  // Generate next 14 days
  const today = new Date();
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [startHour, setStartHour] = useState("18");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("19");
  const [endMin, setEndMin] = useState("00");

  const addSlot = () => {
    if (slots.length >= maxSlots) return;

    // Create start and end date objects
    const start = new Date(selectedDate);
    start.setHours(parseInt(startHour, 10), parseInt(startMin, 10), 0, 0);

    const end = new Date(selectedDate);
    end.setHours(parseInt(endHour, 10), parseInt(endMin, 10), 0, 0);

    // Ensure start is before end
    if (start >= end) {
      alert("終了時間は開始時間より後に設定してください");
      return;
    }

    // Format for datetime-local string to match existing logic (YYYY-MM-DDThh:mm)
    const formatLocal = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    onChange([...slots, { start_at: formatLocal(start), end_at: formatLocal(end) }]);
  };

  const removeSlot = (index: number) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const hours = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, "0"));
  const mins = ["00", "15", "30", "45"];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="space-y-2">
        <label className="text-[13px] font-bold text-[#1a1a1a]">日にちを選ぶ</label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {nextDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border-2 transition-all",
                  isSelected
                    ? "border-[#059669] bg-[#ecfdf5] shadow-sm transform scale-[1.02]"
                    : "border-[#f0f0f0] bg-white text-[#666] hover:border-[#e5e5e5]"
                )}
              >
                <span className={cn("text-[11px] font-bold mb-1", isSelected ? "text-[#059669]" : "text-[#999]")}>
                  {format(date, "E", { locale: ja })}
                </span>
                <span className={cn("text-[18px] font-black", isSelected ? "text-[#059669]" : "text-[#1a1a1a]")}>
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selector */}
      <div className="space-y-2">
        <label className="text-[13px] font-bold text-[#1a1a1a]">時間帯を選ぶ</label>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-[#f5f5f5] rounded-xl px-3 py-2 border border-transparent focus-within:border-[#059669] focus-within:bg-white transition-colors">
            <Clock className="h-4 w-4 text-[#999] mr-2" />
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="bg-transparent text-[15px] font-bold text-[#1a1a1a] outline-none appearance-none"
            >
              {hours.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-[#1a1a1a] font-bold mx-1">:</span>
            <select
              value={startMin}
              onChange={(e) => setStartMin(e.target.value)}
              className="bg-transparent text-[15px] font-bold text-[#1a1a1a] outline-none appearance-none"
            >
              {mins.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span className="text-[#999] font-bold">〜</span>
          <div className="flex-1 flex items-center bg-[#f5f5f5] rounded-xl px-3 py-2 border border-transparent focus-within:border-[#059669] focus-within:bg-white transition-colors">
            <select
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="bg-transparent text-[15px] font-bold text-[#1a1a1a] outline-none appearance-none"
            >
              {hours.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-[#1a1a1a] font-bold mx-1">:</span>
            <select
              value={endMin}
              onChange={(e) => setEndMin(e.target.value)}
              className="bg-transparent text-[15px] font-bold text-[#1a1a1a] outline-none appearance-none"
            >
              {mins.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={addSlot}
          disabled={slots.length >= maxSlots}
          className="w-full mt-3 py-3 rounded-xl bg-[#1a1a1a] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:bg-[#333] transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          候補を追加する
        </button>
      </div>

      {/* Added Slots List */}
      <div className="pt-4 border-t border-[#f0f0f0] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#1a1a1a]">追加済みの候補日時</label>
          <span className="text-[11px] font-bold text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded-full">
            {slots.length} / {maxSlots}
          </span>
        </div>
        
        {slots.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center bg-[#fafafa] rounded-xl border border-dashed border-[#e5e5e5]">
            <Calendar className="h-6 w-6 text-[#ccc] mb-2" />
            <p className="text-[12px] text-[#999]">まだ候補がありません<br/>上のピッカーから追加してください</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, i) => {
              // Parse strings back to Dates for display
              const start = slot.start_at ? new Date(slot.start_at) : null;
              const end = slot.end_at ? new Date(slot.end_at) : null;

              return (
                <div key={i} className="flex items-center justify-between bg-white border border-[#e5e5e5] rounded-xl p-3 shadow-sm animate-pop">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#ecfdf5] text-[#059669] flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold leading-none mb-0.5">
                        {start ? format(start, "E", { locale: ja }) : "-"}
                      </span>
                      <span className="text-[15px] font-black leading-none">
                        {start ? format(start, "d") : "-"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#666] font-medium mb-0.5">
                        {start ? format(start, "yyyy年 M月") : ""}
                      </p>
                      <p className="text-[14px] font-bold text-[#1a1a1a]">
                        {start ? format(start, "HH:mm") : "--:--"} <span className="text-[#999] mx-1 font-normal">〜</span> {end ? format(end, "HH:mm") : "--:--"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="p-2 text-[#999] hover:bg-[#f5f5f5] rounded-full active:text-[#ff3b30] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
