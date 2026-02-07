import React, { useEffect } from 'react';
import { css } from '@linaria/core';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const overlay = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const modalContainer = css`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const header = css`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const titleStyle = css`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const closeButton = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #999;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const content = css`
  padding: 20px;
`;

import { createPortal } from 'react-dom';

export function ModalBase({ isOpen, onClose, title, children }: ModalBaseProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={modalContainer}>
        <div className={header}>
          <h2 className={titleStyle}>{title}</h2>
          <button className={closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className={content}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
