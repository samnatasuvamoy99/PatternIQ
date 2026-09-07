import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanLatexMath(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // 1. Remove display math $$...$$
  cleaned = cleaned.replace(/\$\$(.*?)\$\$/gs, "$1");

  // 2. Replace LaTeX arrows, symbols, and operators
  cleaned = cleaned
    .replace(/\\(rightarrow|to)\b/g, "->")
    .replace(/\\leftarrow\b/g, "<-")
    .replace(/\\(Rightarrow|implies)\b/g, "=>")
    .replace(/\\Leftarrow\b/g, "<=")
    .replace(/\\leftrightarrow\b/g, "<->")
    .replace(/\\(le|leq)\b/g, "<=")
    .replace(/\\(ge|geq)\b/g, ">=")
    .replace(/\\(ne|neq)\b/g, "!=")
    .replace(/\\times\b/g, "*")
    .replace(/\\cdot\b/g, "*")
    .replace(/\\infty\b/g, "infinity")
    .replace(/\\mathcal\{O\}/g, "O")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\{/g, "{")
    .replace(/\\right\}/g, "}")
    .replace(/\\lfloor\s*(.*?)\s*\\rfloor/g, "floor($1)")
    .replace(/\\ceil\s*(.*?)\s*\\ceil/g, "ceil($1)");

  // 3. Remove superscript/subscript curly braces like x^{N} -> x^N, a_{i} -> a_i
  cleaned = cleaned.replace(/\^\{([^}]+)\}/g, "^$1");
  cleaned = cleaned.replace(/_\{([^}]+)\}/g, "_$1");

  // 4. Clean spaces around latex spacing commands
  cleaned = cleaned.replace(/\\(quad|qquad|space|nbsp)\b/g, " ");

  // 5. Remove inline math $...$
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, "$1");

  // 6. Clean escaped backslash characters (e.g. \_ -> _, \% -> %)
  cleaned = cleaned.replace(/\\([_%$&])/g, "$1");

  return cleaned;
}

