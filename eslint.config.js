import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Supabase responses and third-party SDK types are frequently untyped;
      // downgraded to warn to keep CI green while types are incrementally improved.
      "@typescript-eslint/no-explicit-any": "warn",
      // tailwind.config.ts uses require() for the animate plugin — CommonJS interop.
      "@typescript-eslint/no-require-imports": "off",
      // shadcn/ui generates empty interface extends patterns (e.g. TextareaProps, CommandDialogProps).
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
