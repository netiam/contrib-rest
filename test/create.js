import request from 'supertest'
import appMock from './utils/app'
import userFixture from './fixtures/user'
import User from './models/user'
import {
  setup,
  teardown
} from './utils/db'
import rest from '../src/rest'

let user

const plugin = rest({model: User})

const app = appMock()

app.post('/users', function(req, res) {
  plugin(req, res)
    .then(() => {
      res.json(res.body)
    })
    .catch(err => {
      res
        .status(500)
        .json(err)
    })
})

describe('netiam', () => {
  describe('REST - create', () => {

    before(setup)
    after(teardown)

    it('should create a user', done => {
      request(app)
        .post('/users')
        .send(userFixture)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
        })
        .end(done)
    })

    it('should create two users', done => {
      const users = [
        Object.assign({}, userFixture, {
          username: 'user1',
          email: 'test1@neti.am'
        }),
        Object.assign({}, userFixture, {
          username: 'user2',
          email: 'test2@neti.am'
        })
      ]
      request(app)
        .post('/users')
        .send(users)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.be.an.Array()
          res.body.should.have.length(2)
          res.body.forEach(document => {
            return document.should.have.properties([
              'id',
              'email',
              'username',
              'birthday',
              'createdAt',
              'updatedAt'
            ])
          })
        })
        .end(done)
    })

  })
})
