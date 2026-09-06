"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Terminal, Sparkles, AlertTriangle, Info } from "lucide-react";

interface FormattedTextProps {
  content?: string | null;
  className?: string;
}

export function FormattedText({ content, className }: FormattedTextProps) {
  if (!content) {
    return null;
  }

  // Helper to parse inline tags: **bold**, <b>bold</b>, <u>underline</u>, __underline__, *italic*, `code`
  const parseInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Outer trim of single surrounding italic asterisks if wrapping whole paragraph
    let cleanText = text;

    const regex = /(\*\*.*?\*\*|<b>.*?<\/b>|<u>.*?<\/u>|__.*?__|`.*?`|\*.*?\*)/g;
    const tokens = cleanText.split(regex);

    return tokens.map((token, idx) => {
      if (!token) return null;

      // Bold: **text** or <b>text</b>
      if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("<b>") && token.endsWith("</b>"))) {
        const inner = token.startsWith("**") ? token.slice(2, -2) : token.slice(3, -4);
        return (
          <strong
            key={idx}
            className="font-extrabold text-foreground bg-primary/10 px-1.5 py-0.5 rounded border border-primary/25 shadow-xs"
          >
            {parseInline(inner)}
          </strong>
        );
      }

      // Underline: <u>text</u> or __text__
      if ((token.startsWith("<u>") && token.endsWith("</u>")) || (token.startsWith("__") && token.endsWith("__"))) {
        const inner = token.startsWith("<u>") ? token.slice(3, -4) : token.slice(2, -2);
        return (
          <u
            key={idx}
            className="underline decoration-primary decoration-2 underline-offset-4 font-semibold text-foreground"
          >
            {parseInline(inner)}
          </u>
        );
      }

      // Code: `text`
      if (token.startsWith("`") && token.endsWith("`")) {
        const inner = token.slice(1, -1);
        return (
          <code
            key={idx}
            className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border text-primary font-bold inline-block my-0.5"
          >
            {inner}
          </code>
        );
      }

      // Italic: *text* (excluding **)
      if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
        const inner = token.slice(1, -1);
        return (
          <em key={idx} className="italic text-foreground/90 font-medium">
            {parseInline(inner)}
          </em>
        );
      }

      return <span key={idx}>{token}</span>;
    });
  };

  // Helper to parse dry-run step lines like: "Step 1: 1234 % 10 ==> Extract 4 | 1234 / 10 ==> Remaining: 123"
  const renderStepRow = (line: string, index: number) => {
    // Check if line matches Step pattern
    const stepMatch = line.match(/^(Step\s+\d+|Phase\s+\d+|Pass\s+\d+|Iteration\s+\d+):\s*(.*)/i);

    if (stepMatch) {
      const stepLabel = stepMatch[1];
      const stepContent = stepMatch[2];

      // Split content by pipe '|' or '==>'
      const parts = stepContent.split("|").map((p) => p.trim());

      return (
        <div
          key={`step-${index}`}
          className="group relative my-2 rounded-xl border border-border/80 bg-gradient-to-r from-card via-muted/20 to-primary/5 p-3 sm:p-3.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 px-2.5 items-center justify-center rounded-md bg-primary text-primary-foreground text-[11px] font-extrabold uppercase tracking-wide font-mono shrink-0 shadow-xs">
                {stepLabel}
              </span>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-2 text-xs font-mono">
              {parts.map((part, pIdx) => {
                const subParts = part.split(/==>|->|=>/).map((s) => s.trim());
                return (
                  <React.Fragment key={pIdx}>
                    {pIdx > 0 && <span className="text-muted-foreground/40 font-sans hidden sm:inline">|</span>}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {subParts.map((sub, sIdx) => {
                        const isExtract = sub.toLowerCase().startsWith("extract");
                        const isRemaining = sub.toLowerCase().startsWith("remaining") || sub.toLowerCase().includes("stop");

                        return (
                          <React.Fragment key={sIdx}>
                            {sIdx > 0 && <ArrowRight className="h-3 w-3 text-primary/70 shrink-0" />}
                            <span
                              className={cn(
                                "px-2 py-1 rounded-md text-[11px] font-mono transition-colors",
                                isExtract && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold",
                                isRemaining && "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold",
                                !isExtract && !isRemaining && "bg-muted/60 text-foreground border border-border/60"
                              )}
                            >
                              {parseInline(sub)}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Check for blockquote / constraint note: "> text" => amber warning box
    if (line.trim().startsWith("> ")) {
      const noteText = line.trim().substring(2);
      return (
        <div key={`note-${index}`} className="my-2 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-xs text-amber-200/90 leading-relaxed font-medium">{parseInline(noteText)}</span>
        </div>
      );
    }

    // Check for [!NOTE] info box
    if (line.trim().startsWith("[!NOTE]")) {
      const noteText = line.trim().substring(7).trim();
      return (
        <div key={`info-${index}`} className="my-2 flex items-start gap-2.5 rounded-lg border border-blue-500/30 bg-blue-500/8 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span className="text-xs text-blue-200/90 leading-relaxed font-medium">{parseInline(noteText)}</span>
        </div>
      );
    }

    // Check for key-value headers like "Initial Number: 1234"
    // Only match SHORT keys (1-4 words, letters/digits/spaces only) before the colon
    const kvMatch = line.match(/^([A-Za-z0-9][A-Za-z0-9 ]{0,30}):\s*(\S.*)$/);
    if (kvMatch && !line.startsWith("http") && kvMatch[1].trim().split(/\s+/).length <= 4) {
      const key = kvMatch[1].trim();
      const val = kvMatch[2].trim();

      return (
        <div key={`kv-${index}`} className="my-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-xs">
          <span className="font-bold text-primary">{key}:</span>
          <span className="font-mono font-semibold text-foreground bg-background px-2 py-0.5 rounded border border-border">{parseInline(val)}</span>
        </div>
      );
    }

    // Check for divider lines like "-------------------" or "==="
    if (/^[-=]{3,}$/.test(line.trim())) {
      return (
        <div key={`div-${index}`} className="my-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <Sparkles className="h-3 w-3 text-muted-foreground/40" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      );
    }

    // Check for ordered list item "1. ", "2. ", "1) ", "2) "
    const numMatch = line.trim().match(/^(\d+)[.)]\s+(.*)/);
    if (numMatch) {
      const numStr = numMatch[1];
      const listText = numMatch[2];
      return (
        <div key={`num-item-${index}`} className="flex items-start gap-2.5 my-1.5 pl-1 text-xs sm:text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-mono font-bold shrink-0 mt-0.5 border border-primary/30 shadow-xs">
            {numStr}
          </span>
          <span className="flex-1 leading-relaxed text-foreground/90">{parseInline(listText)}</span>
        </div>
      );
    }

    // Check for list item "- "
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listText = line.trim().substring(2);
      return (
        <div key={`item-${index}`} className="flex items-start gap-2.5 my-1.5 pl-1 text-xs sm:text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed text-foreground/90">{parseInline(listText)}</span>
        </div>
      );
    }

    // Default text line
    return (
      <p key={`p-${index}`} className="my-1.5 leading-relaxed text-xs sm:text-sm text-foreground/90">
        {parseInline(line)}
      </p>
    );
  };

  // Main block parser
  const renderBlocks = () => {
    // Process code blocks inside ``` ... ``` first
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const blocks: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIdx, match.index);
      if (textBefore) {
        const textLines = textBefore.split("\n");
        textLines.forEach((line, lIdx) => {
          if (line.trim()) {
            blocks.push(renderStepRow(line, lastIdx + lIdx));
          }
        });
      }

      const codeContent = match[1].trim();
      blocks.push(
        <div key={`code-block-${match.index}`} className="my-3 rounded-xl border border-border bg-muted/30 p-3 shadow-inner">
          <div className="flex items-center gap-1.5 pb-2 border-b border-border/60 text-[10px] font-mono text-muted-foreground mb-2">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>Trace Execution Block</span>
          </div>
          <pre className="font-mono text-xs text-foreground overflow-x-auto leading-relaxed">{codeContent}</pre>
        </div>
      );

      lastIdx = codeBlockRegex.lastIndex;
    }

    const remainingText = content.substring(lastIdx);
    if (remainingText) {
      // Check if text starts and ends with a single italic asterisk '*' wrapper like *When a problem...*
      let cleanText = remainingText;
      if (cleanText.trim().startsWith("*") && cleanText.trim().endsWith("*") && !cleanText.trim().startsWith("**")) {
        cleanText = cleanText.trim().slice(1, -1).trim();
      }

      const lines = cleanText.split("\n");
      lines.forEach((line, idx) => {
        if (line.trim()) {
          blocks.push(renderStepRow(line, lastIdx + idx));
        }
      });
    }

    return blocks;
  };

  return <div className={cn("space-y-1 font-sans", className)}>{renderBlocks()}</div>;
}
