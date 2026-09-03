"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

// Tokenize a line of pseudocode for rich syntax highlighting
function highlightPseudocodeLine(line: string) {
  // If whole line is comment
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span className="text-emerald-400/80 italic">{line}</span>;
  }

  // Regex pattern matching different tokens
  // 1: Comments (//...)
  // 2: Strings ("..." or '...')
  // 3: Keywords
  // 4: Numbers
  // 5: Boolean/Null
  // 6: Operators
  const tokenRegex =
    /(\/\/.*$)|("[^"]*"|'[^']*')|\b(function|def|return|while|for|if|else|elif|and|or|not|in|to|down|from|let|const|var|new|class)\b|\b(\d+)\b|\b(true|false|null|None|undefined)\b|([=<>!+\-*\/]+)/g;

  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const start = match.index;
    const matchedText = match[0];

    // Push text preceding the match
    if (start > lastIndex) {
      elements.push(line.slice(lastIndex, start));
    }

    if (match[1]) {
      // Comment
      elements.push(
        <span key={start} className="text-emerald-400/80 italic">
          {matchedText}
        </span>
      );
    } else if (match[2]) {
      // String
      elements.push(
        <span key={start} className="text-emerald-300">
          {matchedText}
        </span>
      );
    } else if (match[3]) {
      // Keyword
      elements.push(
        <span key={start} className="text-purple-400 font-semibold">
          {matchedText}
        </span>
      );
    } else if (match[4]) {
      // Number
      elements.push(
        <span key={start} className="text-amber-300 font-mono">
          {matchedText}
        </span>
      );
    } else if (match[5]) {
      // Boolean / Null
      elements.push(
        <span key={start} className="text-orange-400 font-semibold">
          {matchedText}
        </span>
      );
    } else if (match[6]) {
      // Operators
      elements.push(
        <span key={start} className="text-pink-400">
          {matchedText}
        </span>
      );
    }

    lastIndex = start + matchedText.length;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return elements;
}

export function CodeViewer({
  code,
  language = "pseudocode",
  title,
  className,
  showLineNumbers = true,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-[#0d1117] text-[#e6edf3] shadow-lg overflow-hidden font-mono text-xs",
        className
      )}
    >
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none">
        <div className="flex items-center gap-2.5">
          {/* Window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/90 inline-block" />
          </div>

          <div className="h-3.5 w-px bg-border/40 mx-1" />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="text-[#8b949e]">
              {title || (language === "pseudocode" ? "pseudocode.algo" : `${language}`)}
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium transition-all cursor-pointer",
            copied
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] hover:text-white"
          )}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers & Colorful Syntax */}
      <div className="p-4 overflow-x-auto leading-relaxed">
        <div className="min-w-full inline-block">
          {lines.map((line, idx) => (
            <div key={idx} className="flex hover:bg-[#161b22]/70 -mx-4 px-4 py-0.5 rounded transition-colors">
              {showLineNumbers && (
                <span className="w-8 shrink-0 select-none text-right pr-4 text-[#484f58] font-mono text-[11px]">
                  {idx + 1}
                </span>
              )}
              <span className="flex-1 whitespace-pre text-[#c9d1d9]">
                {highlightPseudocodeLine(line)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
