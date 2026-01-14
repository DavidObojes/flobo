import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import path from "path/win32";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node, 
    parserOptions: {
      //projectService: true,
      tsconfigRootDir: path.resolve(import.meta.dirname, "src"),
    },
  }, 
  rules: {
    'no-console': 'warn',
    'no-var': 'error',
    'semi': ['error', 'always'],
    //'quotes': ['error', 'double'],
    'comma-dangle': ['error', 'always-multiline'],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
  },
    
  },
  
  
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
