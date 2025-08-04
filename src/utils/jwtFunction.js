
import constVariable from './constantVariables.js';
import jwt from 'jsonwebtoken';
import { decryptAESText, encryptAESText } from "./cryptographyFunction.js";
import { getBody, getRequestBody } from "./requestFunction.js";
import { generateDML, generateResponse } from "./responseFunction.js";


export const generateToken = (data) => {
  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (150 * 60),
    data: JSON.stringify(data)
  }, constVariable.JWT.SECRETKEY);
};

export const getRefreshTokenData = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, constVariable.JWT.SECRETKEY, (err, decoded) => {
      if (!err) {
        resolve(decoded);
      } else {
        reject({});
      }
    });
  });
};

export const verifyJWTToken = (request) => {
  return new Promise((resolve, reject) => {
    if (request.url !== "/335ace3d9669d7bf245478eebca6b4da"
      && request.url !== "/789c9c09df1a9681af9e1ddc5bbdaf73"
      && request.url !== "/06d087202e767a903a2bafa55ab522af"
      && request.url !== "/50da8851a209603f821712a8f1badceae39778a5ab4209d651622cabba71e5fa"
      && request.url !== "/8a8343e77e49f0b85b963a31a72f2d27af02acafe5ffad1b40e3a61bd85864f8"
      && request.url !== "/4f84e2da9aba4bc009d6694ae2a49eae281905a3456234010bf35e40fa5f5890"
    ) {
      try {
        if (request?.headers?.authorization) {
          let tokenString = request.headers.authorization.substr(7);
          let userSplit = tokenString.split("/");
          if (userSplit[0] && userSplit[1]) {
            if (getUserIDAccessKey(request, userSplit[0])) {
              let token = userSplit[1];
              jwt.verify(token, constVariable.JWT.SECRETKEY, (err, decoded) => {
                if (decoded) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            } else {
              reject("Invalid Authorization")
            }
          } else {
            reject("Please provide the Authorization")
          }
        } else {
          reject("Please provide the Authorization")
        }
      } catch (error) {
        reject(error);
      }
    } else {
      resolve(true);
    }
  });
};

export const getUserIDAccessKey = async (req, access) => {
  try {
    let accessObj = JSON.parse(decryptAESText(access));
    let userID = accessObj.userID;
    let language = accessObj.language;
    req.userID = userID;
    req.body.language = language;
    req.body.lastUpdateLogin = userID;
    req.body.lastUpdatedBy = userID;
    return true;
  } catch(err) {
    console.log(err,'Invalid authorization')
    return false
  }
}

export const validateUserID = (req, res, next) => {
  if (req.url !== "/335ace3d9669d7bf245478eebca6b4da"
    && req.url !== "/789c9c09df1a9681af9e1ddc5bbdaf73"
    && req.url !== "/06d087202e767a903a2bafa55ab522af"
    && req.url !== "/50da8851a209603f821712a8f1badceae39778a5ab4209d651622cabba71e5fa"
    && req.url !== "/4f84e2da9aba4bc009d6694ae2a49eae281905a3456234010bf35e40fa5f5890"
    ) {
      let tokenString = req.headers.authorization.substr(7);
      let userSplit = tokenString.split("/");
      let token = userSplit[1];
      if (!token) {
          return res.status(401).send('Access Denied: No Token Provided');
      }
      try {
          const decoded = jwt.verify(token,constVariable.JWT.SECRETKEY);
          let tokenUser = decoded.data
          tokenUser = JSON.parse(tokenUser);
          const tokenUserID = tokenUser.USER_ID;
          const encrypted = getBody(req);
          const decryptedBody = getRequestBody(encrypted);
          const requestBody = decryptedBody?.body;
          const userID = requestBody.accessUserID;
          if (!userID || userID !== tokenUserID) {
            return res.status(200).send(generateResponse(generateDML(
              constVariable.DML_STATUS_CODE.ERROR,
              constVariable.DML_CODE_MESSAGE.E121, null,
              constVariable.STATUS_NUMBER.SUCCESS,
          )))
          }
          req.userID = tokenUserID;
          next();
      } catch (error) {
        console.log(error, 'error invalid token')
        return res.status(200).send(generateResponse(generateDML(
          constVariable.DML_STATUS_CODE.ERROR,
          constVariable.DML_CODE_MESSAGE.E101, null,
          constVariable.STATUS_NUMBER.SUCCESS,
      )))
      }
  } else {
      next();
  }
};