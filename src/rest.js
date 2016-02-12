import Promise from 'bluebird'
import Sequelize from 'sequelize'
import {HAS_MANY} from './relationships'
import create from './methods/create'
import read from './methods/read'
import update from './methods/update'
import del from './methods/delete'

export default function({
  model,
  idField = 'id',
  idParam = 'id',
  relationship} = {}) {

  return function(req, res) {
    const {method} = req
    let isList = false

    if (!req.params[idParam]) {
      isList = true
    }

    if (relationship && relationship.type === HAS_MANY) {
      if (req[idParam] === relationship.idParam) {
        throw new Error('The relationship "idParam" must not match the base "idParam"')
      }
      if (!req.params[relationship.idParam]) {
        isList = true
      }
    }

    if (method === 'GET' && isList) {
      return read({
        model,
        relationship,
        req,
        res
      })
    }

    if (method === 'POST') {
      return create({
        model,
        relationship,
        req,
        res
      })
    }

    if (method === 'GET') {
      return read({
        model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'HEAD') {
      return read({
        model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'PATCH' || method === 'PUT') {
      return update({
        model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'DELETE') {
      return del({
        model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }
  }
}
