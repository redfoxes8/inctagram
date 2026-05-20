export const passwordValidation = {
  required: "Password is required",

  validate: {
    notEmpty: (v: string) => v.trim().length > 0 || "Password cannot be empty spaces",

    minLength: (v: string) => v.length >= 6 || "Minimum number of characters is 6",

    maxLength: (v: string) => v.length <= 20 || "Maximum number of characters is 20",

    hasNumber: (v: string) => /[0-9]/.test(v) || "Must contain at least one number",

    hasUpper: (v: string) => /[A-Z]/.test(v) || "Must contain at least one uppercase letter",

    hasLower: (v: string) => /[a-z]/.test(v) || "Must contain at least one lowercase letter",

    onlyAllowed: (v: string) =>
      /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/.test(v) || "Contains forbidden characters",
  },
} as const

export const confirmPasswordValidation = (password: string) => ({
  required: "Please confirm your password",
  validate: {
    matches: (value: string) => value === password || "Passwords must match",
  },
})
