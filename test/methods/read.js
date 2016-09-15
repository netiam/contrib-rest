import request from 'supertest'
import appMock from '../utils/app'
import campaignFixture from '../fixtures/campaign'
import componentFixture from '../fixtures/component'
import nodeFixture from '../fixtures/node'
import projectFixture from '../fixtures/project'
import transitionFixture from '../fixtures/transition'
import Campaign from '../models/campaign'
import Component from '../models/component'
import Node from '../models/node'
import Project from '../models/project'
import Transition from '../models/transition'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import rest from '../../src/rest'

let user

const plugin = rest({model: User})
const pluginWithScope = rest({
  model: User,
  scopes: ['defaultScope', 'byEmail']
})

const app = appMock()

app.get('/users', function(req, res) {
  plugin(req, res)
    .then(() => res.json(res.body))
    .catch(err => {
      console.log(err)
      res
        .status(500)
        .json(err)
    })
})

app.get('/users-with-scope', function(req, res) {
  pluginWithScope(req, res)
    .then(() => res.json(res.body))
    .catch(err => {
      console.log(err)
      res
        .status(500)
        .json(err)
    })
})

app.get('/users/:id', function(req, res) {
  plugin(req, res)
    .then(() => res.json(res.body))
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

    it('should return empty list', done => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          const json = res.body

          json.should.be.an.Object()
          json.should.have.properties(['data'])
          json.data.should.be.Array()
          json.data.should.have.length(0)
        })
        .end(done)
    })

    it('should create a user', done => {
      const project = Project.create(projectFixture)
      const campaign = Campaign.create(campaignFixture)
      const node = Node.create(nodeFixture)
      const component = Component.create(componentFixture)
      const transition = Transition.create(transitionFixture)

      Promise
        .all([campaign, node, component, project, transition])
        .then(values => {
          const [campaign, node, component, project, transition] = values
          return User
            .create({
              username: 'eliias',
              email: 'hannes@impossiblearts.com',
              birthday: new Date(2015, 7, 3)
            })
            .then(document => {
              user = document
              user.toJSON().should.have.properties([
                'id',
                'email',
                'username',
                'birthday',
                'createdAt',
                'updatedAt'
              ])

              return Promise.all([
                campaign.setNodes([node]),
                node.setComponents([component]),
                node.setTransitions([transition]),
                user.setCampaigns([campaign]),
                user.setProjects([project])
              ])
            })
        })
        .then(() => done())
        .catch(done)
    })

    it('should get users', done => {
      request(app)
        .get('/users?include=projects')
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
        .get(`/users/${user.id}?include=projects.owner`)
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
          json.included.should.have.length(2)
          json.included[1].type.should.eql('project')
        })
        .end(done)
    })

    it('should get a user and deep nested documents', done => {
      request(app)
        .get(`/users/${user.id}?include=campaigns.nodes.components`)
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
          json.included.should.have.length(3)
          json.included[0].type.should.eql('component')
          json.included[1].type.should.eql('node')
          json.included[2].type.should.eql('campaign')
        })
        .end(done)
    })

    it('should get a user and two nested paths', done => {
      request(app)
        .get(`/users/${user.id}?include=campaigns.nodes.components,campaigns.nodes.transitions`)
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
          json.included.should.have.length(4)
          json.included[0].type.should.eql('component')
          json.included[1].type.should.eql('transition')
          json.included[2].type.should.eql('node')
          json.included[3].type.should.eql('campaign')
        })
        .end(done)
    })

    it('should get users w/ applied scope', done => {
      request(app)
        .get(`/users-with-scope?email=hannes@impossiblearts.com`)
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
        })
        .end(done)
    })

  })
})
