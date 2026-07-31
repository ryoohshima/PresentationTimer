# 03. ディレクトリ構成 (Monorepo)

> 出典: RFC §3 を整形し、各ディレクトリの責務を補足。実装状況に合わせて更新。

```text
presentation-timer-monorepo/
├── package.json
├── turbo.json                # Turborepo の設定
├── apps/
│   ├── mobile/                # Expo (React Native) アプリ [Android / iOS / Web]
│   │   ├── package.json
│   │   ├── app.json
│   │   ├── app/                # expo-router のファイルベースルーティング
│   │   │   ├── _layout.tsx     # 共通レイアウト（TimerProvider・永続化フックを設置）
│   │   │   ├── index.tsx       # ① アジェンダ編集
│   │   │   ├── timer.tsx       # ② タイマー実行（フルスクリーン）
│   │   │   └── settings.tsx    # ③ 設定（モーダル）
│   │   ├── components/         # 画面共通の UI パーツ
│   │   ├── hooks/               # useDragReorder / useTimerTick / useAgendaPersistence 等
│   │   └── constants/           # テーマ・配色
│   ├── web/                    # Vite + React アプリ [Web ブラウザ用]
│   │   ├── package.json
│   │   └── src/
│   │       ├── App.tsx
│   │       └── store/           # @presentation-timer/store への再エクスポート
│   └── lp/                     # Vite + React 製ランディングページ（プロダクト紹介サイト）
│       ├── package.json
│       └── src/
│           ├── App.tsx
│           └── components/
└── packages/
    ├── core-logic/             # タイマー計算・時間再配分などの純粋な JS/TS ロジック
    │   ├── package.json
    │   └── src/
    │       ├── timerEngine.ts
    │       └── timeFormat.ts
    ├── store/                  # apps/mobile・apps/web が共有するタイマーストア
    │   ├── package.json
    │   └── src/
    │       ├── useTimerStore.ts
    │       └── TimerProvider.tsx
    └── types/                  # アジェンダやタイマー状態の共通型定義
        ├── package.json
        └── src/
            └── index.ts
```

## 各ディレクトリの責務

### `apps/mobile`（React Native + Expo）
- メインターゲット。Android / iOS / Web（デバッグ用）を 1 コードベースで提供。
- `expo-router` によるファイルベースルーティングで、発表者の手元端末で動作するフルスクリーンタイマー UI を担う。
- 状態管理と描画に専念し、時間計算は `core-logic` へ、状態更新は `store` へ委譲する。
- アジェンダはアプリ再起動後も復元される（`hooks/useAgendaPersistence`）。

### `apps/web`（React + Vite）
- 大画面共有用・管理用の Web クライアント。
- 編集 UI や、プロジェクタ等での進捗の大画面表示を担う。
- 現状はサンプルデータを表示するだけの PoC 段階（[07. ロードマップ](./07-roadmap.md) Phase 3 で本格実装予定）。

### `apps/lp`（React + Vite）
- プロダクト紹介用のランディングページ。マーケティングサイトであり、`core-logic` / `store` / `types` には依存しない独立したアプリ。

### `packages/core-logic`（純粋ロジック）
- `timerEngine.ts` にタイマーの状態遷移・時間再配分アルゴリズムを実装。
- `timeFormat.ts` に秒数 ⇔ `MM:SS` 表記の変換ユーティリティを実装。
- **UI フレームワークに依存しない純粋関数の集合**とし、副作用を持たない。
- 詳細設計は [05. コアロジック](./05-core-logic.md)。

### `packages/store`（状態管理）
- `useTimerStore.ts` に React Context + `useReducer` ベースのグローバルストアを実装。状態更新はすべて `core-logic` の関数へ委譲する。
- `TimerProvider.tsx` でルートに配置し、子コンポーネントへ状態と dispatch を提供する。
- `apps/mobile` と `apps/web` の双方から参照される。

### `packages/types`（共通型）
- `index.ts` にアジェンダ項目・タイマー状態などの共通型を定義。
- `apps/*` と `core-logic` / `store` が共通参照することで、構造の不整合を防ぐ。
- 詳細設計は [04. データモデル](./04-data-model.md)。

## 関連ドキュメント

- 依存方向の図解 → [02. アーキテクチャ](./02-architecture.md#依存関係の方向)
