// Shared loaders for unit tests: run one `.ts` source without a bundler.
import { Buffer } from "node:buffer";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function transpile(filePath, module) {
  const source = fs.readFileSync(filePath, "utf8");
  return ts.transpileModule(source, {
    compilerOptions: { module, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function runCommonJs(filePath, dependencies, globals) {
  const module = { exports: {} };
  vm.runInNewContext(
    transpile(filePath, ts.ModuleKind.CommonJS),
    {
      exports: module.exports,
      module,
      require: (specifier) => {
        if (!(specifier in dependencies)) {
          throw new Error(`Unexpected dependency: ${specifier}`);
        }
        return dependencies[specifier];
      },
      Error,
      URL,
      ...globals,
    },
    { filename: filePath },
  );
  return module.exports;
}

/**
 * Loads a TS source as CommonJS in a vm sandbox. `dependencies` maps each
 * import specifier to a module object; any other import throws. `globals`
 * adds or overrides sandbox globals. The sandbox shares this realm's `Error`
 * (so `instanceof Error` holds both ways) and `URL` (not built into a vm).
 * Other objects it builds have the sandbox's prototypes: compare with `plain`.
 */
export async function loadModule(filePath, dependencies = {}, globals = {}) {
  return runCommonJs(filePath, dependencies, globals);
}

/**
 * Imports a dependency-free TS source as an ES module in this realm, so its
 * objects keep this realm's prototypes and strict `deepEqual` works on them.
 */
export async function importModule(filePath) {
  const output = transpile(filePath, ts.ModuleKind.ES2022);
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

/**
 * Dependencies for a module in `src/services/<domain>/`: the fake Supabase
 * client and the real auth guard built on it.
 */
export function serviceDeps(supabase) {
  return {
    "../supabase": { supabase },
    "../authGuard": runCommonJs(
      "src/services/authGuard.ts",
      { "./supabase": { supabase } },
      {},
    ),
  };
}

/** vm objects have another realm's prototypes; compare them as plain data. */
export const plain = (value) => JSON.parse(JSON.stringify(value));
