import { RichText } from "./RichText";

/** Shows the first part of a long text, the rest behind a native "Show more" toggle. */
export function LongText({ text, limit = 420, className = "" }: { text: string; limit?: number; className?: string }) {
  if (text.length <= limit) return <RichText text={text} className={className} />;
  // cut at a paragraph or sentence boundary near the limit
  let cut = text.lastIndexOf("\n", limit);
  if (cut < limit * 0.5) cut = text.lastIndexOf(". ", limit) + 1;
  if (cut < limit * 0.5) cut = limit;
  const head = text.slice(0, cut).trim();
  const tail = text.slice(cut).trim();
  return (
    <details className={`group ${className}`}>
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        <RichText text={head} />
        <span className="mt-1 inline-block text-sm text-green underline group-open:hidden">Show more</span>
      </summary>
      <RichText text={tail} className="mt-2" />
      <span className="mt-1 inline-block text-sm text-green underline hidden group-open:inline-block">Show less</span>
    </details>
  );
}
