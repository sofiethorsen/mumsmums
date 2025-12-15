// Simple 'feature flags' that can be enabled locally while developing
export const FEATURE_FLAGS = {
    MENU: false, // Enable menu button in nav
    SEARCH: false, // Enable search button in nav
    LOGIN: false, // Enable login button in nav
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
