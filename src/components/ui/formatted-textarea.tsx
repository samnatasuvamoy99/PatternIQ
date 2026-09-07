"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  Bold,
  Underline,
  Italic,
  Code,
  List,
  ListOrdered,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Wand2,
  CheckCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedText } from "@/components/ui/formatted-text";
import { cn } from "@/lib/utils";

interface FormattedTextareaProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
  required?: boolean;
}

// ─── Smart Format Engine ────────────────────────────────────────────────────
// Detects patterns in raw pasted text and auto-converts to the Step Card format
// that FormattedText renders into the beautiful UI cards.

function detectHasAutoFormattable(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  // Has arrow-trace lines not yet prefixed with Step N:
  const hasArrowLines = lines.some(
    (l) =>
      /==>|->/.test(l) &&
      !/^(Step\s+\d+|Phase\s+\d+|Pass\s+\d+|Iteration\s+\d+)\s*:/i.test(l.trim())
  );
  // Has numbered list items (1. text or 1) text)
  const hasNumberedList = lines.some((l) => /^\d+[.)]\s+\S/.test(l.trim()));
  return hasArrowLines || hasNumberedList;
}

function autoFormatText(text: string): string {
  const lines = text.split("\n");
  let stepCounter = 1;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Blank line between blocks resets step counter
      stepCounter = 1;
      result.push(line);
      continue;
    }

    // Already a Step N: / Phase N: / Pass N: / Iteration N: line → keep as-is
    if (
      /^(Step\s+\d+|Phase\s+\d+|Pass\s+\d+|Iteration\s+\d+)\s*:/i.test(trimmed)
    ) {
      result.push(line);
      const numMatch = trimmed.match(/\d+/);
      if (numMatch) stepCounter = parseInt(numMatch[0]) + 1;
      continue;
    }

    // Arrow trace line: "i = 1 ==> Pair: (1, 36)" or "n = 5 -> result: 10"
    // Convert to "Step N: ..."
    if (/==>|->/.test(trimmed) && !trimmed.startsWith(">")) {
      result.push(`Step ${stepCounter++}: ${trimmed}`);
      continue;
    }

    // Numbered list item "1. text" or "1) text" → "Step 1: text"
    const numListMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (numListMatch) {
      result.push(`Step ${numListMatch[1]}: ${numListMatch[2]}`);
      stepCounter = parseInt(numListMatch[1]) + 1;
      continue;
    }

    // Plain long sentence that stands alone → wrap in italic markers
    const prevEmpty = i === 0 || !lines[i - 1]?.trim();
    const nextEmpty = i === lines.length - 1 || !lines[i + 1]?.trim();
    const isLongSentence =
      trimmed.length > 40 &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("[") &&
      !/^[A-Za-z0-9 ]{1,30}:\s+\S/.test(trimmed);

    if (prevEmpty && nextEmpty && isLongSentence) {
      result.push(`*${trimmed}*`);
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FormattedTextarea({
  label,
  value,
  onChange,
  placeholder = "Type concept explanation here...",
  rows = 4,
  className,
  id,
  required = false,
}: FormattedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<"applied" | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((type: "applied") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(type);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Format helpers ──────────────────────────────────────────────────────
  const applyFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    if (selectedText.length > 0) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      const defaultWord =
        prefix === "<b>" || prefix === "**"
          ? "bold word"
          : prefix.includes("u>")
          ? "underlined phrase"
          : "concept";
      replacement = `${prefix}${defaultWord}${suffix}`;
    }

    const newValue =
      value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(
          start + prefix.length,
          start +
            prefix.length +
            (replacement.length - prefix.length - suffix.length)
        );
      }
    }, 10);
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    if (selectedText.length > 0) {
      replacement = selectedText
        .split("\n")
        .map((line) => {
          if (!line.trim()) return line;
          const clean = line.trim().replace(/^(\d+\.|\d+\)|-|\*)\s*/, "");
          return `- ${clean}`;
        })
        .join("\n");
    } else {
      replacement = "\n- Item 1\n- Item 2\n- Item 3\n";
    }

    onChange(value.substring(0, start) + replacement + value.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  const insertOrderedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    if (selectedText.length > 0) {
      let num = 1;
      replacement = selectedText
        .split("\n")
        .map((line) => {
          if (!line.trim()) return line;
          const clean = line.trim().replace(/^(\d+\.|\d+\)|-|\*)\s*/, "");
          return `${num++}. ${clean}`;
        })
        .join("\n");
    } else {
      replacement =
        "\n1. First step or point\n2. Second step or point\n3. Third step or point\n";
    }

    onChange(value.substring(0, start) + replacement + value.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  // ── Smart Format (toolbar button) ───────────────────────────────────────
  const handleSmartFormat = () => {
    if (!value.trim()) return;
    const formatted = autoFormatText(value);
    if (formatted !== value) {
      onChange(formatted);
      showToast("applied");
    }
  };

  // ── Smart Paste handler ─────────────────────────────────────────────────
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;

    if (detectHasAutoFormattable(pasted)) {
      e.preventDefault();
      const formatted = autoFormatText(pasted);
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + formatted + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + formatted.length,
          start + formatted.length
        );
      }, 10);

      showToast("applied");
    }
  };

  const hasFormattableContent = !showPreview && value.trim() && detectHasAutoFormattable(value);

  return (
    <div className="space-y-1.5 w-full">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={id}
            className="font-semibold text-xs text-foreground flex items-center gap-1.5"
          >
            <span>{label}</span>
            {required && <span className="text-destructive">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
          >
            {showPreview ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span>{showPreview ? "Edit Mode" : "Live Preview"}</span>
          </Button>
        </div>
      </div>

      {/* Smart-format toast notification */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          toast ? "max-h-12 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          <CheckCheck className="h-3.5 w-3.5 shrink-0" />
          <span>
            ✨ Smart Format applied — step traces &amp; patterns auto-converted to
            visual Step Cards!
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-emerald-400/60 hover:text-emerald-400"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all focus-within:ring-1 focus-within:ring-ring">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-1 p-1.5 border-b border-border bg-muted/40 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyFormat("**", "**")}
              title="Bold selected text (**word**)"
              className="p-1 px-2 rounded hover:bg-muted font-bold text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <Bold className="h-3.5 w-3.5" />
              <span>Bold</span>
            </button>

            <button
              type="button"
              onClick={() => applyFormat("<u>", "</u>")}
              title="Underline selected text (<u>word</u>)"
              className="p-1 px-2 rounded hover:bg-muted underline font-medium text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <Underline className="h-3.5 w-3.5" />
              <span>Underline</span>
            </button>

            <button
              type="button"
              onClick={() => applyFormat("*", "*")}
              title="Italic selected text (*word*)"
              className="p-1 px-2 rounded hover:bg-muted italic text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <Italic className="h-3.5 w-3.5" />
              <span>Italic</span>
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              type="button"
              onClick={() => applyFormat("`", "`")}
              title="Code format (`code`)"
              className="p-1 px-2 rounded hover:bg-muted font-mono text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <Code className="h-3.5 w-3.5" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={insertBulletList}
              title="Insert bullet list (- item)"
              className="p-1 px-2 rounded hover:bg-muted text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <List className="h-3.5 w-3.5" />
              <span>Bullet List</span>
            </button>

            <button
              type="button"
              onClick={insertOrderedList}
              title="Insert numbered list (1. item)"
              className="p-1 px-2 rounded hover:bg-muted text-foreground transition-colors flex items-center gap-1 text-[11px]"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Numbered List</span>
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              type="button"
              onClick={() =>
                applyFormat(
                  "\nStep 1: 1234 % 10 ==> Extract 4 | 1234 / 10 ==> Remaining: 123\nStep 2: 123 % 10 ==> Extract 3 | 123 / 10 ==> Remaining: 12\n"
                )
              }
              title="Insert visual dry-run step card template"
              className="p-1 px-2 rounded hover:bg-primary/20 text-primary font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>+ Step Card</span>
            </button>

            <button
              type="button"
              onClick={() => applyFormat("\nInitial Number: 1234\n-------------------\n")}
              title="Insert header badge & divider"
              className="p-1 px-2 rounded hover:bg-amber-500/20 text-amber-400 font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>+ Header &amp; Line</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = value.substring(start, end);
                const lines = selectedText
                  ? selectedText
                      .split("\n")
                      .map((l) => (l.trim() ? `> ${l.trim()}` : l))
                      .join("\n")
                  : "> Do not convert the integer to a string (forces O(1) extra space)";
                const newValue =
                  value.substring(0, start) +
                  (selectedText ? lines : "\n" + lines + "\n") +
                  value.substring(end);
                onChange(newValue);
                setTimeout(() => {
                  textarea.focus();
                }, 10);
              }}
              title="Insert constraint / warning note (> text)"
              className="p-1 px-2 rounded hover:bg-amber-500/20 text-amber-400 font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>⚠ Constraint</span>
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* ⚡ Smart Format button */}
            <button
              type="button"
              onClick={handleSmartFormat}
              title="Auto-detect step traces, arrow lines, numbered lists → convert to Step Card format"
              className={cn(
                "p-1 px-2 rounded font-semibold transition-all flex items-center gap-1 text-[11px] border shadow-xs",
                hasFormattableContent
                  ? "bg-gradient-to-r from-violet-500/30 to-primary/20 text-violet-200 border-violet-400/50 animate-pulse hover:animate-none hover:from-violet-500/40"
                  : "bg-gradient-to-r from-violet-500/10 to-primary/10 text-violet-300/70 border-violet-500/20 hover:from-violet-500/20 hover:border-violet-400/40 hover:text-violet-200"
              )}
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>⚡ Smart Format</span>
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline-flex items-center gap-1 shrink-0">
            <Sparkles className="h-3 w-3 text-amber-400" /> Highlight text to
            format
          </span>
        </div>

        {/* ── Textarea or Preview ── */}
        {!showPreview ? (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-y font-sans leading-relaxed",
              className
            )}
          />
        ) : (
          <div className="p-3.5 min-h-[100px] max-h-[400px] overflow-y-auto bg-muted/10 border-t border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-primary" />
              <span>Student Section View Preview</span>
              <span className="ml-auto text-[9px] text-muted-foreground/50 normal-case tracking-normal font-normal">
                Renders exactly as students see it
              </span>
            </div>
            {value.trim() ? (
              <FormattedText content={value} className="text-xs" />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No text entered yet. Paste content or use the toolbar — click ⚡
                Smart Format to auto-detect step patterns!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Hint bar: shown below when unformatted patterns are detected */}
      {hasFormattableContent && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] border border-violet-500/20 bg-violet-500/5 text-violet-300/80">
          <Wand2 className="h-3 w-3 shrink-0 text-violet-400" />
          <span>
            Step/trace patterns detected. Click{" "}
            <strong className="text-violet-300">⚡ Smart Format</strong> to
            auto-convert them to visual Step Cards.
          </span>
        </div>
      )}
    </div>
  );
}

