import {
  HTTPError
} from 'netiam-errors'

export const REST_ERROR = new HTTPError('REST Error.', 500, 'REST_ERROR', 5000)
