import React from "react";
import type { DiscordMessage } from "../../../backend/src/integrations/discordBot";

interface RealDataBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  realDataDiscord?: DiscordMessage[];
}

export default function Box({ className = "", children, realDataDiscord, ...props }: RealDataBoxProps) {
  return (
    <div className={`flex flex-col select-none group ${className}`} {...props}>
      {/* THE MAIN BODY */}
      <div className="relative flex-1 border border-line rounded-md bg-bg-2 flex flex-col panel-glow overflow-hidden">
        
        {/* 1. TOP TITLE SECTION */}
        <div className="px-4 pt-3">
          <span className="font-sans text-[11px] font-medium text-fg uppercase tracking-tight">
            Promises
          </span>
          {/* Optional: Add a subtle line under the top title to match the footer style */}
          <div className="h-[1px] w-full bg-line-2 mt-2" />
        </div>

        {/* 2. MAIN CONTENT AREA */}
        <div className="px-4 py-4 h-3/10 overflow-hidden">
        </div>

        {/* 3. THE FOOTER SECTION */}
        <div className="flex-1 px-4 pb-3 mt-auto">
          {/* Separator Line */}
          <div className="h-[1px] w-full bg-line-2 mb-2" />
          
          {/* Footer Title */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-fg-faint">
              Status_Monitor
            </span>
            <span className="font-sans text-[11px] font-medium text-fg uppercase tracking-tight">
              Real Time Data
            </span>
              {realDataDiscord?.map(msg => (
                <div key={msg.id} className="text-[10px] text-fg-dim">
                  {msg.author}: {msg.content}
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const DefaultContent = () => (
  <div className="flex flex-col gap-2">
    <div className="h-1 w-12 bg-line-2 rounded" />
    <div className="h-1 w-24 bg-line-2 rounded" />
    <div className="mt-4 font-mono text-[10px] text-fg-faint uppercase">Ready_for_input</div>
  </div>
);