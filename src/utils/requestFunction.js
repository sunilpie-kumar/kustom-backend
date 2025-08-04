import { decryptAESText } from './cryptographyFunction.js';

export const getBody = (req) => {
  return req.body.body
}

export const verifyRequest = (req) => {
    return req.body.hasOwnProperty('body')
}

export const getAccessKey = (req) => {
  let token = req.headers.authorization?.substr(7)
  let user = decryptAESText(token)
  user = JSON.parse(user);
  let accessKey = user.accessKey;
  if (accessKey) {
    return accessKey
  } else {
    return {}
  }
}

export const getRequestBody = (req) => {
  if (req) {
    try {
      let decryptedBody = decryptAESText(req);
      return JSON.parse(decryptedBody)
    } catch (error) {
      return null
    }
  } else {
    return null;
  }
};