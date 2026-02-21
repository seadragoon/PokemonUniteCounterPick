import { memo } from 'react';
import { css } from '@linaria/core';
import { Size } from '../constants/cssSize';
import type { RuntimeSet } from '../types';
import { PokemonImage } from './PokemonImage';

interface SetViewComponentProps {
  set: RuntimeSet;
  index: number;
}

const setContainer = css`
  background: rgba(255, 255, 255, 0.98);
  border-radius: ${Size(16)};
  padding: ${Size(20)};
  box-shadow: 0 ${Size(4)} ${Size(12)} rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(${Size(10)});
  margin-bottom: ${Size(20)};
  break-inside: avoid;
  width: 100%;
  box-sizing: border-box;
`;

const setTitle = css`
  font-size: ${Size(19)};
  font-weight: bold;
  color: #333;
  margin: 0 0 ${Size(15)} 0;
  padding-bottom: ${Size(10)};
  border-bottom: ${Size(2)} solid #eee;
`;

const itemContainer = css`
  margin-bottom: ${Size(20)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const itemName = css`
  font-size: ${Size(15)};
  font-weight: 700;
  color: #666;
  margin-bottom: ${Size(8)};
  padding-left: ${Size(4)};
  display: block;
`;

const pokemonList = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${Size(8)};
  background: rgba(102, 126, 234, 0.05);
  padding: ${Size(10)};
  border-radius: ${Size(8)};
`;

const pokemonListLarge = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${Size(10)};
  background: rgba(102, 126, 234, 0.05);
  padding: ${Size(10)};
  border-radius: ${Size(8)};
  align-items: center;
`;

const emptyMessage = css`
  color: #999;
  font-size: ${Size(14)};
  padding: ${Size(5)};
  font-style: italic;
`;

const SetViewComponentInner = ({ set, index }: SetViewComponentProps) => {
  // ポケモンが1匹もいない場合は表示しない
  const hasPokemons = set.items.some((item) => item.pokemons.length > 0);
  if (!hasPokemons) {
    return null;
  }

  const displayName = set.name || `セット${index + 1}`;
  // デフォルトのセット名（セット1, セット2...）の場合は表示しない（詰める）
  const isDefaultSetName = /^セット\d+$/.test(displayName);

  return (
    <div className={setContainer}>
      {!isDefaultSetName && <h3 className={setTitle}>{displayName}</h3>}
      <div>
        {set.items.map((item, itemIndex) => {
          const isFirstItem = itemIndex === 0;
          return (
            <div key={item.id} className={itemContainer}>
              {/* 項目名が「ターゲット」の場合は表示しない（詰める） */}
              {item.name !== 'ターゲット' && (
                <span className={itemName}>{item.name}</span>
              )}
              <div className={isFirstItem ? pokemonListLarge : pokemonList}>
                {item.pokemons.length === 0 ? (
                  <div className={emptyMessage}>ポケモンなし</div>
                ) : (
                  item.pokemons.map((pokemon) => (
                    <PokemonImage
                      key={pokemon.id}
                      pokemon={pokemon}
                      isSelected={false}
                      size={isFirstItem ? 50 : undefined}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SetViewComponent = memo(SetViewComponentInner);
