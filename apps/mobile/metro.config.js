const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo so Metro picks up changes in workspace packages
// (Expo デフォルトの watchFolders を保持したまま追記する。上書きすると expo-doctor が警告する)
config.watchFolders = [...config.watchFolders, workspaceRoot];

// Let Metro resolve packages from both the app's and the workspace root's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
