import { css } from '@linaria/core';
import { ModalBase } from './ModalBase';
import { Size } from '../constants/cssSize';

interface OverwriteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeepOwn: () => void;
  onOverwrite: () => void;
}

const messageStyle = css`
  font-size: ${Size(15)};
  color: #555;
  line-height: 1.7;
  text-align: center;
  margin-bottom: ${Size(24)};
`;

const buttonGroup = css`
  display: flex;
  gap: ${Size(12)};
  justify-content: center;
`;

const baseButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${Size(8)};
  padding: ${Size(12)} ${Size(20)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${Size(14)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 ${Size(2)} ${Size(6)} rgba(0, 0, 0, 0.15);
  flex: 1;
  min-width: 0;

  &:hover {
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(10)} rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const keepOwnButton = css`
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #1e88e5, #1565c0);
  }
`;

const overwriteButton = css`
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #e53935, #c62828);
  }
`;

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export function OverwriteConfirmModal({
  isOpen,
  onClose,
  onKeepOwn,
  onOverwrite,
}: OverwriteConfirmModalProps) {
  const handleOverwrite = () => {
    if (window.confirm('保存されていたデータは消えますがよろしいですか？')) {
      onOverwrite();
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="データの読み込み">
      <p className={messageStyle}>
        現在、URLから読み込んだデータを表示しています。<br />
        編集モードに切り替える際、どちらのデータを使用しますか？
      </p>
      <div className={buttonGroup}>
        <button
          className={`${baseButton} ${keepOwnButton}`}
          onClick={onKeepOwn}
        >
          <ShieldIcon />
          自分のデータを利用
        </button>
        <button
          className={`${baseButton} ${overwriteButton}`}
          onClick={handleOverwrite}
        >
          <AlertIcon />
          読み込んだデータで上書き
        </button>
      </div>
    </ModalBase>
  );
}
