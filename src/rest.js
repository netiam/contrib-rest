import Promise from 'bluebird'
import {ONE_TO_MANY} from './relationships'
import {
  list,
  create,
  read,
  update,
  remove
} from './resource'

export default function({
  Model,
  idField = 'id',
  idParam = 'id',
  relationship} = {}) {

  return function(req, res) {
    const {method} = req
    let isList = false

    if (!req.params[idParam]) {
      isList = true
    }

    if (relationship && relationship.type === ONE_TO_MANY) {
      if (req[idParam] === relationship.idParam) {
        throw new Error('The relationship "idParam" must not match the base "idParam"')
      }
      if (!req.params[relationship.idParam]) {
        isList = true
      }
    }

    if (method === 'GET' && isList) {
      return list({
        Model,
        relationship,
        req,
        res
      })
    }

    if (method === 'POST') {
      return create({
        Model,
        relationship,
        req,
        res
      })
    }

    if (method === 'GET') {
      return read({
        Model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'HEAD') {
      return read({
        Model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'PATCH' || method === 'PUT') {
      return update({
        Model,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'DELETE') {
      return remove({
        Model,
        idParam,
        relationship,
        req,
        res
      })
    }
  }
}
