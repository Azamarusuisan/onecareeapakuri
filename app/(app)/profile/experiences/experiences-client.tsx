"use client";

import { useState } from "react";
import {
  EXPERIENCE_CATEGORY_LABELS,
  EXPERIENCE_SKILL_SUGGESTIONS,
  type UserExperience,
  type ExperienceCategory,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Plus,
  ChevronRight,
  Briefcase,
  X,
  Star,
  StarOff,
  Pencil,
  Trash2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DEMO_INITIAL: UserExperience[] = [];

const categoryOptions = (
  Object.entries(EXPERIENCE_CATEGORY_LABELS) as [ExperienceCategory, string][]
).map(([value, label]) => ({ value, label }));

type Mode = "list" | "new" | "edit";

export function ExperiencesClient({
  initialExperiences,
}: {
  initialExperiences: UserExperience[];
}) {
  const [experiences, setExperiences] = useState<UserExperience[]>(initialExperiences);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<UserExperience | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const blank = {
    title: "",
    category: "club" as ExperienceCategory,
    description: "",
    skills: [] as string[],
    is_default: false,
  };
  const [form, setForm] = useState(blank);
  const [skillInput, setSkillInput] = useState("");

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      const next = { ...errors };
      delete next[e.target.name];
      setErrors(next);
    }
  };

  function openNew() {
    setForm(blank);
    setEditing(null);
    setErrors({});
    setMode("new");
  }

  function openEdit(exp: UserExperience) {
    setForm({
      title: exp.title,
      category: exp.category,
      description: exp.description,
      skills: [...exp.skills],
      is_default: exp.is_default,
    });
    setEditing(exp);
    setErrors({});
    setMode("edit");
  }

  function addSkill(skill: string) {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "タイトルは必須です";
    if (!form.description.trim()) errs.description = "詳細は必須です";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);

    // Demo mode — save to local state only
    const now = new Date().toISOString();
    if (mode === "new") {
      const newExp: UserExperience = {
        id: crypto.randomUUID(),
        user_id: "demo",
        ...form,
        created_at: now,
        updated_at: now,
      };
      setExperiences([...experiences, newExp]);
    } else if (editing) {
      setExperiences(
        experiences.map((e) =>
          e.id === editing.id ? { ...e, ...form, updated_at: now } : e
        )
      );
    }

    setLoading(false);
    setMode("list");
  }

  async function handleDelete(id: string) {
    if (!confirm("この経験を削除しますか？")) return;
    setExperiences(experiences.filter((e) => e.id !== id));
  }

  function toggleDefault(id: string) {
    setExperiences(
      experiences.map((e) =>
        e.id === id ? { ...e, is_default: !e.is_default } : e
      )
    );
  }

  if (mode === "list") {
    return (
      <div className="px-4 py-4 space-y-3">
        {experiences.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-[#ccc]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">
              まだ経験談がありません
            </h3>
            <p className="text-[12px] text-[#999] mb-6">
              ガクチカや自己PRの元ネタを登録しておくと、
              <br />
              AIがES文章を自動で作成してくれます。
            </p>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              最初の経験を追加する
            </Button>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-[#999]">
              ⭐ マークした経験がES生成時のデフォルトで使用されます
            </p>
            <div className="space-y-2">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white border border-[#e5e5e5] rounded-2xl p-4 hover:border-[#d1d5db] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      exp.is_default ? "bg-[#ecfdf5]" : "bg-[#f5f5f7]"
                    )}>
                      <Briefcase className={cn("h-5 w-5", exp.is_default ? "text-[#059669]" : "text-[#999]")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                          {EXPERIENCE_CATEGORY_LABELS[exp.category]}
                        </span>
                        {exp.is_default && (
                          <span className="text-[10px] font-bold text-[#f59e0b] bg-[#fef9c3] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5" />デフォルト
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-1">
                        {exp.title}
                      </h3>
                      <p className="text-[12px] text-[#666] line-clamp-2 mt-0.5">
                        {exp.description}
                      </p>
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.skills.map((s) => (
                            <span key={s} className="text-[10px] font-medium text-[#666] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-[#f5f5f7]">
                    <button
                      onClick={() => toggleDefault(exp.id)}
                      className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors",
                        exp.is_default
                          ? "text-[#f59e0b] bg-[#fef9c3]"
                          : "text-[#999] hover:bg-[#f5f5f7]"
                      )}
                    >
                      {exp.is_default ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
                      {exp.is_default ? "使用中" : "デフォルト設定"}
                    </button>
                    <button
                      onClick={() => openEdit(exp)}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-[#666] hover:bg-[#f5f5f7] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-[#ff3b30] hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={openNew}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#e5e5e5] rounded-2xl text-[13px] font-bold text-[#666] hover:border-[#059669] hover:text-[#059669] hover:bg-[#ecfdf5] transition-colors"
            >
              <Plus className="h-4 w-4" />
              経験を追加する
            </button>
          </>
        )}
      </div>
    );
  }

  // New / Edit form
  return (
    <div className="px-4 py-4 space-y-5 animate-in slide-in-from-right-2 fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-[17px] font-bold text-[#1a1a1a]">
          {mode === "new" ? "経験を追加" : "経験を編集"}
        </h2>
        <p className="text-[12px] text-[#666]">
          STAR法（状況・課題・行動・結果）を意識して記入すると、より質の高いESが生成されます。
        </p>
      </div>

      <Select
        id="category"
        name="category"
        label="カテゴリ"
        options={categoryOptions}
        value={form.category}
        onChange={updateForm}
      />

      <Input
        id="title"
        name="title"
        label="タイトル"
        placeholder="例: テニスサークルで主将を務め、部員数を3倍に増やした"
        required
        error={errors.title}
        value={form.title}
        onChange={updateForm}
      />

      <Textarea
        id="description"
        name="description"
        label="詳細（STAR法で記述してください）"
        placeholder={`【状況】〇〇サークルで…\n【課題】〇〇という問題があった\n【行動】私は〇〇を行った\n【結果】〇〇という成果を達成した`}
        required
        error={errors.description}
        value={form.description}
        onChange={updateForm}
        className="h-36"
      />

      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-[#1a1a1a]">
          発揮したスキル・強み
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="スキルを追加..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            className="flex-1 border border-[#e5e5e5] rounded-lg bg-white py-2 px-3 text-sm placeholder:text-[#999] focus:border-[#059669] focus:outline-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addSkill(skillInput)}
          >
            追加
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.skills.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 text-[12px] font-medium text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full"
            >
              {s}
              <button onClick={() => removeSkill(s)} className="text-[#059669]/60 hover:text-[#059669]">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#999]">候補から選ぶ:</p>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="text-[11px] font-medium text-[#666] bg-[#f5f5f7] px-2.5 py-1 rounded-full hover:bg-[#ecfdf5] hover:text-[#059669] transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 py-3 px-4 border border-[#e5e5e5] rounded-xl">
        <button
          type="button"
          onClick={() => setForm({ ...form, is_default: !form.is_default })}
          className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
            form.is_default ? "border-[#f59e0b] bg-[#f59e0b]" : "border-[#e5e5e5]"
          )}
        >
          {form.is_default && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
        </button>
        <div>
          <p className="text-[13px] font-bold text-[#1a1a1a]">デフォルトで使用</p>
          <p className="text-[11px] text-[#999]">ES生成時に自動で選択されます</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("list")}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          loading={loading}
          className="flex-[2] gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          {mode === "new" ? "追加する" : "保存する"}
        </Button>
      </div>
    </div>
  );
}
