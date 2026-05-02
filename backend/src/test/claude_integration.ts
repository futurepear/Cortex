import { query } from "@anthropic-ai/claude-agent-sdk";

let repository = "/home/ankit/dev/CortexTest";

for await (const message of query ({
    prompt: "Write a small web application that is sophisticated enough for some bugs. Then after that ",
    options: { 
        allowedTools: ["Read", "Edit", "Bash"], 
        cwd: repository,
        model: 'claude-sonnet-4-6',
        permissionMode: "default",
    }
})) {
    console.log(message);
}