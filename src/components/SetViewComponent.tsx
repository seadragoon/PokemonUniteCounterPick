import { memo } from 'react';
import { css } from '@linaria/core';
import type { RuntimeSet } from '../types';
import { PokemonImage } from './PokemonImage';

interface SetViewComponentProps {
  set: RuntimeSet;
  index: number;
}

const setContainer = css`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  break-inside: avoid;
  width: 100%;
  box-sizing: border-box;
`;

const setTitle = css`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
`;

const itemContainer = css`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const itemName = css`
  font-size: 0.95rem;
  font-weight: 700;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
  display: block;
`;

const pokemonList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(102, 126, 234, 0.05);
  padding: 10px;
  border-radius: 8px;
`;

const emptyMessage = css`
  color: #999;
  font-size: 0.85rem;
  padding: 5px;
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
        {set.items.map((item) => (
          <div key={item.id} className={itemContainer}>
            {/* 項目名が「ターゲット」の場合は表示しない（詰める） */}
            {item.name !== 'ターゲット' && (
              <span className={itemName}>{item.name}</span>
            )}
            <div className={pokemonList}>
              {item.pokemons.length === 0 ? (
                <div className={emptyMessage}>ポケモンなし</div>
              ) : (
                item.pokemons.map((pokemon) => (
                  <PokemonImage
                    key={pokemon.id}
                    pokemon={pokemon}
                    isSelected={false}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SetViewComponent = memo(SetViewComponentInner);
