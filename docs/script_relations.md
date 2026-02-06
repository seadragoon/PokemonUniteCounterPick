# スクリプト関係図

このプロジェクトの主要なスクリプト（コンポーネント、データ、型定義）の依存関係図です。

```mermaid
graph TD
    %% ノード定義
    App[App.tsx]
    
    subgraph Components
        SetComp[components/SetComponent.tsx]
        SetItemComp[components/SetItemComponent.tsx]
        SortablePoke[components/SortablePokemon.tsx]
        PokeImage[components/PokemonImage.tsx]
    end

    subgraph Data
        DataPoke[data/pokemon.ts]
    end

    subgraph Types
        TypeIndex[types/index.ts]
    end

    %% 依存関係
    App -->|imports| SetComp
    App -->|imports| PokeImage
    App -->|imports| DataPoke
    App -->|imports| TypeIndex

    SetComp -->|imports| SetItemComp
    SetComp -->|imports| SortablePoke
    SetComp -->|imports| TypeIndex

    SetItemComp -->|imports| SortablePoke
    SetItemComp -->|imports| TypeIndex

    SortablePoke -->|imports| PokeImage
    SortablePoke -->|imports| TypeIndex

    PokeImage -->|imports| TypeIndex

    DataPoke -->|imports| TypeIndex
```

## 解説

*   **App.tsx**: アプリケーションのエントリーポイント。全体の状態管理とレイアウトを行います。
*   **components/**:
    *   **SetComponent**: 1つの「セット」（ターゲット、有利ポケモンなどのグループ）を表示・管理します。
    *   **SetItemComponent**: セット内の各「項目」（ターゲット、有利など）を表示・管理します。
    *   **SortablePokemon**: ドラッグ&ドロップ可能なポケモンアイコンのラッパーです。
    *   **PokemonImage**: ポケモンの画像を表示する基本コンポーネントです。
*   **data/pokemon.ts**: 全ポケモンの初期データ（名前、ロール、画像パスなど）を定義しています。
*   **types/index.ts**: アプリケーション全体で使用される型定義（Pokemon, Set, Roleなど）が集約されています。
