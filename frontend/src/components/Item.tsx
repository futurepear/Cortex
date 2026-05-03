import React from "react";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Box({className = "", ...props }: ItemProps) {
  return (
    <div className={`flex flex-col select-none ${className}`} {...props}>
        test div
    </div>
  );
}
