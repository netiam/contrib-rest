import Promise from 'bluebird'
import util from 'util'
import Campaign from '../models/campaign'
import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import campaignFixture from '../fixtures/campaign'
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

describe('netiam', () => {
  describe('JSON API - convert', () => {

    before(setup)
    after(teardown)

    it('creates a user and assigns a profile', done => {
      const user = User.create(userFixture)
      const project = Project.create(projectFixture)
      const campaign1 = Campaign.create({name: 'campaign1'})
      const campaign2 = Campaign.create({name: 'campaign2'})
      const profile = Profile.create(profileFixture)

      Promise
        .all([user, project, campaign1, campaign2, profile])
        .then(documents => {
          const [user, project, campaign1, campaign2, profile] = documents
          const userProfileAssoc = user.setProfile(profile)
          const userProjectAssoc = user.addProject(project)
          const userCampaign1Assoc = user.addCampaign(campaign1)
          const userCampaign2Assoc = user.addCampaign(campaign2)

          return Promise.all([
            userProfileAssoc,
            userProjectAssoc,
            userCampaign1Assoc,
            userCampaign2Assoc
          ])
        })
        .then(() => done())
        .catch(done)
    })

    it('queries all users including all associations', done => {
      User
        .findAll({include: [{all: true}]})
        .then(users => {
          const documents = users.map(user => user.toJSON())
          const json = convert({
            documents,
            model: User
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

  })
})
