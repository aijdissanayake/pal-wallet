const axios = require('axios');

const httpClient = axios.create();
httpClient.defaults.timeout = 5000;

module.exports = {
  GET: async (url, customHeaders = {}) => {
    let result = null;

    await httpClient
      .get(url, {
        headers: {
          ...customHeaders,
        },
      })
      .then((response) => {
        result = response;
        return result;
      })
      .catch((error) => {
        result = error.response;
      });

    return result;
  },

  POST: async (url, params, customHeaders = {}) => {
    let result = null;

    await httpClient
      .post(url, params, {
        headers: {
          ...customHeaders,
        },
      })
      .then((response) => {
        result = response;
        return result;
      })
      .catch((error) => {
        result = error.response;
      });

    return result;
  },

  PUT: async (url, params, customHeaders = {}) => {
    let result = null;

    await httpClient
      .put(url, params, {
        headers: {
          ...customHeaders,
        },
      })
      .then((response) => {
        result = response;
        return result;
      })
      .catch((error) => {
        result = error.response;
      });

    return result;
  },
}
