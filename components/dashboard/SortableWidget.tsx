"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

/** Wraps a dashboard widget so it can be dragged to reorder. The grip appears on
 *  hover and only captures pointer events then, so it never blocks widget UI. */
export function SortableWidget({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/sortable relative">
      <button
        {...attributes}
        {...listeners}
        aria-label="גרור לסידור מחדש"
        className="absolute end-2.5 top-2.5 z-30 grid h-8 w-8 cursor-grab place-items-center rounded-md opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing sm:opacity-0 sm:group-hover/sortable:opacity-100"
        style={{ background: "var(--panel-2)", touchAction: "none" }}
      >
        <GripVertical size={14} style={{ color: "var(--fg-dim)" }} />
      </button>
      {children}
    </div>
  );
}
