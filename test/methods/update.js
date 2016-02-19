import request from 'supertest'
import uuid from 'uuid'
import appMock from '../utils/app'
import userFixture from '../fixtures/user'
import userUpdateFixture from '../fixtures/user-update.jsonapi'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import rest from '../../src/rest'

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
        .create(userFixture)
        .then(user => {
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

    it('should update a user', done => {
      request(app)
        .put(`/users/${userUpdateFixture.data.id}`)
        .send(JSON.stringify(userUpdateFixture))
        .set('Accept', 'application/vnd.api+json')
        .set('Content-Type', 'application/vnd.api+json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.have.properties(['data', 'included'])
          json.data.should.be.Object()
          json.data.should.be.Object()
          json.data.should.have.properties([
            'id',
            'type',
            'attributes',
            'relationships'
          ])
          json.data.id.should.be.String()
          json.data.id.should.have.length(36)
          json.data.type.should.be.String()
          json.data.type.should.eql('user')
          json.data.attributes.should.be.Object()
          json.data.attributes.should.have.properties([
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
          json.data.attributes.email.should.eql('hannes@impossiblearts.com')
          json.data.attributes.username.should.eql('hello new username')
          json.data.relationships.should.be.Object()
          json.data.relationships.should.have.properties([
            'campaigns',
            'projects'
          ])
        })
        .end(done)
    })

  })
})
