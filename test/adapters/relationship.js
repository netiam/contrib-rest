import util from 'util'
import CompositePrimaryKey from '../models/composite-primary-key'
import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import Campaign from '../models/campaign'
import Node from '../models/node'
import Component from '../models/component'
import userFixture from '../fixtures/user'
import profileFixture from '../fixtures/profile'
import projectFixture from '../fixtures/project'
import {
  setup,
  teardown
} from '../utils/db'
import {
  setRelationship
} from '../../src/adapters/sequelize'

describe('netiam', () => {
  describe('Adapters - sequelize#relationship', () => {

    before(setup)
    after(teardown)

    it('should create a relationship', done => {
      Promise
        .all([
          Profile.create(profileFixture),
          Project.create(projectFixture)
        ])
        .then(assocations => {
          const [profile, project] = assocations
          return User
            .create(userFixture)
            .then(user => {
              return Promise.all([
                setRelationship({
                  model: User,
                  document: user,
                  path: 'profile',
                  resourceIdentifiers: {
                    id: '10f2f403-01c4-41ae-a3dc-27e9e817fdb8',
                    type: 'profile'
                  }
                }),
                setRelationship({
                  model: User,
                  document: user,
                  path: 'projects',
                  resourceIdentifiers: {
                    id: '0683520a-8a00-4349-b057-93c8fd03f9bb',
                    type: 'project'
                  }
                })
              ])
            })
            .then(() => {
              return User.findOne({
                where: {username: userFixture.username},
                include: [{all: true}]
              })
            })
            .then(user => {
              const json = user.toJSON()
              json.should.be.Object()
              json.should.have.properties([
                'id',
                'email',
                'username',
                'birthday',
                'createdAt',
                'updatedAt',
                'profile',
                'projects'
              ])
              json.email.should.eql('hannes@impossiblearts.com')
              json.username.should.eql('eliias')
              json.profile.should.be.Object()
              json.profile.profileId.should.eql(user.id)
              json.projects.should.be.Array()
              json.projects[0].ownerId.should.eql(user.id)
            })
        })
        .then(() => done())
        .catch(done)
    })

  })
})
