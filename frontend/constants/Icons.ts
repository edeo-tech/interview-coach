/**
 * Icon Constants - Lucide Icon Mappings
 *
 * Using @expo/vector-icons/Lucide for consistent, rounded outline icons
 * matching modern fintech design patterns
 */

// Tab Icons - Main Navigation
export const TAB_ICONS = {
  home: 'home',                    // House icon
  finances: 'indian-rupee',        // Rupee symbol icon
  pay: 'scan',                     // QR code scanner icon
  invest: 'trending-up',           // Trending upwards graph icon
  explore: 'grid-3x3',             // 4-square grid icon (using 3x3 as closest match)
} as const;

// Common UI Icons
export const UI_ICONS = {
  // Navigation
  back: 'chevron-left',
  forward: 'chevron-right',
  close: 'x',
  menu: 'menu',
  moreVertical: 'more-vertical',
  moreHorizontal: 'more-horizontal',

  // Actions
  add: 'plus',
  remove: 'minus',
  edit: 'edit-2',
  delete: 'trash-2',
  save: 'save',
  download: 'download',
  upload: 'upload',
  share: 'share-2',
  search: 'search',
  filter: 'filter',
  refresh: 'refresh-cw',

  // Status
  check: 'check',
  checkCircle: 'check-circle',
  alert: 'alert-circle',
  info: 'info',
  help: 'help-circle',
  warning: 'alert-triangle',
  error: 'x-circle',

  // Content
  file: 'file-text',
  image: 'image',
  video: 'video',
  document: 'file',
  folder: 'folder',
  calendar: 'calendar',
  clock: 'clock',

  // User
  user: 'user',
  users: 'users',
  userPlus: 'user-plus',
  settings: 'settings',
  logout: 'log-out',
  login: 'log-in',

  // Communication
  message: 'message-circle',
  mail: 'mail',
  phone: 'phone',
  mic: 'mic',
  micOff: 'mic-off',

  // Financial Icons (for future use)
  wallet: 'wallet',
  creditCard: 'credit-card',
  barChart: 'bar-chart-3',
  pieChart: 'pie-chart',
  lineChart: 'line-chart',
  activity: 'activity',
  trendingUp: 'trending-up',
  trendingDown: 'trending-down',
  dollarSign: 'dollar-sign',
} as const;

// Investment/Financial Feature Icons
export const FINANCE_ICONS = {
  // Advisory & Analysis
  advice: 'lightbulb',             // Investment Advice
  shield: 'shield-check',          // Trust/Security
  healthCheck: 'heart-pulse',      // Wealth checkup
  analysis: 'activity',            // Analysis

  // Growth & Performance
  growth: 'trending-up',           // Wealth potential
  chart: 'line-chart',             // Performance tracking
  barChart: 'bar-chart-3',         // Fund performance
  pieChart: 'pie-chart',           // Portfolio distribution

  // Time & Planning
  timer: 'clock',                  // Delay cost calculator
  calendar: 'calendar',            // Time-based planning

  // Announcements & News
  announcement: 'megaphone',       // NFOs (New Fund Offers)
  bell: 'bell',                    // Notifications

  // Navigation
  compass: 'compass',              // Explore
} as const;

// Icon Sizes
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,

  // Semantic sizes
  tab: 24,
  button: 20,
  input: 20,
  card: 24,
  avatar: 40,
} as const;

// Export all icon sets
export const Icons = {
  tab: TAB_ICONS,
  ui: UI_ICONS,
  finance: FINANCE_ICONS,
  sizes: ICON_SIZES,
} as const;

export default Icons;

// Type exports
export type TabIcon = keyof typeof TAB_ICONS;
export type UIIcon = keyof typeof UI_ICONS;
export type FinanceIcon = keyof typeof FINANCE_ICONS;
export type IconSize = keyof typeof ICON_SIZES;
