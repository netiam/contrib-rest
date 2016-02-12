import request from 'supertest'
import uuid from 'uuid'
import util from 'util'
import appMock from '../utils/app'
import projectFixture from '../fixtures/project'
import userFixture from '../fixtures/user'
import Project from '../models/project'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import rest from '../../src/rest'

let user

const plugin = rest({model: User})

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

          return Project
            .create(projectFixture)
            .then(document => user.setProjects([document]))
        })
        .then(() => done())
        .catch(done)
    })

    it('should get users', done => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.be.an.Object()
          json.should.have.properties(['data', 'included'])
          json.data.should.be.Array()
          json.data.should.have.length(1)
          json.data[0].should.be.Object()
          json.data[0].should.have.properties([
            'id',
            'type',
            'attributes',
            'relationships'
          ])
          json.data[0].id.should.be.String()
          json.data[0].id.should.have.length(36)
          json.data[0].type.should.be.String()
          json.data[0].type.should.eql('user')
          json.data[0].attributes.should.be.Object()
          json.data[0].attributes.should.have.properties([
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
          json.data[0].attributes.email.should.eql('hannes@impossiblearts.com')
          json.data[0].attributes.username.should.eql('eliias')
          json.data[0].relationships.should.be.Object()
          json.data[0].relationships.should.have.properties([
            'campaigns',
            'projects'
          ])
          json.included.should.be.Array()
          json.included.should.have.length(1)
          json.included[0].type.should.eql('project')
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
          json.data.attributes.username.should.eql('eliias')
          json.data.relationships.should.be.Object()
          json.data.relationships.should.have.properties([
            'campaigns',
            'projects'
          ])
          json.included.should.be.Array()
          json.included.should.have.length(1)
          json.included[0].type.should.eql('project')
        })
        .end(done)
    })

  })
})
