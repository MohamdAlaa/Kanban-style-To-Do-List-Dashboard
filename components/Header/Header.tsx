"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { setSearch } from "../../stores/tasksSlice";
import { useState } from "react";
import AddEditTaskModal, {
  TaskInput,
} from "../AddEditTaskModal/AddEditTaskModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Task } from "../KanbanBoard/KanbanBoard";

const Header = () => {
  const dispatch = useDispatch();
  const search = useSelector((state: RootState) => state.tasks.search);
  const [show, setShow] = useState(false);

  const queryClient = useQueryClient();
  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, "id" | "order">) => {
      const res = await axios.get<Task[]>(
        `http://localhost:4000/tasks?column=${encodeURIComponent(
          task.column
        )}&_sort=order&_order=asc`
      );
      const lastOrder = res.data.at(-1)?.order ?? 0;
      return axios.post("http://localhost:4000/tasks", {
        ...task,
        order: lastOrder + 1,
      });
    },
    onSuccess: () => {
      // refresh all columns (or just the column you added to)
      ["backlog", "in-progress", "review", "done"].forEach((k) =>
        queryClient.invalidateQueries({ queryKey: ["tasks", k] })
      );
    },
  });

  const handleSave = (task: TaskInput) => {
    addTaskMutation.mutate(task);
  };

  return (
    <header className="mb-4 flex justify-center items-center">
      <input
        type="text"
        className="form-control me-2"
        style={{ maxWidth: 320 }}
        placeholder="Search by task title or description..."
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />
      <button className="btn btn-primary" onClick={() => setShow(true)}>
        Add Task
      </button>
      <AddEditTaskModal
        show={show}
        onHide={() => setShow(false)}
        onSave={handleSave}
      />
    </header>
  );
};

export default Header;
