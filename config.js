exports.config = {
  mainContract: '0xc1585A12158295F7DD154f0c01144DF6AaA19246',
  loginStoreKey: 'LOGIN_STORE_KEY',
  zeroAddress: '0x0000000000000000000000000000000000000000',
  APP_NAME: 'Funix Pricing Chain',
  MAX_OF_PARTICIPANTS: 10,
  onlyAdminPages: [
    '/participants',
  ],
  color: {
    success: '#4dbd74',
    error: '#d76d77'
  },
  SESSION_STATUS: {
    CREATED: 0,
    PRICING: 1,
    STOP: 2,
  },
  SESSION_STATUS_TEXT: {
    0: 'Created',
    1: 'Pricing',
    2: 'Stop',
  },
  sessionBadgeClasses: {
    0: 'success',
    1: 'warning',
    2: 'danger',
    3: 'secondary'
  }
};
