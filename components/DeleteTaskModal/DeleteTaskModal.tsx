"use client";

import { Modal, Button } from "react-bootstrap";

type Props = {
  show: boolean;
  onHide: () => void;
  onDelete: () => void;
  title: string;
  description?: string;
};

const DeleteTaskModal = ({
  show,
  onHide,
  onDelete,
  title,
  description,
}: Props) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the following task?</p>
        <h5>{title}</h5>
        {description && <p className="text-muted">{description}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onDelete();
            onHide();
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTaskModal;
