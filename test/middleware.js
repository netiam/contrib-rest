import request from 'supertest'
import appMock from './utils/app'
import User from './models/user'
import Project from './models/project'
import {
  setup,
  teardown
} from './utils/db'
import rest from '../src/rest'

let user

const plugin = rest({Model: User})

const app = appMock()

app.get('/users/:id', function(req, res) {
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

describe('netiam', () => {
  describe('REST - middleware', () => {

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

    it('should fetch user', done => {
      request(app)
        .get(`/users/${user.id}`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
        })
        .end(done)
    })

    it('should fetch users', done => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.length(1)
          res.body[0].should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt'
          ])
        })
        .end(done)
    })

    it('should fetch user w/ project', done => {
      request(app)
        .get(`/users/${user.id}?include=Project`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt',
            'Projects'
          ])
          res.body.Projects.should.have.length(1)
          res.body.Projects[0].should.have.properties([
            'id',
            'name',
            'createdAt',
            'updatedAt'
          ])
        })
        .end(done)
    })

    it('should fetch users w/ project', done => {
      request(app)
        .get('/users?include=Project')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.length(1)
          res.body[0].should.have.properties([
            'id',
            'email',
            'username',
            'birthday',
            'createdAt',
            'updatedAt',
            'Projects'
          ])
          res.body[0].Projects.should.have.length(1)
          res.body[0].Projects[0].should.have.properties([
            'id',
            'name',
            'createdAt',
            'updatedAt'
          ])
        })
        .end(done)
    })

  })
})
