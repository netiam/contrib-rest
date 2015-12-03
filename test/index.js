import User from './models/user'
import {
  setup,
  teardown
} from './utils/db'

describe('netiam', () => {
  describe('REST', () => {

    before(setup)
    after(teardown)

    it('should create a user', done => {
      User
        .create({
          username: 'eliias',
          email: 'hannes@impossiblearts.com',
          birthday: new Date(2015, 7, 3)
        })
        .then(user => done())
        .catch(done)
    })

  })
})
