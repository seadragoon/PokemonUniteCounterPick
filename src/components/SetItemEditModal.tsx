import React, { useState, useEffect } from 'react';
import { css } from '@linaria/core';
import { ModalBase } from './ModalBase';

interface SetItemEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onAdd: (newItemName: string) => void;
    canDelete: boolean;
}

const section = css`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0px;
  }
`;

const label = css`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
`;

const input = css`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const deleteButton = css`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffebee;
  color: #d32f2f;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background-color: #ffcdd2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f5f5f5;
    color: #999;
  }
`;

const addButton = css`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #e8f5e9;
  color: #2e7d32;
  margin-top: 8px;

  &:hover {
    background-color: #c8e6c9;
  }
`;

export function SetItemEditModal({
    isOpen,
    onClose,
    itemName,
    onRename,
    onDelete,
    onAdd,
    canDelete,
}: SetItemEditModalProps) {
    const [tempName, setTempName] = useState(itemName);
    const [newItemName, setNewItemName] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempName(itemName);
            setNewItemName('');
        }
    }, [isOpen, itemName]);

    // Handle closing - save rename changes
    const handleClose = () => {
        if (tempName.trim() !== itemName) {
            onRename(tempName.trim() || itemName);
        }
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    const handleAdd = () => {
        onAdd(newItemName.trim() || '項目名');
        onClose();
    };

    return (
        <ModalBase isOpen={isOpen} onClose={handleClose} title="項目設定">
            {/* Name Edit Section */}
            <div className={section}>
                <label className={label}>この項目のラベルを編集</label>
                <input
                    type="text"
                    className={input}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="項目名を入力"
                />
            </div>

            {/* Delete Section */}
            <div className={section}>
                <label className={label}>この項目を削除</label>
                <button
                    className={deleteButton}
                    onClick={handleDelete}
                    disabled={!canDelete}
                >
                    削除
                </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

            {/* Add Section */}
            <div className={section}>
                <label className={label}>項目を追加（この下に追加されます）</label>
                <input
                    type="text"
                    className={input}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="新しい項目名（空欄で「項目名」）"
                />
                <button className={addButton} onClick={handleAdd}>
                    追加
                </button>
            </div>
        </ModalBase>
    );
}
