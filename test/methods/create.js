import request from 'supertest'
import util from 'util'
import appMock from '../utils/app'
import profileFixture from '../fixtures/profile'
import projectFixture from '../fixtures/project'
import teamFixture from '../fixtures/team'
import userFixture from '../fixtures/user.jsonapi'
import userWithProfileFixture from '../fixtures/user+profile.jsonapi'
import userWithTeamFixture from '../fixtures/user+team.jsonapi'
import usersFixture from '../fixtures/users.jsonapi'
import Profile from '../models/profile'
import Project from '../models/project'
import Team from '../models/team'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import rest from '../../src/rest'

let user

const plugin = rest({model: User})

const app = appMock()

app.post('/users', function(req, res) {
  plugin(req, res)
    .then(() => res.json(res.body))
    .catch(err => {
      console.log(err.stack)
      res
        .status(500)
        .json(err)
    })
})

describe('netiam', () => {
  describe('REST - create', () => {

    before(setup)
    after(teardown)

    it('should create project', done => {
      Project
        .create(projectFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create profile', done => {
      Profile
        .create(profileFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create team', done => {
      Team
        .create(teamFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create a user', done => {
      request(app)
        .post('/users')
        .set('Content-Type', 'application/vnd.api+json')
        .set('Accept', 'application/vnd.api+json')
        .send(JSON.stringify(userFixture))
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.have.properties(['data', 'included'])
          json.data.should.be.Object()
          json.data.should.have.properties([
            'id',
            'type',
            'attributes'
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
        })
        .end(done)
    })

    it('should create a user w/ profile', done => {
      request(app)
        .post('/users')
        .set('Content-Type', 'application/vnd.api+json')
        .set('Accept', 'application/vnd.api+json')
        .send(JSON.stringify(userWithProfileFixture))
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.have.properties(['data', 'included'])
          json.data.should.be.Object()
          json.data.should.have.properties([
            'id',
            'type',
            'attributes'
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
          json.data.attributes.email.should.eql('test+profile@neti.am')
          json.data.attributes.username.should.eql('user+profile')

          json.data.relationships.should.be.Object()
          json.data.relationships.should.have.properties(['profile'])
          json.data.relationships.profile.should.be.Object()
          json.data.relationships.profile.data.should.be.Object()
          json.data.relationships.profile.data.should.have.properties([
            'id',
            'type'
          ])
          json.data.relationships.profile.data.id.should.be.String()
          json.data.relationships.profile.data.type.should.eql('profile')
        })
        .end(done)
    })

    it('should create a user and assign to team', done => {
      request(app)
        .post('/users')
        .set('Content-Type', 'application/vnd.api+json')
        .set('Accept', 'application/vnd.api+json')
        .send(JSON.stringify(userWithTeamFixture))
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body
          process.exit()
          json.should.have.properties(['data', 'included'])
          json.data.should.be.Object()
          json.data.should.have.properties([
            'id',
            'type',
            'attributes'
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
          json.data.attributes.email.should.eql('test+team@neti.am')
          json.data.attributes.username.should.eql('user+team')

          json.data.relationships.should.be.Object()
          json.data.relationships.should.have.properties(['team'])
        })
        .end(done)
    })

    it('should create two users', done => {
      request(app)
        .post('/users')
        .set('Content-Type', 'application/vnd.api+json')
        .set('Accept', 'application/vnd.api+json')
        .send(JSON.stringify(usersFixture))
        .expect(201)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.be.an.Object()
          json.should.have.properties(['data', 'included'])
          json.data.should.be.Array()
          json.data.should.have.length(2)
          json.data[0].should.be.Object()
          json.data[0].should.have.properties([
            'id',
            'type',
            'attributes'
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
          json.data[1].should.be.Object()
          json.data[1].should.have.properties([
            'id',
            'type',
            'attributes'
          ])
          json.data[1].id.should.be.String()
          json.data[1].id.should.have.length(36)
          json.data[1].type.should.be.String()
          json.data[1].type.should.eql('user')
          json.data[1].attributes.should.be.Object()
          json.data[1].attributes.should.have.properties([
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
