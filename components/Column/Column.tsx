"use client";

import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import axios from "axios";
import api from "../../lib/api";
import TaskCard from "../TaskCard/TaskCard";
import { Task } from "../KanbanBoard/KanbanBoard";
import { RootState } from "../../stores/store";

const COLUMN_HEIGHT = "calc(100vh - 170px)";
const PAGE_SIZE = 10000;

const fetchColumnTasks = async (column: string, page: number) => {
  const res = await api.get<Task[]>(
    `/tasks?column=${encodeURIComponent(column)}&_sort=order&_order=asc&_page=${page}&_limit=${PAGE_SIZE}`
  );
  return res.data;
};

type ColumnProps = {
  title: string;
  columnKey: string;
  headerClass?: string;
  accentClass?: string;
};

const Column = ({
  title,
  columnKey,
  headerClass,
  accentClass,
}: ColumnProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const search = useSelector((state: RootState) => state.tasks.search);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["tasks", columnKey],
      queryFn: ({ pageParam = 1 }) => fetchColumnTasks(columnKey, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isFetchingNextPage || !hasNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // 1. Flatten all pages, deduplicate by ID (stable for DND).
  const flatPages = data?.pages.flat() ?? [];
  const allTasks = [...new Map(flatPages.map((t) => [t.id, t])).values()];
  // Always use all loaded tasks for SortableContext!
  const itemIds = allTasks.map((t) => `task-${t.id}`);

  // 2. Filter for search—apply to visible cards, not to items; never filter itemIds during DnD!
  const q = search.trim().toLowerCase();
  const filteredTasks =
    q.length > 0
      ? allTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        )
      : allTasks;

  const { setNodeRef: setDropRef } = useDroppable({ id: columnKey });

  return (
    <div className="col" style={{ minWidth: 310 }}>
      <h2
        className={`text-center sticky top-0 text-white py-2 rounded-md mb-2 z-1 ${
          headerClass ?? "bg-gray-400"
        }`}
      >
        {title}
      </h2>
      <div
        ref={(el) => {
          scrollRef.current = el;
          setDropRef(el as HTMLDivElement);
        }}
        style={{
          height: COLUMN_HEIGHT,
          overflowY: "auto",
          background: "#f8f9fa",
          borderRadius: 8,
          padding: "0.5rem",
        }}
        onScroll={handleScroll}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {filteredTasks.length ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                column={task.column}
                order={task.order}
              />
            ))
          ) : (
            <div className="text-center text-muted mt-4">No tasks</div>
          )}
        </SortableContext>
        {isFetchingNextPage && (
          <div className="text-center my-2">Loading more…</div>
        )}
      </div>
    </div>
  );
};

export default Column;
