"use client";

import { useState } from "react";
import AddEditTaskModal, {
  TaskInput,
} from "../AddEditTaskModal/AddEditTaskModal";
import DeleteTaskModal from "../DeleteTaskModal/DeleteTaskModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import api from "../../lib/api";
import Image from "next/image";

type TaskCardProps = {
  id: string;
  title: string;
  description: string;
  column: string;
  order: number;
};

const TaskCard = ({ id, title, description, column, order }: TaskCardProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  // dnd-kit sortable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `task-${id}`,
      data: { id, title, description, column },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none" as const,
  };

  const editMutation = useMutation({
    mutationFn: (task: TaskInput) =>
      api.put(`/tasks/${id}`, { id, ...task }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`http://localhost:4000/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const handleEditSave = (task: TaskInput) => {
    editMutation.mutate(task);
    setShowEdit(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card mb-3"
    >
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm "
            onClick={() => setShowEdit(true)}
            title="Edit"
          >
            <Image src="/edit.svg" alt="edit" width={25} height={25} />
          </button>
          <button
            className="btn btn-sm "
            onClick={() => setShowDelete(true)}
            title="Delete"
          >
            <Image src="/delete.svg" alt="edit" width={25} height={25} />
          </button>
        </div>
        <AddEditTaskModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          onSave={handleEditSave}
          initial={{ title, description, column, order }}
          isEditing
        />
        <DeleteTaskModal
          show={showDelete}
          onHide={() => setShowDelete(false)}
          onDelete={() => deleteMutation.mutate()}
          title={title}
          description={description}
        />
      </div>
    </div>
  );
};

export default TaskCard;
