import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "revealing" | "settled" | "zk" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    revealing: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    settled: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    zk: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono",
    outline: "bg-transparent text-gray-400 border-gray-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
