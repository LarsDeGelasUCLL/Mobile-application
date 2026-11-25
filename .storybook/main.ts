import type { StorybookConfig } from "@storybook/react-vite";
import {
  mergeConfig,
  type DepOptimizationOptions,
  type Plugin,
} from "vite";
import { transformAsync } from "@babel/core";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

// `[\\/]`: esbuild passes Windows paths with backslashes.
const REACT_NATIVE_PACKAGE_REGEX =
  /node_modules[\\/](react-native|@react-native|@expo|expo(-[a-z-]+)?)[\\/].*\.js$/;

const babelTransformReactNative = async (
  code: string,
  filename: string,
): Promise<string> => {
  const result = await transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    sourceType: "unambiguous",
    presets: [
      "@babel/preset-flow",
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
  });
  return result?.code ?? code;
};

const WEB_EXTENSIONS = [
  ".web.tsx",
  ".web.ts",
  ".web.js",
  ".tsx",
  ".ts",
  ".mjs",
  ".js",
  ".jsx",
  ".json",
];

// Globals Metro + babel-preset-expo inline in the app; RN/Expo packages read them.
const BUNDLER_GLOBALS = {
  __DEV__: "true",
  "process.env.EXPO_OS": JSON.stringify("web"),
};

// esbuild's plugin type, from the esbuild version Vite ships with.
type EsbuildPlugin = NonNullable<
  NonNullable<DepOptimizationOptions["esbuildOptions"]>["plugins"]
>[number];

const reactNativeVitePlugin: Plugin = {
  name: "react-native-node-modules",
  enforce: "pre",
  async transform(code: string, id: string) {
    if (!REACT_NATIVE_PACKAGE_REGEX.test(id)) return null;
    const transformed = await babelTransformReactNative(code, id);
    return { code: transformed };
  },
};

const reactNativeEsbuildPlugin: EsbuildPlugin = {
  name: "react-native-flow-strip",
  setup(build) {
    build.onLoad({ filter: REACT_NATIVE_PACKAGE_REGEX }, async (args) => {
      // expo-modules-core ships type-only imports here; esbuild rejects them, Rollup only warns.
      if (/ts-declarations[\\/]global\.js$/.test(args.path)) {
        return { contents: "", loader: "js" };
      }
      const code = readFileSync(args.path, "utf8");
      const transformed = await babelTransformReactNative(code, args.path);
      return { contents: transformed, loader: "js" };
    });
  },
};

const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.stories.tsx",
    "../src/features/**/*.stories.tsx",
  ],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (baseConfig) => {
    return mergeConfig(baseConfig, {
      define: BUNDLER_GLOBALS,
      resolve: {
        alias: {
          "react-native": "react-native-web",
          "node:async_hooks": fileURLToPath(
            new URL("./node-async-hooks.ts", import.meta.url),
          ),
        },
        // Prefer platform `.web.*` files, like Metro does for web (expo-modules-core, safe-area-context).
        extensions: WEB_EXTENSIONS,
      },
      plugins: [reactNativeVitePlugin],
      esbuild: {
        jsx: "automatic",
        jsxImportSource: "react",
      },
      optimizeDeps: {
        esbuildOptions: {
          plugins: [reactNativeEsbuildPlugin],
          resolveExtensions: WEB_EXTENSIONS,
          define: BUNDLER_GLOBALS,
          jsx: "automatic",
          jsxImportSource: "react",
        },
      },
    });
  },
};

export default config;
