interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Box({ className = "", ...props }: ItemProps) {
  return (
    <div className={`para-box ${className}`} {...props}>
      <div className="font-mono text-fg uppercase tracking-widest text-xs">
        test
      </div>
    </div>
  );
}