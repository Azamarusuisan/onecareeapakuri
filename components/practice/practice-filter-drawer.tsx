"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal, ChevronRight, Check } from "lucide-react";
import { INTERVIEW_STAGES, PRACTICE_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface PracticeFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  currentStage: string;
  onApply: (type: string, stage: string) => void;
}

export function PracticeFilterDrawer({
  isOpen,
  onClose,
  currentType,
  currentStage,
  onApply,
}: PracticeFilterDrawerProps) {
  const [localType, setLocalType] = useState(currentType);
  const [localStage, setLocalStage] = useState(currentStage);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setLocalType(currentType);
      setLocalStage(currentStage);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, currentType, currentStage]);

  const handleApply = () => {
    onApply(localType, localStage);
    onClose();
  };

  const handleReset = () => {
    setLocalType("all");
    setLocalStage("all");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-out flex flex-col max-h-[90vh]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2 text-[#1a1a1a]">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="text-[15px] font-bold">絞り込み</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#999] active:bg-[#f5f5f5] rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* Practice Type */}
          <section>
            <h3 className="text-[13px] font-bold text-[#1a1a1a] mb-3">練習タイプ</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalType("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-colors border",
                  localType === "all" || !localType
                    ? "bg-[#ecfdf5] border-[#059669] text-[#059669]"
                    : "bg-white border-[#e5e5e5] text-[#666] hover:bg-[#fafafa]"
                )}
              >
                すべて
              </button>
              {Object.entries(PRACTICE_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setLocalType(key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-bold transition-colors border flex items-center gap-1.5",
                    localType === key
                      ? "bg-[#ecfdf5] border-[#059669] text-[#059669]"
                      : "bg-white border-[#e5e5e5] text-[#666] hover:bg-[#fafafa]"
                  )}
                >
                  {localType === key && <Check className="h-3 w-3" />}
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Interview Stage */}
          <section>
            <h3 className="text-[13px] font-bold text-[#1a1a1a] mb-3">面接ステージ</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalStage("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-colors border",
                  localStage === "all" || !localStage
                    ? "bg-[#ecfdf5] border-[#059669] text-[#059669]"
                    : "bg-white border-[#e5e5e5] text-[#666] hover:bg-[#fafafa]"
                )}
              >
                指定なし
              </button>
              {INTERVIEW_STAGES.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => setLocalStage(stage.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-bold transition-colors border flex items-center gap-1.5",
                    localStage === stage.value
                      ? "bg-[#ecfdf5] border-[#059669] text-[#059669]"
                      : "bg-white border-[#e5e5e5] text-[#666] hover:bg-[#fafafa]"
                  )}
                >
                  {localStage === stage.value && <Check className="h-3 w-3" />}
                  {stage.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5] flex gap-3 bg-white">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            リセット
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            検索する
          </Button>
        </div>
      </div>
    </>
  );
}
