import React from "react";

// Define the props interface, inheriting standard div attributes
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Box({ className = "", ...props }: BoxProps) {
  return (
    <div className={`flex flex-col select-none ${className}`} {...props}>
      <div className="border border-b-0 rounded-t-lg px-2 py-1 text-xs w-fit bg-white">
        tag
      </div>
      <div className="flex-1 border rounded-b-lg rounded-tr-lg px-4 py-3 -mt-px bg-white overflow-hidden">
        test
      </div>
    </div>
  );
}