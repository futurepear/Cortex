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
              <Item></Item>
            </Box>

          <Box
            tag="Context"
            onDoubleClick={() => setExpandedIndex(2)}
            className={getBoxClass(2)}
          >
            {contextDocs?.map((item) => (
              <ContextItemC
                key={item.id}
                className="text-white"
                item={item}
              />
            ))}
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
