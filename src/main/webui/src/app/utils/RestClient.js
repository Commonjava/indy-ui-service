/**
 * Copyright (C) 2023 Red Hat, Inc. (https://github.com/Commonjava/indy-ui-service)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const httpCall = (url, method, headers={}, payload) => fetch(url, {
  method,
  credentials: 'same-origin',
  headers,
  body: payload? payload : undefined
});

const http = {
  get: (url, headers, payload) => httpCall(url, "GET", headers, payload),
  post: (url, headers, payload) => httpCall(url, "POST", headers, payload),
  put: (url, headers, payload) => httpCall(url, "PUT", headers, payload),
  delete: (url, headers, payload) => httpCall(url, "DELETE", headers, payload)
};

const jsonRest ={
  get: (url, payload) => httpCall(url, "GET", {"Content-type": "application/json"}, JSON.stringify(payload)),
  post: (url, payload) => httpCall(url, "POST", {"Content-type": "application/json"}, JSON.stringify(payload)),
  put: (url, payload) => httpCall(url, "PUT", {"Content-type": "application/json"}, JSON.stringify(payload))
};

// const logErrors = response => {
//   if(response.text()){
//     response.text().then(error=>console.log(error));
//   }else{
//     console.log(`Something wrong: ${response.status} -> ${response.statusText}`);
//   }
// };

const BASE_STORE_API_PATH = "/api/admin/stores";
const storeAPIEndpoint = (pkgType, type, name) => `${BASE_STORE_API_PATH}/${pkgType}/${type}/${name}`;

const BASE_NFC_API_PATH = "/api/nfc";
const nfcAPIEndpoint = (pkgType, type, name, path) => {
  let result = `${BASE_NFC_API_PATH}/${pkgType}/${type}/${name}`;
  if(path.trim() !== ""){
    const encodedPath = encodeURIComponent(path);
    result += `/${encodedPath}`;
  }
  return result;
};

const genPageParam = (index, size) => {
  let queryParam = "";
  if(index >= 0) {
    queryParam = `pageIndex=${index}`;
  }
  if(size > 0){
    if(queryParam.length > 0){
      queryParam += `&`;
    }
    queryParam += `pageSize=${size}`;
  }
  return queryParam;
};

const genPageStringParam = page => {
  let queryParam = "";
  if(page !== undefined && page.length > 0) {
    queryParam = `page=${page}`;
  }
  return queryParam;
};

const handleResponse = async response => {
  if (response.ok){
    let result = {};
    try {
      result = await response.json();
    }catch(e){
      // no response body, do nothing
    }
    return {result, success: true};
  }
  try {
    const responseData = await response.json();
    if(responseData){
      return {success: false, error: {status: response.status, message: responseData.error}};
    }
  }catch(e) {
    // no response body, do nothing
  }
  return {success: false, error: {status: response.status, message: response.statusText}};
};
const IndyRest = {
  statsRes: {
    getAllPkgTypes: async () =>{
      const response = await jsonRest.get('/api/stats/package-type/keys');
      return handleResponse(response);
    },
    getVersion: async () =>{
      const response = await jsonRest.get(`/api/stats/version-info`);
      return handleResponse(response);
    },
    getAllEndpoints: async () =>{
      const response = await jsonRest.get(`/api/stats/all-endpoints`);
      return handleResponse(response);
    }
  },
  storeRes: {
    get: async (pkgType, type, name) => {
      // get Store data
      const response = await jsonRest.get(storeAPIEndpoint(pkgType, type, name));
      return handleResponse(response);
    },
    create: async store => {
      const response = await jsonRest.post(storeAPIEndpoint(store.packageType, store.type, store.name), store);
      return handleResponse(response);
    },
    update: async store => {
      // update Store data
      const response = await jsonRest.put(storeAPIEndpoint(store.packageType, store.type, store.name), store);
      return handleResponse(response);
    },
    delete: async (pkgType, type, name) => {
      const response = await http.delete(storeAPIEndpoint(pkgType, type, name));
      return handleResponse(response);
    },
    getStores: async (pkgType, type, page) => {
      const queryParam = genPageStringParam(page);
      let apiPath = `${BASE_STORE_API_PATH}/${pkgType}/${type}`;
      if(queryParam.length > 0){
        apiPath += `?${queryParam}`;
      }
      const response = await jsonRest.get(apiPath);
      return handleResponse(response);
    }
  },
  storeQueryRes: {
    getEndpoints: async (pkgType, page) => {
      const queryParam = genPageStringParam(page);
      let apiPath = `${BASE_STORE_API_PATH}/query/endpoints/${pkgType}`;
      if(queryParam.length > 0){
        apiPath += `?${queryParam}`;
      }
      const response = await jsonRest.get(apiPath);
      return handleResponse(response);
    },
    getStoreKeys: async pkgType => {
      const response = await jsonRest.get(`${BASE_STORE_API_PATH}/query/storekeys/${pkgType}`);
      return handleResponse(response);
    }
  },
  contentRes: {
    browse: async dirPath => {
      const response = await jsonRest.get(`/api${dirPath}`);
      return handleResponse(response);
    },
    delete: async contentPath => {
      const response = await http.delete(`${contentPath}?cache-only=true`);
      return handleResponse(response);
    },
  },
  disableRes: {
    getAllStoreTimeout: async () => {
      const response = await jsonRest.get('/api/admin/schedule/store/all/disable-timeout');
      return handleResponse(response);
    },
    getStoreTimeout: async (pkgType, type, name) => {
      const response = await jsonRest.get(`/api/admin/schedule/store/${pkgType}/${type}/${name}/disable-timeout`);
      if (response.ok){
        const stores = await response.json();
        return {result: stores, success: true};
      }
      const responseMsg = await response.text();
      if(responseMsg){
        return {success: false, error: {status: response.status, message: responseMsg}};
      }
      return {success: false, error: {status: response.status, message: response.statusText}};
    }
  },
  authRes: {
    getUserInfo: async () => {
      const response = await jsonRest.get('/api/admin/auth/userinfo');
      return handleResponse(response);
    }
  },
  nfcRes: {
    query: async (index, size) => {
      const queryParam = genPageParam(index,size);
      let apiPath = `${BASE_NFC_API_PATH}`;
      if(queryParam.length > 0){
        apiPath += `?${queryParam}`;
      }
      const response = await jsonRest.get(`${apiPath}`);
      return handleResponse(response);
    },
    get: async (pkgType, type, name, path, index, size) => {
      const queryParam = genPageParam(index,size);
      let apiPath = nfcAPIEndpoint(pkgType, type, name, path);
      if(queryParam.length > 0){
        apiPath += `?${queryParam}`;
      }
      const response = await jsonRest.get(apiPath);
      return handleResponse(response);
    },
    deleteAll: async () => {
      const response = await http.delete(`${BASE_NFC_API_PATH}`);
      return handleResponse(response);
    },
    delete: async (pkgType, type, name, path) => {
      const response = await http.delete(nfcAPIEndpoint(pkgType, type, name, path));
      return handleResponse(response);
    }
  },
};

export {IndyRest, BASE_STORE_API_PATH};
