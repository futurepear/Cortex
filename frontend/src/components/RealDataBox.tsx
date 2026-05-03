import React from "react";
import type { DiscordMessage } from "../../../backend/src/integrations/discordBot";
import DiscordItem from "./items/DiscordItem";
import type { PromiseItem } from "../../../backend/src/models";
import PromiseItemC from "./items/PromiseItemC";

interface RealDataBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  realDataDiscord?: DiscordMessage[];
  realDataPromises?: PromiseItem[];
}

export default function RealDataBox({
  className = "",
  children,
  realDataDiscord,
  realDataPromises,
  ...props
}: RealDataBoxProps) {
  return (
    <div className={`flex flex-col select-none group ${className}`} {...props}>
      
      {/* THE MAIN BODY */}
      <div className="relative flex-1 border border-line rounded-md bg-bg-2 flex flex-col panel-glow overflow-hidden">
        
        {/* 1. TOP TITLE SECTION */}
        <div className="px-4 pt-3">
          <span className="font-mono text-[11px] font-medium text-fg uppercase tracking-tight">
            Promises
          </span>
          <div className="h-[1px] w-full bg-line-2 mt-2" />
        </div>

        {/* 2. MAIN CONTENT AREA */}
        <div className="px-4 py-4 h-3/10 overflow-hidden">
            {realDataPromises?.toReversed().map(msg => (
              <PromiseItemC
                key={msg.id}
                className="text-white"
                message={msg}
              />
            ))}
        </div>

        {/* 3. FOOTER SECTION (ONLY EDITED) */}
        <div className="flex-1 px-4 pb-3 mt-auto flex flex-col min-h-0">
          
          {/* Separator Line */}
          <div className="h-[1px] w-full bg-line-2 mb-2" />
          
          {/* Footer Titles */}
          <div className="flex flex-col mb-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-fg-faint">
              Status_Monitor
            </span>
            <span className="font-mono text-[11px] font-medium text-fg uppercase tracking-tight">
              Real Time Data
            </span>
          </div>

          {/* SCROLL AREA */}
          <div className="min-h-0 overflow-y-auto w-full scrollbox">
            {realDataDiscord?.toReversed().map(msg => (
              <DiscordItem
                key={msg.id}
                className="text-white"
                message={msg}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
