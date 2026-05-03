import React, { useState } from "react";
import Box from "./components/Box";
import RealDataBox from "./components/RealDataBox";
import Item from "./components/items/ItemTemplate";
import { MOCK_DISCORD_DATA } from "../mockdata/mockdata";
import {MOCK_PROMISES} from "../mockdata/mockdata2"

function App() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const getBoxClass = (index: number) =>
    `box-transition ${expandedIndex === index ? "box-expanded" : "box-shrunk"}`;

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* LEFT PANEL */}
      <RealDataBox
        className="h-full w-64 p-4 shrink-0"
        realDataDiscord={MOCK_DISCORD_DATA}
        realDataPromises={MOCK_PROMISES}
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
              <Item />
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
