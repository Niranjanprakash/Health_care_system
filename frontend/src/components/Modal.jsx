import React from 'react';
import './Modal.css';

export default function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-top-bar" />
        <div className="modal-body">
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
