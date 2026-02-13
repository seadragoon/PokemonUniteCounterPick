export const Role = {
  Attacker: 0,
  Defender: 1,
  Speedster: 2,
  Support: 3,
  AllRounder: 4,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface Pokemon {
  id: string;
  name: string;
  role: Role;
  image: string;
}

export interface SetItem {
  id: string;
  name: string;
  pokemons: Pokemon[];
}

export interface Set {
  id: string;
  name?: string;
  items: SetItem[];
  pool: Pokemon[];
  isPoolOpen: boolean;
}
