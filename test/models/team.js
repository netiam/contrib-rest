import Sequelize from 'sequelize'
import User from './user'
import {db} from '../utils/db'

const Team = db.define('Team', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    isUUID: 4,
    defaultValue: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING
  }
})

User.belongsTo(Team, {as: 'team'})

export default Team
