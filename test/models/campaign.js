import Sequelize from 'sequelize'
import {db} from '../utils/db'
import Project from './project'

const Campaign = db.define('Campaign', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING,
    unique: true
  }
})

Campaign.belongsTo(Project, {as: 'project'})

export default Campaign
