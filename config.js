exports.config = {
  mainContract: '0xbfF07F46aE3EdfBad3d645219F530f49cCD0d7F4',
  loginStoreKey: 'LOGIN_STORE_KEY',
  zeroAddress: '0x0000000000000000000000000000000000000000',
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
    CLOSE: 3
  },
  SESSION_STATUS_TEXT: {
    0: 'Created',
    1: 'Pricing',
    2: 'Stop',
    3: 'Close'
  }
};
