import React from "react";
import type { DiscordMessage } from "../../../backend/src/integrations/discordBot";
import DiscordItem from "./items/DIscordItem";
import type { PromiseItem } from "../../../backend/src/models";
import PromiseItemC from "./items/PromiseItemC";
import type { Observation } from "../../../backend/src/models";
import ObserverationItem from "../components/items/ObservationItem"

interface RealDataBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  realDataDiscord?: DiscordMessage[];
  realDataPromises?: PromiseItem[];
  realDataObservation?: Observation[];
  onDeletePromise?: (id: string) => void;
  onOpenAddPromise?: () => void;
}

export default function RealDataBox({
  className = "",
  children,
  realDataDiscord,
  realDataPromises,
  realDataObservation,
  onDeletePromise,
  onOpenAddPromise,
  ...props
}: RealDataBoxProps) {
  return (
    <div className={`flex flex-col select-none group ${className}`} {...props}>
      
      {/* THE MAIN BODY */}
      <div className="relative flex-1 border border-line rounded-md bg-bg-2 flex flex-col panel-glow overflow-hidden">
        
        {/* 1. TOP TITLE SECTION */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-medium text-fg uppercase tracking-tight">
              Promises
            </span>
            {onOpenAddPromise && (
              <div 
                onClick={onOpenAddPromise}
                aria-label="Add promise"
                className="text-[10px] h-5 w-20 rounded-full border border-cy/60 text-cy flex align-items-center justify-center"
              >
                Add Promise
              </div>
            )}
          </div>
          <div className="h-[1px] w-full bg-line-2 mt-2" />
        </div>

        {/* 2. MAIN CONTENT AREA */}
        <div className="scrollbox px-4 py-4 overflow-hidden">
            {realDataPromises?.toReversed().map(msg => (
              <div key={msg.id} className="flex items-start gap-2 group/promise">
                <PromiseItemC
                  className="text-white flex-1"
                  message={msg}
                />
                {onDeletePromise && (
                  <button
                    onClick={() => onDeletePromise(msg.id)}
                    className="rounded bg-red-950 px-2 py-1 text-[10px] uppercase text-red-200 opacity-0 transition-opacity group-hover/promise:opacity-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* 3. FOOTER SECTION (ONLY EDITED) */}
        <div className="flex-1 px-4 pb-3 mt-auto flex flex-col min-h-0">
          
          {/* Separator Line */}
          <div className="h-[5px] w-full line-2 mb-2" />
          {/* Footer Titles */}
          <div className="flex flex-col mb-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-fg-faint">
              Status_Monitor
            </span>
            <span className="font-mono text-[11px] font-medium text-fg uppercase tracking-tight">
              Real Time Data
            </span>
          </div>

          <div className="h-[2px] w-full bg-line-2 mb-2" />

          {/* SCROLL AREA */}
          <div className="min-h-0 overflow-y-auto w-full scrollbox">
            {realDataObservation?.toReversed().map(msg=> (
              <ObserverationItem 
                key = {msg.source}
                className="text-white"
                observation={msg}
              />
            ))}
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
