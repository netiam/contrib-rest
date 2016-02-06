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
  from,
  to
} from '../../src/ds'

describe('netiam', () => {
  describe('DS - transform', () => {

    before(setup)
    after(teardown)

    it('creates a user and transforms into internal representation', done => {
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
                .then(() => from({documents: user}))
                .then(data => console.log(util.inspect(data, {depth: null})))
            })
        })
        .then(() => done())
        .catch(done)
    })

  })
})
