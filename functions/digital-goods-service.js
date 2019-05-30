// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const { google } = require('googleapis');
const fetch = require('node-fetch');
const serviceAccount = require('./service-account.json');

// Replace packageName name below.
const packageName = 'PACKAGE_NAME';
const inAppProductIds = {
  SKU_TYPE_IN_APP: ['premium_car', 'gas'],
  SKU_TYPE_SUBSCRIPTION: ['gold_monthly', 'gold_yearly'],
};

const endpoints = {
  'get_skus': `https://actions.googleapis.com/v3/packages/${packageName}/skus:batchGet`,
  'consume_entitlement': (convId) => {
    return `https://actions.googleapis.com/v3/conversations/${convId}/entitlement:consume`;
  },
};

/**
 * Type definition for a SKU.
 * @typedef {Object} SKU
 * @property {string} title
 * @property {string} description
 * @property {SkuId} skuId
 * @property {string} formattedPrice
 * @property {Object} subscriptionDetails
 * @property {string} price
 */

/**
 * @typedef {Object} SkuId
 * @property {string} skuType
 * @property {string} id
 * @property {string} packageName
 */

/**
 * Gets SKUs from the Play Store.
 * @param {string} conversationId
 * @return {Array<SKU>} array of SKUs
 */
async function getSkus(conversationId) {
  const jwtTokens = await getJwtTokens();
  // Array<SKU>
  let skus = [];
  // eslint-disable-next-line
  for (const skuType in inAppProductIds) {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + jwtTokens.access_token,
      },
      body: JSON.stringify({
        'conversationId': conversationId,
        'skuType': skuType,
        'ids': [inAppProductIds[skuType]],
      }),
    };
    const res = await fetch(endpoints['get_skus'], options);
    const resJson = await res.json(); // Array<SKU>
    // need to put all skus into one array.
    skus = skus.concat(resJson.skus);
  }
  console.log(`Fetched SKUs: ${skus}`);
  return skus;
};

/**
 * Utility function to return authentication tokens from JWT.
 * @return {Promise<Object>} promise that resolves to credentials.
 */
const getJwtTokens = () => {
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/actions.purchases.digital'],
    null
  );
  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
      }
      resolve(tokens);
    });
  });
};

/**
 * Calls consume endpoint for the particular Sku as
 * defined by the purchaseToken.
 * @param {string} conversationId
 * @param {string} purchaseToken
 * @return {Object} response from the consume endpoint.
 */
const consume = async (conversationId, purchaseToken) => {
  const jwtTokens = await getJwtTokens();
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwtTokens.access_token,
    },
    body: JSON.stringify({
      'purchaseToken': purchaseToken,
    }),
  };
  const url = endpoints['consume_entitlement'](conversationId);
  const res = await fetch(url, options);
  const resJson = await res.json();
  return resJson;
};

module.exports = {
  getSkus,
  consume,
};
