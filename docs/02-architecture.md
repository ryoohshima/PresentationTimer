# 02. アーキテクチャ & 技術スタック

> 出典: RFC §2 を整形し、設計意図を一部補強。

コアロジック（タイマー計算）と型定義を共有しつつ、各プラットフォームに最適化した UI を構築する。

## 技術スタック

| レイヤ | 採用技術 | 役割 |
|---|---|---|
| モノレポ管理 | **Turborepo** | 高速なビルド・キャッシュ管理 |
| パッケージマネージャ | **pnpm**（workspace + catalog） | モノレポとの相性・速度面で推奨。`react`/`react-dom` 等は catalog で全ワークスペース一元管理 |
| モバイル（Android / iOS） | **React Native + Expo**（`expo-router`） | メインターゲット。1コードベースで両 OS・ファイルベースルーティング |
| Web | **React + Vite** | 大画面共有用・管理用（`apps/web`）とプロダクト紹介サイト（`apps/lp`）の 2 アプリ |
| 状態管理 | **React Context + `useReducer`**（`packages/store`） | `apps/mobile` / `apps/web` が共有するタイマーストア。状態更新は `core-logic` へ委譲 |
| 共通言語 | **TypeScript** | ロジック・型をプラットフォーム横断で共有 |

## なぜこの構成か（設計意図）

本アプリの価値の中心は「時間再配分ロジック」という **純粋な計算ロジック** にある。これを UI フレームワークから切り離し、副作用を持たない TypeScript パッケージ（`packages/core-logic`）として隔離することで、モバイル・Web のいずれからも同一ロジックを再利用でき、ユニットテストも UI 非依存で完結する。

型定義（`packages/types`）も同様に共有することで、アジェンダやタイマー状態の構造が全プラットフォームで一致し、プラットフォーム間の実装差異による不整合を防ぐ。Turborepo のキャッシュにより、共有パッケージの変更時も影響範囲のみを再ビルドできる。

状態管理（`packages/store`）は React Context + `useReducer` で実装し、reducer 内の状態更新はすべて `core-logic` の純粋関数（`loadAgenda` / `start` / `tick` / `advanceItem` 等）へ委譲する。UI 層に計算ロジックを一切持たせないことで、`core-logic` の純粋性を保ったまま、状態管理の配線部分だけをプラットフォーム間で共有できる。

## 依存関係の方向

```text
apps/mobile ─┐
             ├─→ packages/store ─→ packages/core-logic ─→ packages/types
apps/web ────┘
```

- `apps/mobile` / `apps/web` は `store` 経由で状態を扱いつつ、`core-logic` の関数（フォーマッタ・セレクタ等）も直接 import する。
- `store` は `core-logic` と `types` に依存する。
- `core-logic` は `types` のみに依存し、UI フレームワークには **依存しない**（純粋 TS）。
- 依存は常に「UI → ストア → ロジック → 型」の一方向で、逆流させない。
- `apps/lp`（プロダクト紹介サイト）はマーケティング用の独立したアプリであり、上記の依存関係には含まれない。

## 関連ドキュメント

- 物理的なディレクトリ配置 → [03. ディレクトリ構成](./03-directory.md)
- 共有される型の中身 → [04. データモデル](./04-data-model.md)
- 共有されるロジックの中身 → [05. コアロジック](./05-core-logic.md)
