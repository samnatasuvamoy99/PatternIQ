"use client";

import React, { useRef, useState } from "react";
import { Bold, Underline, Italic, Code, List, ListOrdered, Eye, EyeOff, Sparkles, AlertTriangle } from "lucide-react";
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
      const defaultWord = prefix === "<b>" || prefix === "**" ? "bold word" : prefix.includes("u>") ? "underlined phrase" : "concept";
      replacement = `${prefix}${defaultWord}${suffix}`;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + (replacement.length - prefix.length - suffix.length));
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

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
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
      replacement = "\n1. First step or point\n2. Second step or point\n3. Third step or point\n";
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label htmlFor={id} className="font-semibold text-xs text-foreground flex items-center gap-1.5">
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
            {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{showPreview ? "Edit Mode" : "Live Preview"}</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all focus-within:ring-1 focus-within:ring-ring">
        {/* Rich Text Toolbar */}
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
              onClick={() => applyFormat("\nStep 1: 1234 % 10 ==> Extract 4 | 1234 / 10 ==> Remaining: 123\nStep 2: 123 % 10 ==> Extract 3 | 123 / 10 ==> Remaining: 12\n")}
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
              <span>+ Header & Line</span>
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
                  ? selectedText.split("\n").map((l) => (l.trim() ? `> ${l.trim()}` : l)).join("\n")
                  : "> Do not convert the integer to a string (forces O(1) extra space)";
                const newValue = value.substring(0, start) + (selectedText ? lines : "\n" + lines + "\n") + value.substring(end);
                onChange(newValue);
                setTimeout(() => { textarea.focus(); }, 10);
              }}
              title="Insert constraint / warning note (> text)"
              className="p-1 px-2 rounded hover:bg-amber-500/20 text-amber-400 font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>⚠ Constraint</span>
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Highlight text to format
          </span>
        </div>

        {/* Textarea or Preview */}
        {!showPreview ? (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-y font-sans leading-relaxed",
              className
            )}
          />
        ) : (
          <div className="p-3.5 min-h-[100px] max-h-[300px] overflow-y-auto bg-muted/10 border-t border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Eye className="h-3 w-3 text-primary" />
              <span>Student Section View Preview</span>
            </div>
            {value.trim() ? (
              <FormattedText content={value} className="text-xs" />
            ) : (
              <p className="text-xs text-muted-foreground italic">No text entered yet. Highlight and bold/underline words to see the live concept card!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
