"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import axios from "axios";
import api from "../../lib/api";
import Column from "../Column/Column";
import { useQueryClient } from "@tanstack/react-query";

export type Task = {
  id: string;
  title: string;
  description: string;
  column: string;
  order: number;
};

const COLUMNS = [
  {
    key: "backlog",
    label: "Backlog",
    headerClass: "bg-blue-500",
    accentClass: "border-blue-500",
  },
  {
    key: "in-progress",
    label: "In Progress",
    headerClass: "bg-orange-500",
    accentClass: "border-orange-500",
  },
  {
    key: "review",
    label: "Review",
    headerClass: "bg-purple-500",
    accentClass: "border-purple-500",
  },
  {
    key: "done",
    label: "Done",
    headerClass: "bg-emerald-500",
    accentClass: "border-emerald-500",
  },
];

const KanbanBoard = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const queryClient = useQueryClient();

  // Helper: parse dnd-kit ids
  const getTaskIdFromDnd = (val: unknown): string | null =>
    typeof val === "string" && val.startsWith("task-") ? val.slice(5) : null;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data?.current as Task | undefined;
    if (!activeData) return;

    const activeTaskId = getTaskIdFromDnd(active.id) ?? activeData.id;
    const sourceColumn = activeData.column;

    const overTaskId = getTaskIdFromDnd(over.id);
    const targetColumn = overTaskId ? sourceColumn : String(over.id);
    if (targetColumn !== sourceColumn) {
      const targetRes = await api.get<Task[]>(
        `/tasks?column=${encodeURIComponent(
          targetColumn
        )}&_sort=order&_order=asc`
      );
      const lastOrder = targetRes.data.at(-1)?.order ?? 0;

      await api.patch(`/tasks/${activeTaskId}`, {
        column: targetColumn,
        order: lastOrder + 1,
      });

      COLUMNS.forEach((c) =>
        queryClient.invalidateQueries({ queryKey: ["tasks", c.key] })
      );
      return;
    }

    const colRes = await api.get<Task[]>(
      `/tasks?column=${encodeURIComponent(sourceColumn)}&_sort=order&_order=asc`
    );
    const colTasks = colRes.data;

    const fromIdx = colTasks.findIndex((t) => t.id === activeTaskId);
    if (fromIdx === -1) return;

    const toIdx =
      overTaskId != null
        ? colTasks.findIndex((t) => t.id === overTaskId)
        : colTasks.length - 1;

    if (toIdx === -1 || toIdx === fromIdx) return;

    const reordered = [...colTasks];
    const [moved] = reordered.splice(fromIdx, 1);

    const insertAt = toIdx >= reordered.length ? reordered.length : toIdx;
    reordered.splice(insertAt, 0, moved);

    await Promise.all(
      reordered.map((t, i) =>
        t.order !== i + 1
          ? api.patch(`/tasks/${t.id}`, { order: i + 1 })
          : Promise.resolve()
      )
    );

    queryClient.invalidateQueries({ queryKey: ["tasks", sourceColumn] });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="row">
        {COLUMNS.map((col) => (
          <Column
            key={col.key}
            title={col.label}
            columnKey={col.key}
            headerClass={col.headerClass}
            accentClass={col.accentClass}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
