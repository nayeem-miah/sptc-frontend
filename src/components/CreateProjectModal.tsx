"use client";

import React, { useState } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    deadline: string;
    status: "Active" | "Completed" | "On Hold";
  }) => void;
  validationError: string;
  setValidationError: (err: string) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  validationError,
  setValidationError
}: CreateProjectModalProps) {
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDeadline, setProjDeadline] = useState("");

  const todayDateString = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projDeadline) {
      setValidationError("Please fill out all required fields.");
      return;
    }

    const selectedDate = new Date(projDeadline);
    const selectedYear = selectedDate.getFullYear();

    if (isNaN(selectedDate.getTime())) {
      setValidationError("Please enter a valid date.");
      return;
    }

    if (selectedYear > 2100) {
      setValidationError("Please select a deadline before year 2100.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setValidationError("Deadline cannot be in the past.");
      return;
    }

    onSubmit({
      name: projName,
      description: projDesc,
      deadline: projDeadline,
      status: "Active"
    });

    // Reset Form
    setProjName("");
    setProjDesc("");
    setProjDeadline("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Create New Project</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {validationError && <div className="alert alert-danger">{validationError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">
              Project Name *
            </label>
            <input
              type="text"
              id="proj-name"
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-desc">
              Description
            </label>
            <textarea
              id="proj-desc"
              className="form-input"
              rows={3}
              placeholder="Summarize the project goals..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-deadline">
              Deadline Date *
            </label>
            <input
              type="date"
              id="proj-deadline"
              className="form-input"
              value={projDeadline}
              onChange={(e) => setProjDeadline(e.target.value)}
              min={todayDateString}
              required
            />
          </div>



          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "auto" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }}>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
