import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Project = db.define('Profile', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    isUUID: 4,
    defaultValue: Sequelize.UUIDV4()
  }
})

export default Project
