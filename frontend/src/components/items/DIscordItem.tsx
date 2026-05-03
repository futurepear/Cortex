// utils/discordTemplates.tsx
import Box from "../components/Box";
import { DiscordMessage, ForumPost } from "./discordBot"; // your bot file

export const DiscordTemplates = {
  // Template for single messages (e.g. Chat Feed)
  Message: ({ data, className }: { data: DiscordMessage; className?: string }) => (
    <Box id={`msg-${data.id}`} label={`MSG // ${data.author}`} className={className}>
      <div className="text-fg text-xs leading-relaxed">
        {data.content}
      </div>
      <div className="mt-2 font-mono text-[9px] text-fg-faint">
        {new Date(data.createdAt).toLocaleTimeString()}
      </div>
    </Box>
  ),

  // Template for Forum Posts (e.g. Intelligence Reports)
  Forum: ({ data, className }: { data: ForumPost; className?: string }) => (
    <Box id={`forum-${data.threadId}`} label="Intel_Report" className={className}>
      <div className="text-cy text-sm font-bold truncate mb-1">
        {data.title}
      </div>
      <div className="text-fg-dim text-[11px] line-clamp-2 italic">
        "{data.starterMessage?.content.substring(0, 60)}..."
      </div>
      <div className="mt-3 flex justify-between items-center border-t border-line-2 pt-2">
        <span className="text-gn text-[9px] font-mono uppercase">
          {data.messages.length} Commits
        </span>
        <span className="text-fg-faint text-[9px] uppercase">
          ID: {data.threadId.slice(-4)}
        </span>
      </div>
    </Box>
  )
};