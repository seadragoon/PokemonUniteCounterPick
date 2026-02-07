import { css } from '@linaria/core';
import { type Pokemon, Role } from '../types';

interface PokemonImageProps {
  pokemon: Pokemon;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const getRoleColor = (role: Role): string => {
  switch (role) {
    case Role.Attacker:
      return '#ff9800'; // オレンジ
    case Role.Defender:
      return '#4caf50'; // 緑
    case Role.Speedster:
      return '#2196f3'; // 青
    case Role.Support:
      return '#ffeb3b'; // 黄色
    case Role.AllRounder:
      return '#9c27b0'; // 紫
    default:
      return '#757575';
  }
};

const imageContainer = css`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const imageContainerDragging = css`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  opacity: 0.5;
  transform: rotate(5deg);
`;

const imageContainerSelected = css`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  border: 3px solid #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(33, 150, 243, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
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
  border-radius: 12px;
`;

const background = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  z-index: 0; /* 明示的に低くする */
`;

export function PokemonImage({
  pokemon,
  isDragging = false,
  isSelected = false,
  onClick,
}: PokemonImageProps) {
  const roleColor = getRoleColor(pokemon.role);
  const containerClass = isDragging
    ? imageContainerDragging
    : isSelected
      ? imageContainerSelected
      : imageContainer;

  return (
    <div className={containerClass} onClick={onClick}>
      <div
        className={background}
        style={{ backgroundColor: roleColor }}
      />
      <img
        src={pokemon.image}
        alt={pokemon.name}
        className={image}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
