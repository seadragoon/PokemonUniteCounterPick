import { useState, useEffect } from 'react';
import { css } from '@linaria/core';
import { Size } from '../../constants/cssSize';
import { ModalBase } from './ModalBase';

interface SetEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    setName: string;
    onRename: (newName: string) => void;
}

const section = css`
  margin-bottom: ${Size(24)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const label = css`
  display: block;
  font-size: ${Size(14)};
  font-weight: 600;
  color: #666;
  margin-bottom: ${Size(8)};
`;

const input = css`
  width: 100%;
  padding: ${Size(10)};
  border: ${Size(1)} solid #ddd;
  border-radius: ${Size(8)};
  font-size: ${Size(16)};
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 ${Size(3)} rgba(102, 126, 234, 0.1);
  }
`;

export function SetEditModal({
    isOpen,
    onClose,
    setName,
    onRename,
}: SetEditModalProps) {
    const [tempName, setTempName] = useState(setName);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempName(setName);
        }
    }, [isOpen, setName]);

    // Handle closing - save rename changes
    const handleClose = () => {
        const trimmedName = tempName.trim();
        if (trimmedName !== setName) {
            onRename(trimmedName);
        }
        onClose();
    };

    return (
        <ModalBase isOpen={isOpen} onClose={handleClose} title="セット設定">
            <div className={section}>
                <label className={label}>セット名を編集</label>
                <input
                    type="text"
                    className={input}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="セット名を入力"
                />
            </div>
        </ModalBase>
    );
}
