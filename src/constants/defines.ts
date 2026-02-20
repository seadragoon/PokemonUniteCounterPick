// cssSize.ts から純粋関数を re-export（Linaria の css テンプレート内でも使用可能）
export { Size, VariableSize } from './cssSize';

// rem単位をpx単位に変換する（ブラウザAPI依存）
const convertRemToPx = (rem: number): number => {
  let fontSize: string = "16";
  if (typeof getComputedStyle === "function") {
    fontSize = getComputedStyle(document.documentElement).fontSize;
  }
  return rem * parseFloat(fontSize);
};

// px値からremに変換
const PixelToRem = (px: number): number => {
  return parseFloat((px / 16).toFixed(3));
};

/**
 * 実際のpx値を参照（大元がサイズ変更されているかを確認する）
 * ※ どうしてもpx値を参照しないといけない場合に使用（framer-motionの移動値の指定はpx単位）
 *
 * @param px px値
 * @returns 実際のpx値
 */
export const ActualPx = (px: number): number => {
  return convertRemToPx(PixelToRem(px));
};

/**
 * @returns フォントウェイト数値
 */
export const FontWeight = {
  Normal: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  Black: 900
};

/**
 * 指定されたカラーに対してアルファ値を適用し、16進数カラーコードを返す関数
 * @param color ColorDefineから選択されたカラー
 * @param alpha アルファ値（0～1の範囲、1ほど不透明）
 * @returns 16進数カラーコード（アルファ値を含む）
 */
export function alpha(color: string, alpha: number): string {
  // アルファ値の検証
  if (alpha < 0 || alpha > 1) {
    throw new Error("アルファ値は0から1の間である必要があります。");
  }

  // アルファ値を16進数に変換
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");

  // 新しい16進数カラーコードを生成（アルファ値を含む）
  return `${color}${a}`;
}

// フォーマットされた日本語日付文字列に変換する関数
export const formatDateToJapanese = (date: Date): string => {
  const formattedYear = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    era: "short", // 和暦の元号
    year: "numeric" // 年
  }).format(date);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date);

  return `${formattedYear}${month}月${day}日（${weekday}）`;
};