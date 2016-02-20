import CompositePrimaryKey from '../models/composite-primary-key'
import User from '../models/user'
import userFixture from '../fixtures/user'
import {
  setup,
  teardown
} from '../utils/db'
import {
  ID_SEPARATOR,
  id,
  type,
  idQuery,
  attributes,
  relationships,
  isIncluded,
  setRelationship
} from '../../src/adapters/sequelize'

let user

describe('netiam', () => {
  describe('Adapters - sequelize', () => {

    before(setup)
    after(teardown)

    it('should create user', done => {
      User
        .create(userFixture)
        .then(document => user = document.toJSON())
        .then(() => done())
        .catch(done)
    })

    it('should return type', () => {
      type(User).should.eql('user')
    })

    it('should return attributes for user document', () => {
      const attrs = attributes(User, user)
      attrs.should.be.Object()
      attrs.should.have.properties([
        'email',
        'username',
        'birthday',
        'createdAt',
        'updatedAt'
      ])
    })

    it('should return id from model', () => {
      const value = id(CompositePrimaryKey, {
        firstname: 'hannes',
        lastname: 'moser'
      })
      value.should.eql(`hannes${ID_SEPARATOR}moser`)
    })

    it('should return id query', () => {
      idQuery(CompositePrimaryKey, `abc${ID_SEPARATOR}def`).should.eql({
        firstname: 'abc',
        lastname: 'def'
      })
      idQuery(User, 'abc').should.eql({
        id: 'abc'
      })
    })

    it('should throw error', () => {
      (function() {
        idQuery(CompositePrimaryKey, 'abc')
      }).should.throw();

      (function() {
        idQuery(User, `abc${ID_SEPARATOR}def`)
      }).should.throw()
    })

  })
})
