import { query } from "@anthropic-ai/claude-agent-sdk";

let repository = "/home/ankit/dev/CortexTest";

for await (const message of query ({
    prompt: "Build a small node.js + express task manager webapp in the current directory. include a few intentional bugs. ",
    options: { 
        allowedTools: ["Read", "Edit", "Bash"], 
        cwd: repository,
        model: 'claude-haiku-4-5',
        permissionMode: "bypassPermissions",
        pathToClaudeCodeExecutable: "/home/ankit/.local/bin/claude",
        systemPrompt: `Only work in ${repository} you may not read or write outside ${repository}!`
    },
    
})) {
    if (message.type === "assistant") {
        for (const block of message.message.content) {
            if (block.type === "text") console.log(block.text);
            if (block.type === "tool_use") console.log(block.name, block.input);
        }
    }
    else if (message.type === "result") {
        console.log("Done: ", message);
    }
}