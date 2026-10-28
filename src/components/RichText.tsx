/** Renders newline-separated text; consecutive lines starting with "• " become a bullet list. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: ({ type: "p"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const line of lines) {
    if (line.startsWith("• ")) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return (
    <div className={`prose-plain ${className}`}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="list-disc pl-5 space-y-1 my-2">
            {b.items.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        )
      )}
    </div>
  );
}
