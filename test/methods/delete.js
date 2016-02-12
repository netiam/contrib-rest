import request from 'supertest'
import appMock from '../utils/app'
import userFixture from '../fixtures/user'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import rest from '../../src/rest'

let user

const plugin = rest({model: User})

const app = appMock()

app.delete('/users/:id', function(req, res) {
  plugin(req, res)
    .then(() => {
      res.json(res.body)
    })
    .catch(err => {
      console.log(err)
      res
        .status(500)
        .json(err)
    })
})

describe('netiam', () => {
  describe('REST - delete', () => {

    before(setup)
    after(teardown)

    it('should create a user', done => {
      User
        .create({
          username: 'eliias',
          email: 'hannes@impossiblearts.com',
          birthday: new Date(2015, 7, 3)
        })
        .then(document => {
          user = document
          user.get({plain: true}).should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
          done()
        })
        .catch(done)
    })

    it('should delete a user', done => {
      request(app)
        .delete(`/users/${user.id}`)
        .set('Accept', 'application/json')
        .expect(204)
        .expect(res => {
          res.body.should.be.empty()
        })
        .end(done)
    })

  })
})
