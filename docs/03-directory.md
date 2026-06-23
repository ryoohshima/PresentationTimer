# 03. ディレクトリ構成 (Monorepo)

> 出典: RFC §3 を整形し、各ディレクトリの責務を補足。

```text
agenda-timer-monorepo/
├── package.json
├── turbo.json                # Turborepo の設定
├── apps/
│   ├── mobile/               # Expo (React Native) アプリ [Android / iOS]
│   │   ├── package.json
│   │   └── App.tsx
│   └── web/                  # Vite + React アプリ [Web ブラウザ用]
│       ├── package.json
│       └── src/
└── packages/
    ├── core-logic/           # タイマー計算・時間再配分などの純粋な JS/TS ロジック
    │   ├── package.json
    │   └── src/
    │       └── timerEngine.ts
    └── types/                # アジェンダやタイマー状態の共通型定義
        ├── package.json
        └── src/
            └── index.ts
```

## 各ディレクトリの責務

### `apps/mobile`（React Native + Expo）
- メインターゲット。Android / iOS を 1 コードベースで提供。
- 発表者の手元端末で動作するフルスクリーンタイマー UI を担う。
- 状態管理と描画に専念し、時間計算は `core-logic` に委譲する。

### `apps/web`（React + Vite）
- 大画面共有用・管理用の Web クライアント。
- 編集 UI や、プロジェクタ等での進捗の大画面表示を担う。

### `packages/core-logic`（純粋ロジック）
- `timerEngine.ts` にタイマーの状態遷移・時間再配分アルゴリズムを実装。
- **UI フレームワークに依存しない純粋関数の集合**とし、副作用を持たない。
- 詳細設計は [05. コアロジック](./05-core-logic.md)。

### `packages/types`（共通型）
- `index.ts` にアジェンダ項目・タイマー状態などの共通型を定義。
- `apps/*` と `core-logic` が共通参照することで、構造の不整合を防ぐ。
- 詳細設計は [04. データモデル](./04-data-model.md)。

## 関連ドキュメント

- 依存方向の図解 → [02. アーキテクチャ](./02-architecture.md#依存関係の方向)
