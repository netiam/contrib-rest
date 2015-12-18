import request from 'supertest'
import uuid from 'uuid'
import appMock from './utils/app'
import userFixture from './fixtures/user'
import User from './models/user'
import {
  setup,
  teardown
} from './utils/db'
import rest from '../src/rest'

let user

const plugin = rest({Model: User})

const app = appMock()

app.get('/users', function(req, res) {
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

app.get('/users/:id', function(req, res) {
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
  describe('REST - read', () => {

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

    it('should get users', done => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.be.an.Array()
          res.body.should.have.length(1)
          res.body[0].should.have.properties([
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

    it('should get a user by ID', done => {
      request(app)
        .get(`/users/${user.id}`)
        .set('Accept', 'application/json')
        .expect(200)
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

  })
})
