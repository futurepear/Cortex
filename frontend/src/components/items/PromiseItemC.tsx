import type { PromiseItem } from "../../../../backend/src/models.ts"

interface PromiseItemCProps extends React.HTMLAttributes<HTMLDivElement> {
  message: PromiseItem;
}

export default function PromiseItemC({
  message,
  className = "",
  ...props
}: PromiseItemCProps) {
  return (
    <div
      className={`
        mt-2 p-3 group/item
        max-h-[85px] max-w-full overflow-hidden 
        transition-all duration-300 ease-in-out hover:max-h-[300px]
        border-b border-line-2 rounded-sm bg-bg-2/50
        hover:border-cy/40 hover:shadow-[0_0_10px_rgba(0,243,255,0.05)]
        ${className}
      `}
      {...props}
    >
      {/* Header & ID Row */}
      <div className="flex justify-between items-start mb-1">
        <div className="font-mono text-cy uppercase tracking-widest text-[10px] font-bold">
          {message.title}
        </div>
        <div className="text-[9px] opacity-30 font-mono">
          #{message.id}
        </div>
      </div>

      {/* Content */}
      <div className="text-[12px] leading-snug text-fg-muted mb-2">
        {message.description}
      </div>

      {/* Footer (Revealed/Brightened on hover) */}
      <div className="flex justify-between items-center pt-2 border-t border-line-2/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
        <span className="text-[9px] font-mono opacity-40">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <p
          className="text-[9px] font-mono text-cy underline uppercase tracking-tighter hover:text-fg transition-colors"
        >
          Sources: {message.sources?.join(", ")}
        </p>
      </div>
    </div>
  );
}