import { useEffect, useState } from "react";
import Box from "./components/Box";
import RealDataBox from "./components/RealDataBox";
import ContextItemC from "./components/items/ContextItemC";
import { MOCK_DISCORD_DATA } from "../mockdata/mockdata";
import {MOCK_OBSERVATIONS} from "../mockdata/mockdata3";

function App() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [promises, setPromises] = useState<any[]>([]);
  const [contextDocs, setContextDocs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isPromiseModalOpen, setIsPromiseModalOpen] = useState(false);
  const [promiseTitle, setPromiseTitle] = useState("");
  const [promiseDescription, setPromiseDescription] = useState("");
  const [contextDocId, setContextDocId] = useState("");
  const [terminalPrompt, setTerminalPrompt] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [terminalLoading, setTerminalLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/promises")
      .then((res) => res.json())
      .then((data) => setPromises(data))
      .catch((err) => console.error("failed to fetch promises", err));

    fetch("http://localhost:3001/api/context")
      .then((res) => res.json())
      .then((data) => setContextDocs(data))
      .catch((err) => console.error("failed to fetch context", err));

    fetch("http://localhost:3001/api/issues")
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch((err) => console.error("failed to fetch issues", err));
  }, []);

  const refreshPromises = () => {
    fetch("http://localhost:3001/api/promises")
      .then((res) => res.json())
      .then((data) => setPromises(data))
      .catch((err) => console.error("failed to fetch promises", err));
  };

  const refreshContext = () => {
    fetch("http://localhost:3001/api/context")
      .then((res) => res.json())
      .then((data) => setContextDocs(data))
      .catch((err) => console.error("failed to fetch context", err));
  };

  const handleAddPromise = () => {
    if (!promiseTitle.trim() || !promiseDescription.trim()) return;

    fetch("http://localhost:3001/api/promises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: promiseTitle, description: promiseDescription }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("failed to add promise");
        setPromiseTitle("");
        setPromiseDescription("");
        setIsPromiseModalOpen(false);
        refreshPromises();
      })
      .catch((err) => console.error(err));
  };

  const handleDeletePromise = (id: string) => {
    fetch(`http://localhost:3001/api/promises/${id}`, { method: "DELETE" })
      .then(() => refreshPromises())
      .catch((err) => console.error("failed to delete promise", err));
  };

  const handleAddContext = () => {
    if (!contextDocId.trim()) return;

    fetch("http://localhost:3001/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId: contextDocId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("failed to add context");
        setContextDocId("");
        refreshContext();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteContext = (id: string) => {
    fetch(`http://localhost:3001/api/context/${id}`, { method: "DELETE" })
      .then(() => refreshContext())
      .catch((err) => console.error("failed to delete context", err));
  };

  const handleSendTerminal = () => {
    if (!terminalPrompt.trim()) return;

    setTerminalLoading(true);
    setTerminalOutput("");
    fetch("http://localhost:3001/api/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: terminalPrompt }),
    })
      .then((res) => res.json())
      .then((data) => setTerminalOutput(data.text || JSON.stringify(data, null, 2)))
      .catch((err) => setTerminalOutput(`Error: ${String(err)}`))
      .finally(() => setTerminalLoading(false));
  };


  const getBoxClass = (index: number) =>
    `box-transition ${expandedIndex === index ? "box-expanded" : "box-shrunk"}`;

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* LEFT PANEL */}
      <RealDataBox
        className="h-full w-64 p-4 shrink-0"
        realDataDiscord={MOCK_DISCORD_DATA}
        realDataPromises={promises}
        realDataObservation={MOCK_OBSERVATIONS}
        onDeletePromise={handleDeletePromise}
        onOpenAddPromise={() => setIsPromiseModalOpen(true)}
      />

      {/* MAIN AREA */}
      <div className="flex flex-1 flex-col min-w-0 pt-2 p-2 gap-2">

        {/* TOP ROW */}
        <div className="flex h-1/2 w-full gap-2">
          <Box
            onDoubleClick={() => setExpandedIndex(0)}
            className={getBoxClass(0)}
            tag="Analytics"
            noPadding
          >
            <div className="w-full h-full" onDoubleClick={() => setExpandedIndex(0)}>
              <iframe
                className="w-full h-full"
                src="https://analytics.google.com/analytics/web/"
              />
            </div>
          </Box>


            <Box
              tag = "Issues"
              onDoubleClick={() => setExpandedIndex(1)}
              className={getBoxClass(1)}
            >
              <div className="flex flex-col gap-2 h-full overflow-auto">
                {issues.length > 0 ? (
                  issues.map((issue: any) => (
                    <div
                      key={issue.number}
                      className="p-2 border border-line-2 rounded bg-bg-2/50 hover:bg-bg-2/70 transition-colors cursor-pointer"
                      onClick={() => window.open(issue.url, '_blank')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] uppercase tracking-widest text-cy font-bold truncate">
                            #{issue.number}
                          </div>
                          <div className="text-[11px] text-fg mt-1 line-clamp-2">
                            {issue.title}
                          </div>
                          <div className="text-[9px] text-fg-muted mt-1">
                            {issue.state === "open" ? "🟢 Open" : "🔴 Closed"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-fg-faint">Loading issues...</div>
                )}
              </div>
            </Box>

          <Box
            tag="Context"
            onDoubleClick={() => setExpandedIndex(2)}
            className={getBoxClass(2)}
          >
            <div className="flex h-full flex-col gap-3 overflow-auto">
              <div className="flex gap-2">
                <input
                  value={contextDocId}
                  onChange={(e) => setContextDocId(e.target.value)}
                  placeholder="Google Doc ID"
                  className="flex-1 rounded border border-line-2 bg-bg-2 px-2 py-1 text-sm text-fg"
                />
                <button
                  onClick={handleAddContext}
                  className="rounded bg-cy px-3 py-1 text-xs font-mono uppercase text-bg-2"
                >
                  Add
                </button>
              </div>
              {contextDocs?.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <ContextItemC
                    className="text-white flex-1"
                    item={item}
                  />
                  <button
                    onClick={() => handleDeleteContext(item.id)}
                    className="rounded bg-red-950 px-2 py-1 text-[10px] uppercase text-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Box>
        </div>

        {/* BOTTOM BOX */}
        <div className="flex h-1/2 w-[90%] self-center">
          <Box className="w-full" tag = "AI Terminal">
            <div className="flex h-full flex-col gap-3">
              <div className="flex gap-2">
                <input
                  value={terminalPrompt}
                  onChange={(e) => setTerminalPrompt(e.target.value)}
                  placeholder="Ask Cortex something..."
                  className="flex-1 rounded border border-line-2 bg-bg-2 px-2 py-1 text-sm text-fg"
                />
                <button
                  onClick={handleSendTerminal}
                  className="rounded bg-cy px-3 py-1 text-xs font-mono uppercase text-bg-2"
                >
                  {terminalLoading ? "Running..." : "Send"}
                </button>
              </div>
              <pre className="flex-1 overflow-auto rounded border border-line-2 bg-black/40 p-3 text-xs text-fg-muted whitespace-pre-wrap">
                {terminalOutput || "AI terminal output will appear here."}
              </pre>
            </div>
          </Box>
        </div>

      {isPromiseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsPromiseModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-md border border-line bg-bg-2 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line-2 pb-3">
              <div className="font-mono text-[11px] uppercase tracking-widest text-cy">
                Add Promise
              </div>
              <button
                onClick={() => setIsPromiseModalOpen(false)}
                className="rounded border border-line-2 px-2 py-1 text-[10px] uppercase text-fg-muted"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <input
                value={promiseTitle}
                onChange={(e) => setPromiseTitle(e.target.value)}
                placeholder="Promise title"
                className="rounded border border-line-2 bg-bg px-3 py-2 text-sm text-fg"
              />
              <textarea
                value={promiseDescription}
                onChange={(e) => setPromiseDescription(e.target.value)}
                placeholder="Promise description"
                className="min-h-32 rounded border border-line-2 bg-bg px-3 py-2 text-sm text-fg resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsPromiseModalOpen(false)}
                  className="rounded border border-line-2 px-3 py-2 text-xs uppercase text-fg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPromise}
                  className="rounded bg-cy px-3 py-2 text-xs font-mono uppercase text-bg-2"
                >
                  Save Promise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

export default App;
