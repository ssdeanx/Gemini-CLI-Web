// Ambient module declarations to satisfy editor/TS tooling for ESLint flat-config imports.
// These modules are JS-only in eslint-plugin-react, so we declare them for type resolution.

declare module 'eslint-plugin-react/configs/recommended.js' {
  const config: any;
  export default config;
}


