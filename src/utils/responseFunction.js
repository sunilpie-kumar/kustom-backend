import { encryptAESText } from './cryptographyFunction.js';

export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const modifyResponse = (result) => {
  return {
    body: result,
    header: {
      statusCode: 200,
    }
  }
}

export const generateResponse = (result) => {
  const encryptedData = encryptAESText(JSON.stringify(result));
  return {
    body: encryptedData,
    header: {
      statusCode: 200,
    }
  }
}

export const generateDML = (statusCode, msg, id, resCode, extraRes) => {
  var returnValue = {}
  if (id !== null && id !== undefined) {
    if (extraRes !== undefined) {
      returnValue = Object.assign({
        "DML_STATUS": statusCode,
        "DML_MESSAGE": msg,
        "DML_ID": id,
      }, extraRes)
    } else {
      returnValue = {
        "DML_STATUS": statusCode,
        "DML_MESSAGE": msg,
        "DML_ID": id,
      }
    }
  } else {
    if (extraRes !== undefined) {
      returnValue = Object.assign({
        "DML_STATUS": statusCode,
        "DML_MESSAGE": msg,
      }, extraRes)
    } else {
      returnValue = {
        "DML_STATUS": statusCode,
        "DML_MESSAGE": msg,
      }
    }
  }
  return returnValue
}