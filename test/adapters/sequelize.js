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
  ID_SEPARATOR,
  idQuery,
  idValue,
  validateIncludePath,
  includeQuery,
  isIncluded,
  setRelationship
} from '../../src/adapters/sequelize'

describe('netiam', () => {
  describe('Adapters - sequelize', () => {

    before(setup)
    after(teardown)

    it('should return idValue from model', () => {
      const value = idValue({
        model: CompositePrimaryKey,
        document: {
          firstname: 'hannes',
          lastname: 'moser'
        }
      })
      value.should.eql(`hannes${ID_SEPARATOR}moser`)
    })

    it('should return idField from primaryKeys', () => {
      idQuery({
        model: CompositePrimaryKey,
        id: `abc${ID_SEPARATOR}def`
      }).should.eql({
        firstname: 'abc',
        lastname: 'def'
      })
      idQuery({
        model: User,
        id: 'abc'
      }).should.eql({
        id: 'abc'
      })
    })

    it('should throw error', () => {
      (function() {
        idQuery({
          model: CompositePrimaryKey,
          id: 'abc'
        })
      }).should.throw();

      (function() {
        idQuery({
          model: User,
          id: `abc${ID_SEPARATOR}def`
        })
      }).should.throw()
    })

    it('should validate include path', () => {
      validateIncludePath({
        model: User,
        path: 'campaigns'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'campaigns.nodes'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'campaigns.nodes.components'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'projects'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'profile'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: ''
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'foo.bar'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'profile.foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'profile.foo.bar'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'components.foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'components.foo.bar'
      }).should.eql(false)
    })

    it('should build an include query', () => {
      includeQuery({
        model: User,
        param: 'profile,projects,campaigns.nodes.components'
      }).should.eql([
        {
          model: Profile,
          as: 'profile'
        },
        {
          model: Project,
          as: 'projects'
        },
        {
          model: Campaign,
          as: 'campaigns',
          include: {
            model: Node,
            as: 'nodes',
            include: {
              model: Component,
              as: 'components'
            }
          }
        }
      ])
    })

    it('should check if path is included', () => {
      isIncluded({
        model: User,
        path: 'profile',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'projects',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns.nodes.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns.nodes',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: '',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)

      isIncluded({
        model: User,
        path: 'nodes',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)

      isIncluded({
        model: User,
        path: 'nodes.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)
      isIncluded({
        model: User,
        path: 'campaigns.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)
    })

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
              json.profile.UserId.should.eql(user.id)
              json.projects.should.be.Array()
              json.projects[0].UserId.should.eql(user.id)
            })
        })
        .then(() => done())
        .catch(done)
    })

  })
})
