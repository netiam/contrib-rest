export default function({model, idParam, idField, req, res}) {
  return model.sequelize
    .transaction(transaction => {
      return model
        .findOne({
          where: {
            [idField]: req.params[idParam]
          },
          transaction
        })
        .then(document => document.destroy({transaction}))
        .then(() => res.status(204))
    })
}
