exports.config = {
  mainContract: '0xD64ce8AaDDAF02676BCc4372fF358f119f5DE387',
  loginStoreKey: 'LOGIN_STORE_KEY',
  zeroAddress: '0x0000000000000000000000000000000000000000',
  APP_NAME: 'Product Pricing System',
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
    CLOSE: 2,
    STOP: 3
  },
  SESSION_STATUS_TEXT: {
    0: 'Created',
    1: 'Pricing',
    2: 'Close',
    3: 'Stop'
  },
  sessionBadgeClasses: {
    0: 'success',
    1: 'warning',
    2: 'danger',
    3: 'secondary'
  }
};
