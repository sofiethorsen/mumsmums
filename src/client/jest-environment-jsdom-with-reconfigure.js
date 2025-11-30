const JSDOMEnvironment = require('jest-environment-jsdom').default

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args)
    // Expose jsdom so we can call reconfigure, see: https://github.com/jestjs/jest/issues/5124
    this.global.jsdom = this.dom
  }
}

module.exports = CustomJSDOMEnvironment
