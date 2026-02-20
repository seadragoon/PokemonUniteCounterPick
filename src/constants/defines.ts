// 定数定義ファイル


// rem単位をpx単位に変換する
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
 * px値からremに変換してrem指定文字列として返却
 *
 * NOTE:
 *  CSS (Emotion) 上で長さを指定するときはこの関数を使い、px などの絶対単位は使用しないでください。
 *  可変サイズ指定したい場合にはVariableSize()関数の使用もできます。
 *
 * @param pixel px値
 * @returns rem指定文字列
 */
export const Size = (px: number): string => {
  return `${PixelToRem(px)}rem`;
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
 * ピクセル指定した可変サイズのrem
 * @param minPx 最小px値
 * @param maxPx 最大px値
 * @returns rem指定文字列
 */
export const VariableSize = (minPx: number, maxPx: number, minWidth: number, maxWidth: number): string => {
  const min = Size(minPx);
  const max = Size(maxPx);
  return `clamp(${min}, calc(${min} + ${maxPx - minPx} * ((100vw - ${Size(minWidth)}) / ${maxWidth - minWidth})), ${max})`;
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
  const weekday = new Intl.DateTimeFormat("ja-JP", {weekday: "short"}).format(date);

  return `${formattedYear}${month}月${day}日（${weekday}）`;
};