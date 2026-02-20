export const Role = {
  Attacker: 0,
  Defender: 1,
  Speedster: 2,
  Support: 3,
  AllRounder: 4,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface Pokemon {
  id: number;
  name: string;
  en_name: string;
  role: Role;
  image: string;
}

export interface SetItem {
  id: string;
  name: string;
  pokemons: Pokemon[];
}

/** 保存対象データ（localStorageやURL共有で使う） */
export interface Set {
  id: string;
  name?: string;
  items: SetItem[];
}

/** 実行時データ（保存データ + 算出されるpool） */
export interface RuntimeSet extends Set {
  pool: Pokemon[];
}
