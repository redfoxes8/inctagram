/** @type {import("stylelint").Config} */
const config = {
  extends: ["stylelint-config-standard"],
  rules: {
    "string-quotes": "single",
    "color-hex-length": "short",
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "keyframes-name-pattern": null,
  },
  ignoreFiles: ["**/node_modules/**", ".next/**", "out/**", "build/**"],
}
export default config
