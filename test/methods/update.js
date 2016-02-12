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

const plugin = rest({model: User})

const app = appMock()

app.put('/users/:id', function(req, res) {
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
  describe('REST - update', () => {

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

    it('should create a user w/ ID', done => {
      const modifiedUser = Object.assign({}, userFixture, {
        id: uuid.v4(),
        username: 'uuid',
        email: 'uuid@neti.am'
      })
      request(app)
        .put(`/users/${modifiedUser.id}`)
        .send(modifiedUser)
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
          res.body.username.should.eql('uuid')
          res.body.email.should.eql('uuid@neti.am')
        })
        .end(done)
    })

    it('should update a user', done => {
      const user = Object.assign({}, userFixture, {
        username: 'user1',
        email: 'test1@neti.am'
      })
      request(app)
        .put(`/users/${user.id}`)
        .send(user)
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
          res.body.username.should.eql('user1')
          res.body.email.should.eql('test1@neti.am')
        })
        .end(done)
    })

  })
})
