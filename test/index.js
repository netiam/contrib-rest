import User from './models/user'
import Project from './models/project'
import {
  setup,
  teardown
} from './utils/db'

let user

describe('netiam', () => {
  describe('REST', () => {

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
          done()
        })
        .catch(done)
    })

    it('should create a project', done => {
      Project
        .create({
          name: 'awesome'
        })
        .then(project => {
          project.get({plain: true}).should.have.properties([
            'id',
            'name',
            'createdAt',
            'updatedAt'
          ])
          return user.addProject(project)
        })
        .then(() => {
          return user.getProjects()
        })
        .then(projects => {
          projects.length.should.eql(1)
          done()
        })
        .catch(done)
    })

  })
})
