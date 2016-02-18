import Promise from 'bluebird'
import util from 'util'
import Campaign from '../models/campaign'
import Component from '../models/component'
import Node from '../models/node'
import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import campaignFixture from '../fixtures/campaign'
import componentFixture from '../fixtures/component'
import nodeFixture from '../fixtures/node'
import userFixture from '../fixtures/user'
import profileFixture from '../fixtures/profile'
import projectFixture from '../fixtures/project'

import {
  setup,
  teardown
} from '../utils/db'
import {
  convert
} from '../../src/jsonapi'
import {
  includeQuery
} from '../../src/adapters/sequelize'

describe('netiam', () => {
  describe('JSON API - convert', () => {

    before(setup)
    after(teardown)

    it('creates a user and assigns a profile', done => {
      const user = User.create(userFixture)
      const profile = Profile.create(profileFixture)
      const project = Project.create(projectFixture)
      const campaigns = Campaign.bulkCreate([
        {name: 'campaign1'},
        {name: 'campaign2'}
      ])
      const nodes = Node.bulkCreate([nodeFixture, nodeFixture, nodeFixture])
      const components = Component.bulkCreate([
        nodeFixture,
        nodeFixture,
        nodeFixture,
        nodeFixture
      ])

      Promise
        .all([user, profile, project, campaigns, nodes, components])
        .then(documents => {
          const [user, profile, project, campaigns, nodes, components] = documents
          const userProfileAssoc = user.setProfile(profile)
          const userProjectAssoc = user.addProject(project)
          const userCampaignAssoc = user.setCampaigns(campaigns)
          const campaignNodeAssoc = campaigns.map(campaign => campaign.setNodes(nodes))
          const nodeComponentAssoc = nodes.map(node => node.setComponents(components))

          return Promise.all([
            userProfileAssoc,
            userProjectAssoc,
            userCampaignAssoc,
            campaignNodeAssoc,
            nodeComponentAssoc
          ])
        })
        .then(() => done())
        .catch(done)
    })

    it('queries all users including all associations', done => {
      const includeParam = 'projects,campaigns,profile'
      const include = [{all: true}].concat(includeQuery({
        model: User,
        param: includeParam
      }))

      User
        .findAll({include})
        .then(users => {
          const documents = users.map(user => user.toJSON())
          const json = convert({
            documents,
            model: User,
            include: includeParam
          })
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
            'projects',
            'profile'
          ])
          json.included.should.be.Array()
          json.included.should.have.length(4)
          json.included[0].type.should.eql('campaign')
          json.included[1].type.should.eql('campaign')
          json.included[2].type.should.eql('project')
          json.included[3].type.should.eql('profile')
        })
        .then(() => done())
        .catch(done)
    })

    it('query a single user including all associations', done => {
      User
        .findOne({
          where: {username: 'eliias'},
          include: [
            {all: true},
          ]
        })
        .then(user => {
          const document = user.toJSON()
          const json = convert({
            documents: document,
            model: User,
            include: 'projects,campaigns,profile'
          })
          json.should.have.properties(['data', 'included'])
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
            'projects',
            'profile'
          ])
          json.included.should.be.Array()
          json.included.should.have.length(4)
          json.included[0].type.should.eql('campaign')
          json.included[1].type.should.eql('campaign')
          json.included[2].type.should.eql('project')
          json.included[3].type.should.eql('profile')
        })
        .then(() => done())
        .catch(done)
    })

  })
})
