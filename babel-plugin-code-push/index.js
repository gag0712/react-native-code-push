import path from "path";
import fs from "fs";
import { parseExpression, parse } from "@babel/parser";

const OPTIONS_TO_BUNDLE = [
  "bundleHost",
  "runtimeVersion",
  "versioning",
  "updateChecker",
];

export default async function (babel) {
  const { types: t } = babel;

  const { config, configImports } = await loadConfig();

  // Helper to serialize config values to AST nodes
  function serializeConfigToNode(value) {
    if (
      ["string", "number", "boolean"].includes(typeof value) ||
      value === null
    ) {
      return t.valueToNode(value); // Handle primitive values
    }

    if (Array.isArray(value)) {
      return t.arrayExpression(value.map(serializeConfigToNode)); // Recursively handle arrays
    }

    if (typeof value === "object" && value !== null) {
      return t.objectExpression(
        Object.entries(value).map(([key, val]) =>
          t.objectProperty(t.identifier(key), serializeConfigToNode(val))
        )
      );
    }

    if (typeof value === "function") {
      const valueString = value.toString();
      try {
        return parseExpression(valueString, { sourceType: "module" });
      } catch (error) {
        throw new Error(
          `Failed to parse function ${value.name || "anonymous"}: ${
            error.message
          }`
        );
      }
    }

    throw new Error(`Unsupported config value type: ${typeof value}`);
  }

  async function loadConfig() {
    const configPath = path.resolve(process.cwd(), "codepush.config.mjs");
    if (!fs.existsSync(configPath)) {
      throw new Error(
        "codepush.config.js not found. Please ensure it exists in the root directory."
      );
    }

    const configModule = await import(configPath);

    const configCode = fs.readFileSync(configPath, "utf8");
    const ast = parse(configCode, {
      sourceType: "module",
    });

    // Extract import declarations
    const imports = [];
    ast.program.body.forEach((node) => {
      if (t.isImportDeclaration(node)) {
        imports.push(node);
      }
    });

    return {
      config: configModule.default || configModule,
      configImports: imports,
    };
  }

  return {
    visitor: {
      Program(path) {
        // Track imports in the input file to avoid duplicates
        const existingImports = new Set();
        path.traverse({
          ImportDeclaration(importPath) {
            existingImports.add(importPath.node.source.value);
          },
        });

        // Add missing imports from config.js to the input file
        configImports.forEach((importNode) => {
          if (!existingImports.has(importNode.source.value)) {
            // Clone the import node from config.js and add it to the input file
            path.node.body.unshift(t.cloneNode(importNode));
          }
        });
      },
      ImportDeclaration(path, state) {
        if (
          path.node.source.value.includes("@bravemobile/react-native-code-push")
        ) {
          const defaultImport = path.node.specifiers.find((specifier) =>
            t.isImportDefaultSpecifier(specifier)
          );

          // Save the imported name (e.g., "codePush") for later use
          if (defaultImport) {
            state.file.metadata.codePushImportName = defaultImport.local.name;
          }
        }
      },
      CallExpression(path, state) {
        const codePushImportName = state.file.metadata.codePushImportName;
        if (!codePushImportName) return;

        // Check if the current CallExpression is a call to the codePush function
        if (t.isIdentifier(path.node.callee, { name: codePushImportName })) {
          // Create an AST object representation of the configuration options to bundle
          const configObjectExpression = t.objectExpression(
            OPTIONS_TO_BUNDLE.map((key) =>
              t.objectProperty(
                t.identifier(key),
                serializeConfigToNode(config[key])
              )
            )
          );

          // Replace the arguments of codePush with the generated config object
          path.node.arguments = [configObjectExpression];
        }
      },
    },
  };
}
