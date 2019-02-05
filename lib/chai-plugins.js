'use strict'
// This module ensures test files that require these
// plugins load them in the correct order
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))
