import React from "react";
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  tag?: string;
  className?: string;
  children?: React.ReactNode;
  noPadding?: boolean;
}

export default function Box({ tag = "", className = "", children, noPadding = false, ...props }: BoxProps) {
  return (
    <div className={`flex flex-col select-none group ${className}`} {...props}>
      {/* 1. THE TAG (Folder Tab) */}
      <div className="flex items-center gap-2 border border-line border-b-0 rounded-t-md px-3 py-1 w-fit bg-bg-2">
        {/* Decorative Dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-cy shadow-[0_0_5px_var(--color-cy)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cy">
          {tag}
        </span>
      </div>

      {/* 2. THE MAIN BODY */}
      <div className="relative flex-1 border border-line rounded-b-md rounded-tr-md bg-bg-2 -mt-px overflow-hidden panel-glow">
        
        {/* Content Padding */}
        <div className={`${noPadding ? "" : "p-4"} h-full`}>
          {children || <DefaultContent />}
        </div>

      </div>
    </div>
  );
}

// Just a placeholder so the box isn't empty
const DefaultContent = () => (
  <div className="flex flex-col gap-2">
    <div className="h-1 w-12 bg-line-2 rounded" />
    <div className="h-1 w-24 bg-line-2 rounded" />
    <div className="mt-4 font-mono text-[10px] text-fg-faint">NO_DATA_LINK</div>
  </div>
);