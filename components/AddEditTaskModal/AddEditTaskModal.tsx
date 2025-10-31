"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Task } from "../KanbanBoard/KanbanBoard";

export type TaskInput = Omit<Task, "id">;

type Props = {
  show: boolean;
  onHide: () => void;
  onSave: (task: TaskInput) => void;
  initial?: TaskInput;
  isEditing?: boolean;
};

const columnOptions = [
  { value: "backlog", label: "Backlog" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const AddEditTaskModal = ({
  show,
  onHide,
  onSave,
  initial,
  isEditing = false,
}: Props) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [column, setColumn] = useState(initial?.column || "backlog");

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setColumn(initial?.column || "backlog");
  }, [initial, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      column,
      order: initial?.order ?? 0,
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Task" : "Add Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              maxLength={250}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Column</Form.Label>
            <Form.Select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              required
            >
              {columnOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? "Save Changes" : "Add Task"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddEditTaskModal;
