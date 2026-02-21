import { memo } from 'react';
import { css } from '@linaria/core';
import { Size } from '../constants/cssSize';
import { type Pokemon, Role } from '../types';

interface PokemonImageProps {
  pokemon: Pokemon;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  /** カスタムサイズ (px単位、Sizeに変換される)。省略時はデフォルト40 */
  size?: number;
}

const getRoleColor = (role: Role): string => {
  switch (role) {
    case Role.Attacker:
      return '#ff3700ff'; // オレンジ
    case Role.Defender:
      return '#4caf50'; // 緑
    case Role.Speedster:
      return '#2196f3'; // 青
    case Role.Support:
      return '#ffb700ff'; // 黄色
    case Role.AllRounder:
      return '#9c27b0'; // 紫
    default:
      return '#757575';
  }
};

const imageContainer = css`
  position: relative;
  width: ${Size(40)};
  height: ${Size(40)};
  border-radius: ${Size(10)};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }
`;

const imageContainerDragging = css`
  position: relative;
  width: ${Size(40)};
  height: ${Size(40)};
  border-radius: ${Size(10)};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }

  opacity: 0.5;
  transform: rotate(5deg);
`;

const imageContainerSelected = css`
  position: relative;
  width: ${Size(40)};
  height: ${Size(40)};
  border-radius: ${Size(10)};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  border: ${Size(3)} solid #2196f3;
  box-shadow: 0 0 0 ${Size(3)} rgba(33, 150, 243, 0.3), 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 ${Size(3)} rgba(33, 150, 243, 0.3), 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 ${Size(3)} rgba(33, 150, 243, 0.3), 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 0 ${Size(6)} rgba(33, 150, 243, 0.5), 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
    }
  }
  
  animation: pulse 1.5s ease-in-out infinite;
`;

const image = css`
  position: relative;
  z-index: 1; /* 明示的に高くする */
  width: 95%;
  height: 95%;
  object-fit: cover;
  border-radius: ${Size(12)};
`;

const background = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${Size(12)};
  z-index: 0; /* 明示的に低くする */
`;

const PokemonImageInner = ({
  pokemon,
  isDragging = false,
  isSelected = false,
  onClick,
  size,
}: PokemonImageProps) => {
  const roleColor = getRoleColor(pokemon.role);
  const containerClass = isDragging
    ? imageContainerDragging
    : isSelected
      ? imageContainerSelected
      : imageContainer;

  const sizeStyle = size
    ? { width: Size(size), height: Size(size) }
    : undefined;

  return (
    <div
      className={containerClass}
      style={sizeStyle}
      title={pokemon.name}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div
        className={background}
        style={{ backgroundColor: roleColor }}
      />
      <img
        src={`${import.meta.env.BASE_URL}${pokemon.image.replace(/^\//, '')}`}
        alt={pokemon.name}
        className={image}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
};

// React.memoでメモ化してパフォーマンスを最適化
export const PokemonImage = memo(PokemonImageInner);
