import type { ReactNode } from "react";

// Deliberately small: the assistant is asked to avoid markdown, but models
// reach for **bold**/lists anyway when a reply genuinely wants structure -
// this renders the handful of patterns that show up in practice (bold,
// inline code, bullet/numbered lists, paragraphs) instead of leaking raw
// asterisks and dashes into the chat bubble.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyPrefix}-${i}`} className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function renderMarkdownLite(text: string): ReactNode {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] | null = null;
  let listOrdered = false;

  function flushList() {
    if (!listItems) return;
    const Tag = listOrdered ? "ol" : "ul";
    blocks.push(
      <Tag key={`list-${blocks.length}`} className={listOrdered ? "list-decimal pl-5" : "list-disc pl-5"}>
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    listItems = null;
  }

  lines.forEach((line, i) => {
    const bullet = line.match(/^\s*[-*]\s+(.*)/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)/);
    if (bullet) {
      if (!listItems || listOrdered) {
        flushList();
        listItems = [];
        listOrdered = false;
      }
      listItems.push(bullet[1]);
      return;
    }
    if (numbered) {
      if (!listItems || !listOrdered) {
        flushList();
        listItems = [];
        listOrdered = true;
      }
      listItems.push(numbered[1]);
      return;
    }
    flushList();
    if (line.trim() === "") {
      if (i !== lines.length - 1) blocks.push(<div key={`sp-${i}`} className="h-2" />);
      return;
    }
    blocks.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>);
  });
  flushList();

  return <div className="flex flex-col gap-1">{blocks}</div>;
}
