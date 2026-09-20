"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Workflow, AlertTriangle, Loader2 } from "lucide-react";

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    darkMode: true,
    themeVariables: {
      background: "#0f1117",
      primaryColor: "#6366f1",
      primaryTextColor: "#f1f5f9",
      primaryBorderColor: "#4f46e5",
      lineColor: "#64748b",
      secondaryColor: "#1e293b",
      tertiaryColor: "#0f172a",
      edgeLabelBackground: "#1e293b",
      nodeTextColor: "#f1f5f9",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "13px",
    },
    flowchart: { curve: "basis", useMaxWidth: true },
    er: { useMaxWidth: true },
    sequence: { useMaxWidth: true },
  } as any);
  mermaidInitialized = true;
}

let diagramIdCounter = 0;

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

export function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const idRef = useRef(`mermaid-${++diagramIdCounter}-${Date.now()}`);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setIsLoading(true);
      setError(null);
      setSvgContent(null);

      try {
        initMermaid();

        // Sanitize: strip %% comment lines & :::className class assignments
        const cleanedCode = code
          .split("\n")
          .filter((l) => !l.trim().startsWith("%%"))
          .join("\n")
          // Remove :::className syntax (inline class assignments not supported in all versions)
          .replace(/:::(\w+)/g, "");

        const { svg } = await mermaid.render(idRef.current, cleanedCode);
        if (!cancelled) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Could not render diagram");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div
      className={`my-5 rounded-2xl border border-primary/30 bg-card shadow-md overflow-hidden ${className ?? ""}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Workflow className="h-4 w-4" />
          <span>Architecture &amp; Data Flow Diagram</span>
        </div>
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20">
          Visual Flowchart
        </span>
      </div>

      {/* Diagram area */}
      <div className="p-4 min-h-[80px] flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Rendering diagram...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-300 w-full">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold mb-0.5">Diagram could not be rendered</p>
              <p className="font-mono opacity-75 text-[11px] whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        )}

        {svgContent && (
          <div
            ref={containerRef}
            className="mermaid-output w-full overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto [&_text]:!fill-slate-200 [&_.label]:!fill-slate-200"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
