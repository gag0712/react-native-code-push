const path = require("path");
const fs = require("fs");
const { parseExpression, parse } = require("@babel/parser");

const OPTIONS_TO_BUNDLE = [
  "bundleHost",
  "runtimeVersion",
  "versioning",
  "updateChecker",
];

module.exports = function (babel) {
  const { types: t } = babel;

  // Load config and imports from `codepush.config.js`
  const { config, configImports, importedIdentifiers } = loadConfig();

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

    // Use identifier for imported symbols instead of inlining
    if (importedIdentifiers.has(value.name)) {
      return t.identifier(value.name);
    }

    // For inline functions, parse and serialize them as expressions
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

  function loadConfig() {
    const configPath = path.resolve(process.cwd(), "codepush.config.js");
    if (!fs.existsSync(configPath)) {
      throw new Error(
        "codepush.config.js not found. Please ensure it exists in the root directory."
      );
    }

    const configModule = require(configPath);

    const configCode = fs.readFileSync(configPath, "utf8");
    const ast = parse(configCode, {
      sourceType: "module",
    });

    // Extract import declarations and track imported identifiers
    const imports = [];
    const importedIdentifiers = new Set();
    ast.program.body.forEach((node) => {
      if (t.isImportDeclaration(node)) {
        imports.push(node);
        node.specifiers.forEach((specifier) => {
          importedIdentifiers.add(specifier.local.name);
        });
      }
    });

    return {
      config: configModule.default || configModule,
      configImports: imports,
      importedIdentifiers,
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

        // Add missing imports from codepush.config.js to the input file
        configImports.forEach((importNode) => {
          if (!existingImports.has(importNode.source.value)) {
            // Clone the import node from codepush.config.js and add it to the input file
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
};
