import React from "react";

import type {DiscordMessage} from "../../../../backend/src/integrations/discordBot"

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  message: DiscordMessage;
}

export default function Item({ message, className = "", ...props }: ItemProps) {
  return (
    <div className={`para-box ${className}`} {...props}>
      {/* Header / Meta */}
      <div className="flex justify-between items-baseline mb-2">
        <div className="font-mono text-fg uppercase tracking-widest text-xs font-bold">
          {message.author}
        </div>
        <span className="text-[10px] opacity-40 font-mono">
          {message.id}
        </span>
      </div>

      {/* Message Content */}
      <div className="text-sm leading-relaxed mb-3">
        {message.content}
      </div>

      {/* Footer / Link */}
      <div className="text-[10px] opacity-50 hover:opacity-100 transition-opacity">
        <a href={message.url} target="_blank" rel="noopener noreferrer" className="underline">
          View in Discord
        </a>
      </div>
    </div>
  );
}