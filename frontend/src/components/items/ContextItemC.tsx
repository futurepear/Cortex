import type { ContextItem } from "../../../../backend/src/models.ts";

interface ContextItemCProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  item: ContextItem;
}

export default function ContextItemC({
  item,
  className = "",
  ...props
}: ContextItemCProps) {
  return (
    <div className={`para-box ${className}`} {...props}>
      
      {/* Title */}
      <div className="font-mono text-fg uppercase tracking-widest text-xs">
        {item.title}
      </div>

      {/* ID */}
      <div className="text-[10px] opacity-40 font-mono">
        #{item.id}
      </div>

      {/* Content */}
      <div className="mt-2 text-sm text-fg-muted leading-snug">
        {item.content}
      </div>

    </div>
  );
}
