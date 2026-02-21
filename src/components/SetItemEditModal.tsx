import { useState, useEffect } from 'react';
import { css } from '@linaria/core';
import { Size } from '../constants/cssSize';
import { ModalBase } from './ModalBase';
import utils from '../utils';

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

const deleteButton = css`
  width: 100%;
  padding: ${Size(10)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${Size(16)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffcdd2; /* Increased visibility */
  color: #c62828; /* Darker text for contrast */
  margin-top: ${Size(8)};

  &:hover:not(:disabled) {
    background-color: #ef9a9a;
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
  padding: ${Size(10)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${Size(16)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #c8e6c9; /* Increased visibility */
  color: #2e7d32;
  margin-top: ${Size(8)};
  min-width: ${Size(60)};

  &:hover {
    background-color: #a5d6a7;
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

      <hr style={{ border: 'none', borderTop: utils.getFormatText("{0} solid #eee", Size(1)), margin: utils.getFormatText("{0} {1}", Size(20), Size(0)) }} />

      {/* Add Section */}
      <div className={section}>
        <label className={label}>項目を追加（この下に追加されます）</label>
        <div style={{ display: 'flex', gap: Size(8) }}>
          <input
            type="text"
            className={input}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="新しい項目名"
          />
          <button className={addButton} style={{ width: 'auto', marginTop: 0 }} onClick={handleAdd}>
            追加
          </button>
        </div>
      </div>


    </ModalBase>
  );
}
