import {normalize} from './params'

export function list({Model, req, res}) {
  const query = normalize({req})
  const include = query.include.map(include => {
    return Model.modelManager.getModel(include)
  })
  return Model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include
    })
    .then(documents => {
      res
        .status(200)
        .body = documents.map(document => document.get({plain: true}))
    })
}

export function create({Model, req, res}) {
  const query = normalize({req})
}

export function read({Model, req, res}) {
  const query = normalize({req})
}

export function update({Model, req, res}) {
  const query = normalize({req})
}

export function remove({Model, req, res}) {
  const query = normalize({req})
}
