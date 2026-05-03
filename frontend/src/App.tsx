import React, { useState } from "react";
import Box from "./components/Box";

function App() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  // Helper to keep the JSX clean
  const getBoxClass = (index: number) => 
    `box-transition ${expandedIndex === index ? "box-expanded" : "box-shrunk"}`;

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <Box className="h-full w-64 p-4 shrink-0" />
            
      <div className="flex flex-1 flex-col min-w-0 pt-2 p-2 gap-2">
        
        {/* Create three boxes that expande on double click */}
        <div className="flex h-1/2 w-full gap-2">
          {[0, 1, 2].map((i) => (
            <Box 
              key={i}
              onDoubleClick={() => setExpandedIndex(i)}
              className={getBoxClass(i)}
            />
          ))}
        </div>

        <div className="flex h-1/2 w-[90%] self-center">
          <Box className="w-full"/>
        </div>

      </div>
    </div>
  );
}

export default App;