import Sequelize from 'sequelize'
import {db} from '../utils/db'
import Campaign from './campaign'
import Project from './project'
import Profile from './profile'

const User = db.define('User', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    isUUID: 4,
    defaultValue: Sequelize.UUIDV4
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  birthday: Sequelize.DATE
})

User.hasMany(Campaign, {as: 'campaigns'})
User.hasMany(Project, {as: 'projects'})
User.hasOne(Profile, {as: 'profile'})

Project.belongsTo(User, {as: 'owner'})

export default User
