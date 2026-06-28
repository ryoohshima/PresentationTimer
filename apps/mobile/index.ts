import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent でルートコンポーネントを AppRegistry に登録する。
// monorepo + hoisted 構成では expo/AppEntry.js の相対 import が壊れるため、
// アプリ側に明示のエントリを置くのが Expo 公式推奨。
registerRootComponent(App);
