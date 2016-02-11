import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import userFixture from '../fixtures/user'
import profileFixture from '../fixtures/profile'
import projectFixture from '../fixtures/project'
import util from 'util'

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
      User
        .create(userFixture)
        .then(user => {
          return Project
            .create(projectFixture)
            .then(project => user.addProject(project))
            .then(() => {
              return Profile
                .create(profileFixture)
                .then(profile => user.setProfile(profile))
            })
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
        })
        .then(() => done())
        .catch(done)
    })

  })
})
