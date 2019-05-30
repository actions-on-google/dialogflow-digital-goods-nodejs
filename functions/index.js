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

const functions = require('firebase-functions');
const {
  getSkus,
  consume,
} = require('./digital-goods-service');
const {
  dialogflow,
  CompletePurchase,
  Carousel,
} = require('actions-on-google');

const consumableIds = ['gas'];

/**
 * Incomplete type definition for a SKU.
 * @typedef {Object} SKU
 * @property {string} title
 * @property {string} description
 * @property {SkuId} skuId
 * @property {string} formattedPrice
 */

/**
 * @typedef {Object} SkuId
 * @property {string} skuType
 * @property {string} id
 * @property {string} packageName
 */

const app = dialogflow({debug: true});

const BUILD_ORDER_CONTEXT = 'build-the-order';
const BUILD_ORDER_LIFETIME = 5;

app.intent('Build the Order', async (conv) => {
  let skus;
  try {
    skus = await getSkus(conv.request.conversation.conversationId);
    if (skus.length === 0) {
      conv.close('Oops, looks like there is nothing available.'
        + ' Please try again later');
      return;
    }
  } catch (error) {
    console.log(error);
    conv.close(`Oops, looks like there was an internal error.`
      + ` Please try again later.`);
    return;
  }
  // Create a mapping of SkuId.id to Sku object
  conv.data.skus = skus.reduce((acc, curr) => {
    acc[curr.skuId.id] = curr;
    return acc;
  }, {});
  // Build the order
  const responsePrefix = 'Great! I found the following items: ';
  conv.ask(`${responsePrefix} ${buildSimpleResponse(skus)}.` +
    ` Which one do you want?`);
  if (conv.screen) {
    conv.ask(buildCarousel(skus));
  }
});

/**
 * Utility function to build a carousel consisting of SKU items.
 * @param {Array<SKU>} skus
 * @return {Object} carousel
 */
const buildCarousel = (skus) => {
  const items = {};
  for (const sku of skus) {
    items[sku.skuId.id] = {
      title: sku.title,
      description: sku.description,
    };
  }
  return new Carousel({items: items});
};

/**
 * Utility function to build a simple response consisting of SKU titles.
 * @param {Array<SKU>} skus
 * @return {string} string containing SKUs separated by ','
 */
const buildSimpleResponse = (skus) => {
  let s = [];
  for (const sku of skus) {
    s.push(sku.title);
  }
  return s.join(', ');
};

// 3. Complete the purchase.
app.intent('Initiate the Purchase', async (conv, {SKU}) => {
  const selectedSKUId = conv.arguments.get('OPTION') || SKU;
  const selectedSKU = conv.data.skus[selectedSKUId];
  if (!selectedSKU) {
    conv.close(`Hm, I can not find details for ${selectedSKUId}. Goodbye.`);
  }
  conv.data.purchasedItemSku = selectedSKU;
  conv.ask('Great! Here you go.');
  conv.ask(new CompletePurchase({
    skuId: {
      skuType: selectedSKU.skuId.skuType,
      id: selectedSKU.skuId.id,
      packageName: selectedSKU.skuId.packageName,
    },
  }));
});

/**
 * Utility function to find a corresponding entitlement for a selected sku.
 * Will return null if used has not purchased this sku (i.e. no corresponding
 * entitlement).
 * @param {Array<Object>} entitlements
 * @param {SKU} selectedSKU
 * @return {Object} entitlement object
 */
const findSelectedEntitlement = (entitlements, selectedSKU) => {
  console.log('Looking for ' + selectedSKU.skuId.id);
  for (const entitlemenGroup of entitlements) {
    for (const entitlement of entitlemenGroup.entitlements) {
      if (entitlement.sku === selectedSKU.skuId.id) {
        return entitlement;
      }
    }
  }
  return null;
};

/**
 * Consume the recently purchased item. Item should be checked in-advance.
 * @param {Object} conv
 */
const doConsume = async (conv) => {
  const entitlementForSelectedSKU = findSelectedEntitlement(
    conv.user.entitlements, conv.data.purchasedItemSku);
  const purchaseToken =
    entitlementForSelectedSKU.inAppDetails.inAppPurchaseData.purchaseToken;
  try {
    await consume(
      conv.request.conversation.conversationId, purchaseToken);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Utility function that checks if the item should be consumed. The item should
 * be consumed iff selected SKU is in our list of consumables and user already
 * purchased the item.
 * @param {Object} conv
 * @return {boolean} if item should be consumed
 */
const shouldBeConsumed = (conv) => {
  const entitlementForSelectedSKU = findSelectedEntitlement(
    conv.user.entitlements, conv.data.purchasedItemSku);
  // Selected sku is in our list of consumables and user already
  // purchased the item.
  return consumableIds.indexOf(conv.data.purchasedItemSku.skuId.id) !== -1
    && entitlementForSelectedSKU;
};

// 4. Describe the Purchase Status.
app.intent('Describe the Purchase Status', async (conv) => {
  const arg = conv.arguments.get('COMPLETE_PURCHASE_VALUE');
  console.log('User Decision: ' + JSON.stringify(arg));
  if (!arg || !arg.purchaseStatus) {
    conv.close('Purchase failed. Please check logs.');
    return;
  }
  if (arg.purchaseStatus === 'PURCHASE_STATUS_OK') {
    conv.contexts.set(BUILD_ORDER_CONTEXT, BUILD_ORDER_LIFETIME);
    const appResponse = `You've successfully purchased the item! Would you`
      + ` like to do anything else?`;
    if (shouldBeConsumed(conv)) {
      await doConsume(conv);
    }
    conv.ask(appResponse);
  } else if (arg.purchaseStatus === 'PURCHASE_STATUS_ALREADY_OWNED') {
    if (shouldBeConsumed(conv)) {
      await doConsume(conv);
      conv.contexts.set(BUILD_ORDER_CONTEXT, BUILD_ORDER_LIFETIME);
      conv.ask('Oops, looks like there was an error.'
        + ' Would you like to retry the purchase?');
    } else {
      conv.close('Purchase failed. You already own the item.');
    }
  } else if (arg.purchaseStatus === 'PURCHASE_STATUS_ITEM_UNAVAILABLE') {
    conv.close('Purchase failed. Item is not available.');
  } else if (arg.purchaseStatus === 'PURCHASE_STATUS_ITEM_CHANGE_REQUESTED') {
    // Reset context to reconfigure the conversation with the user.
    conv.contexts.set(BUILD_ORDER_CONTEXT, BUILD_ORDER_LIFETIME);
    conv.ask(`Looks like you've changed your mind.` +
      ` Would you like to try again?`);
  } else if (arg.purchaseStatus === 'PURCHASE_STATUS_USER_CANCELLED') {
    // Reset context to reconfigure the conversation with the user.
    conv.contexts.set(BUILD_ORDER_CONTEXT, BUILD_ORDER_LIFETIME);
    conv.ask(`Looks like you've cancelled the purchase.` +
      ` Do you still want to try to do a purchase?`);
  } else if (arg.purchaseStatus === 'PURCHASE_STATUS_ERROR'
    || arg.purchaseStatus === 'PURCHASE_STATUS_UNSPECIFIED') {
    // Reset context to reconfigure the conversation with the user.
    conv.contexts.set(BUILD_ORDER_CONTEXT, BUILD_ORDER_LIFETIME);
    conv.ask('Purchase Failed:' + arg.purchaseStatus);
    conv.ask('Do you want to try again?');
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
