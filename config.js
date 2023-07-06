exports.config = {
  mainContract: '0xe64d20D2a9BC3AAFCC863223921ce8AD53054ae6',
  loginStoreKey: 'LOGIN_STORE_KEY',
  zeroAddress: '0x0000000000000000000000000000000000000000',
  APP_NAME: 'Funix Pricing Chain',
  // MAX_OF_PARTICIPANTS: 10,
  MAX_OF_PARTICIPANTS: 4,
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
