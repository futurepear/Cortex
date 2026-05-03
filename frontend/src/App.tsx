import { useEffect, useState } from "react";
import Box from "./components/Box";
import RealDataBox from "./components/RealDataBox";
import Item from "./components/items/ItemTemplate";
import { MOCK_DISCORD_DATA } from "../mockdata/mockdata";
import {MOCK_OBSERVATIONS} from "../mockdata/mockdata3";

type ContextDoc = {
  id: string;
  title: string;
  content: string;
};

function App() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [promises, setPromises] = useState<any[]>([]);
  const [contextDocs, setContextDocs] = useState<ContextDoc[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/promises")
      .then((res) => res.json())
      .then((data) => setPromises(data))
      .catch((err) => console.error("failed to fetch promises", err));

    fetch("http://localhost:3001/api/context")
      .then((res) => res.json())
      .then((data) => setContextDocs(data))
      .catch((err) => console.error("failed to fetch context", err));
  }, []);


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
      />

      {/* MAIN AREA */}
      <div className="flex flex-1 flex-col min-w-0 pt-2 p-2 gap-2">

        {/* TOP ROW */}
        <div className="flex h-1/2 w-full gap-2">
          <Box
              onDoubleClick={() => setExpandedIndex(0)}
              className={getBoxClass(0)}
              tag = "Analytics"
            >

            </Box>

            <Box
              tag = "Issues"
              onDoubleClick={() => setExpandedIndex(1)}
              className={getBoxClass(1)}
            >
              <Item></Item>
            </Box>

            <Box
              tag = "Context"
              onDoubleClick={() => setExpandedIndex(2)}
              className={getBoxClass(2)}
            >
              <div className="flex h-full flex-col gap-2 overflow-auto">
                {contextDocs.length > 0 ? (
                  contextDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-sm border border-line-2 bg-bg-2/50 p-3"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-widest text-cy">
                        {doc.title}
                      </div>
                      <div className="mt-2 text-[12px] leading-snug text-fg-muted whitespace-pre-wrap">
                        {doc.content.slice(0, 180)}{doc.content.length > 180 ? "..." : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-sm border border-line-2 bg-bg-2/50 p-3 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                    No context loaded yet
                  </div>
                )}
              </div>
            </Box>
        </div>

        {/* BOTTOM BOX */}
        <div className="flex h-1/2 w-[90%] self-center">
          <Box className="w-full" tag = "AI Terminal" />
        </div>

      </div>
    </div>
  );
}

export default App;
