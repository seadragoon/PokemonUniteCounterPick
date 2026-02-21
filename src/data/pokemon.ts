import { type Pokemon, Role } from '../types';

/**
 * ポケモンユナイト 全ポケモンデータ
 * Role は https://wikiwiki.jp/poke-unite/種類別 を参照
 * 画像: public/icons/ に配置
 *
 * ID体系: Role別に100番台から連番
 *   Attacker:  101〜
 *   Defender:  201〜
 *   Speedster: 301〜
 *   AllRounder:401〜
 *   Support:   501〜
 */
export const samplePokemons: Pokemon[] = [
  // アタック型 (Attacker) 101〜
  { id: 101, name: 'ピカチュウ', en_name: 'pikachu', role: Role.Attacker, image: '/icons/Pikachu.png' },
  { id: 102, name: 'エースバーン', en_name: 'cinderace', role: Role.Attacker, image: '/icons/Cinderace.png' },
  { id: 103, name: 'エーフィ', en_name: 'espeon', role: Role.Attacker, image: '/icons/Espeon.png' },
  { id: 104, name: 'グレイシア', en_name: 'glaceon', role: Role.Attacker, image: '/icons/Glaceon.png' },
  { id: 105, name: 'グレンアルマ', en_name: 'armarouge', role: Role.Attacker, image: '/icons/Armarouge.png' },
  { id: 106, name: 'ゲッコウガ', en_name: 'greninja', role: Role.Attacker, image: '/icons/Greninja.png' },
  { id: 107, name: 'サーナイト', en_name: 'gardevoir', role: Role.Attacker, image: '/icons/Gardevoir.png' },
  { id: 108, name: 'シャンデラ', en_name: 'chandelure', role: Role.Attacker, image: '/icons/Chandelure.png' },
  { id: 109, name: 'ジュナイパー', en_name: 'decidueye', role: Role.Attacker, image: '/icons/Decidueye.png' },
  { id: 110, name: 'ジュラルドン', en_name: 'duraludon', role: Role.Attacker, image: '/icons/Duraludon.png' },
  { id: 111, name: 'ドラパルト', en_name: 'dragapult', role: Role.Attacker, image: '/icons/Dragapult.png' },
  { id: 112, name: 'ニンフィア', en_name: 'sylveon', role: Role.Attacker, image: '/icons/Sylveon.png' },
  { id: 113, name: 'フシギバナ', en_name: 'venusaur', role: Role.Attacker, image: '/icons/Venusaur.png' },
  { id: 114, name: 'マフォクシー', en_name: 'delphox', role: Role.Attacker, image: '/icons/Delphox.png' },
  { id: 115, name: 'ミュウ', en_name: 'mew', role: Role.Attacker, image: '/icons/Mew.png' },
  { id: 116, name: 'ミュウツー(Y)', en_name: 'mewtwoY', role: Role.Attacker, image: '/icons/MewtwoY.png' },
  { id: 117, name: 'ミライドン', en_name: 'miraidon', role: Role.Attacker, image: '/icons/Miraidon.png' },
  { id: 118, name: 'ラティオス', en_name: 'latios', role: Role.Attacker, image: '/icons/Latios.png' },
  { id: 119, name: 'アローラキュウコン', en_name: 'ninetales', role: Role.Attacker, image: '/icons/Ninetales.png' },
  { id: 120, name: 'アローラライチュウ', en_name: 'raichu', role: Role.Attacker, image: '/icons/Raichu.png' },
  { id: 121, name: 'インテレオン', en_name: 'inteleon', role: Role.Attacker, image: '/icons/Inteleon.png' },
  { id: 122, name: 'ウッウ', en_name: 'cramorant', role: Role.Attacker, image: '/icons/Cramorant.png' },
  // ディフェンス型 (Defender) 201〜
  { id: 201, name: 'イワパレス', en_name: 'crustle', role: Role.Defender, image: '/icons/Crustle.png' },
  { id: 202, name: 'オーロット', en_name: 'trevenant', role: Role.Defender, image: '/icons/Trevenant.png' },
  { id: 203, name: 'カビゴン', en_name: 'snorlax', role: Role.Defender, image: '/icons/Snorlax.png' },
  { id: 204, name: 'カメックス', en_name: 'blastoise', role: Role.Defender, image: '/icons/Blastoise.png' },
  { id: 205, name: 'シャワーズ', en_name: 'vaporeon', role: Role.Defender, image: '/icons/Vaporeon.png' },
  { id: 206, name: 'ヌメルゴン', en_name: 'goodra', role: Role.Defender, image: '/icons/Goodra.png' },
  { id: 207, name: 'ブラッキー', en_name: 'umbreon', role: Role.Defender, image: '/icons/Umbreon.png' },
  { id: 208, name: 'ホウオウ', en_name: 'hoOh', role: Role.Defender, image: '/icons/Ho-Oh.png' },
  { id: 209, name: 'マンムー', en_name: 'mamoswine', role: Role.Defender, image: '/icons/Mamoswine.png' },
  { id: 210, name: 'ヤドラン', en_name: 'slowbro', role: Role.Defender, image: '/icons/Slowbro.png' },
  { id: 211, name: 'ヨクバリス', en_name: 'greedent', role: Role.Defender, image: '/icons/Greedent.png' },
  { id: 212, name: 'ラプラス', en_name: 'lapras', role: Role.Defender, image: '/icons/Lapras.png' },
  // スピード型 (Speedster) 301〜
  { id: 301, name: 'アブソル', en_name: 'absol', role: Role.Speedster, image: '/icons/Absol.png' },
  { id: 302, name: 'ガラルギャロップ', en_name: 'rapidash', role: Role.Speedster, image: '/icons/Rapidash.png' },
  { id: 303, name: 'ゲンガー', en_name: 'gengar', role: Role.Speedster, image: '/icons/Gengar.png' },
  { id: 304, name: 'ゼラオラ', en_name: 'zeraora', role: Role.Speedster, image: '/icons/Zeraora.png' },
  { id: 305, name: 'ゾロアーク', en_name: 'zoroark', role: Role.Speedster, image: '/icons/Zoroark.png' },
  { id: 306, name: 'ダークライ', en_name: 'darkrai', role: Role.Speedster, image: '/icons/Darkrai.png' },
  { id: 307, name: 'ドードリオ', en_name: 'dodrio', role: Role.Speedster, image: '/icons/Dodrio.png' },
  { id: 308, name: 'ニャース', en_name: 'meowth', role: Role.Speedster, image: '/icons/Meowth.png' },
  { id: 309, name: 'ファイアロー', en_name: 'talonflame', role: Role.Speedster, image: '/icons/Talonflame.png' },
  { id: 310, name: 'マスカーニャ', en_name: 'meowscara', role: Role.Speedster, image: '/icons/Meowscarada.png' },
  { id: 311, name: 'リーフィア', en_name: 'leafeon', role: Role.Speedster, image: '/icons/Leafeon.png' },
  { id: 312, name: 'ストライク', en_name: 'scyther', role: Role.Speedster, image: '/icons/Scyther.png' },
  // バランス型 (AllRounder) 401〜
  { id: 401, name: 'アマージョ', en_name: 'tsareena', role: Role.AllRounder, image: '/icons/Tsareena.png' },
  { id: 402, name: 'ウーラオス', en_name: 'urshifu_Single', role: Role.AllRounder, image: '/icons/Urshifu.png' },
  { id: 403, name: 'エンペルト', en_name: 'empoleon', role: Role.AllRounder, image: '/icons/Empoleon.png' },
  { id: 404, name: 'カイリキー', en_name: 'machamp', role: Role.AllRounder, image: '/icons/Machamp.png' },
  { id: 405, name: 'カイリュー', en_name: 'dragonite', role: Role.AllRounder, image: '/icons/Dragonite.png' },
  { id: 406, name: 'ガブリアス', en_name: 'garchomp', role: Role.AllRounder, image: '/icons/Garchomp.png' },
  { id: 407, name: 'ギャラドス', en_name: 'gyarados', role: Role.AllRounder, image: '/icons/Gyarados.png' },
  { id: 408, name: 'ギルガルド', en_name: 'aegislash', role: Role.AllRounder, image: '/icons/Aegislash.png' },
  { id: 409, name: 'ザシアン', en_name: 'zacian', role: Role.AllRounder, image: '/icons/Zacian.png' },
  { id: 410, name: 'スイクン', en_name: 'suicune', role: Role.AllRounder, image: '/icons/Suicune.png' },
  { id: 411, name: 'ソウブレイズ', en_name: 'ceruledge', role: Role.AllRounder, image: '/icons/Ceruledge.png' },
  { id: 412, name: 'タイレーツ', en_name: 'falinks', role: Role.AllRounder, image: '/icons/Falinks.png' },
  { id: 413, name: 'ダダリン', en_name: 'dhelmise', role: Role.AllRounder, image: '/icons/Dhelmise.png' },
  { id: 414, name: 'デカヌチャン', en_name: 'tinkaton', role: Role.AllRounder, image: '/icons/Tinkaton.png' },
  { id: 415, name: 'パーモット', en_name: 'pawmot', role: Role.AllRounder, image: '/icons/Pawmot.png' },
  { id: 416, name: 'バシャーモ', en_name: 'blaziken', role: Role.AllRounder, image: '/icons/Blaziken.png' },
  { id: 417, name: 'ハッサム', en_name: 'scizor', role: Role.AllRounder, image: '/icons/Scizor.png' },
  { id: 418, name: 'バンギラス', en_name: 'tyranitar', role: Role.AllRounder, image: '/icons/Tyranitar.png' },
  { id: 419, name: 'マッシブーン', en_name: 'buzzwole', role: Role.AllRounder, image: '/icons/Buzzwole.png' },
  { id: 420, name: 'マリルリ', en_name: 'azumarill', role: Role.AllRounder, image: '/icons/Azumarill.png' },
  { id: 421, name: 'ミミッキュ', en_name: 'mimikyu', role: Role.AllRounder, image: '/icons/Mimikyu.png' },
  { id: 422, name: 'ミュウツー(X)', en_name: 'mewtwoX', role: Role.AllRounder, image: '/icons/MewtwoX.png' },
  { id: 423, name: 'メタグロス', en_name: 'metagross', role: Role.AllRounder, image: '/icons/Metagross.png' },
  { id: 424, name: 'リザードン', en_name: 'charizard', role: Role.AllRounder, image: '/icons/Charizard.png' },
  { id: 425, name: 'ルカリオ', en_name: 'lucario', role: Role.AllRounder, image: '/icons/Lucario.png' },
  { id: 426, name: 'メガルカリオ', en_name: 'megLucario', role: Role.AllRounder, image: '/icons/Mega-Lucario.png' },
  { id: 427, name: 'ネギガナイト', en_name: 'sirfetch', role: Role.AllRounder, image: '/icons/Sirfetchd.png' },
  { id: 428, name: 'メガリザードンX', en_name: 'megaCharizardX', role: Role.AllRounder, image: '/icons/Mega-Charizard-X.png' },
  { id: 429, name: 'メガリザードンY', en_name: 'megaCharizardY', role: Role.AllRounder, image: '/icons/Mega-Charizard-Y.png' },
  { id: 430, name: 'メガギャラドス', en_name: 'megaGyarados', role: Role.AllRounder, image: '/icons/Mega-Gyarados.png' },
  // サポート型 (Support) 501〜
  { id: 501, name: 'キュワワー', en_name: 'comfey', role: Role.Support, image: '/icons/Comfey.png' },
  { id: 502, name: 'コダック', en_name: 'psyduck', role: Role.Support, image: '/icons/Psyduck.png' },
  { id: 503, name: 'ハピナス', en_name: 'blissey', role: Role.Support, image: '/icons/Blissey.png' },
  { id: 504, name: 'バリヤード', en_name: 'mrMime', role: Role.Support, image: '/icons/Mr.Mime.png' },
  { id: 505, name: 'ピクシー', en_name: 'clefable', role: Role.Support, image: '/icons/Clefable.png' },
  { id: 506, name: 'フーパ', en_name: 'hoopa', role: Role.Support, image: '/icons/Hoopa.png' },
  { id: 507, name: 'プクリン', en_name: 'wigglytuff', role: Role.Support, image: '/icons/Wigglytuff.png' },
  { id: 508, name: 'マホイップ', en_name: 'alcremie', role: Role.Support, image: '/icons/Alcremie.png' },
  { id: 509, name: 'ヤミラミ', en_name: 'sableye', role: Role.Support, image: '/icons/Sableye.png' },
  { id: 510, name: 'ラティアス', en_name: 'latias', role: Role.Support, image: '/icons/Latias.png' },
  { id: 511, name: 'ワタシラガ', en_name: 'eldegoss', role: Role.Support, image: '/icons/Eldegoss.png' },
];
