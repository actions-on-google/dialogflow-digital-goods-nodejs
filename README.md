# Actions on Google: Digital Goods Sample using Node.js

This sample demonstrates the use of the Digital Purchases API to provide digital transactions through Actions on Google.

## Setup Instructions

### Pre-requisites
You must own a web domain. The owner of this web domain will receive an email to verify ownership as part of the Brand Verification of your Action. See more details here.
You must have a Play Console developer account.
You must have an Android phone to test the Action. This phone must have the Google Assistant installed and a payment method set up for your Google account. Using this sample does not require you to actually make any purchases with this account.

Note: Ensure you have digital transactions enabled under *Deploy* > *Directory Information* > *Transactions* > *Do your Actions use the Digital Purchase API to perform transactions of digital goods?*

### Setup Play Console and Android app

This sample uses digital purchases from the Trivial Drive V2 sample for Android. To get started, follow their README for setup instructions with your Play Console account.

### Verify your brand in the Actions Console
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing and click *Create Project*.
1. Click *Skip*, located on the top right to skip over category selection menu.
1. On the left navigation menu under *ADVANCED OPTIONS*, click on *Brand Verification*. Click on the *</>* icon to connect your website. Make sure to use the same website associated with your Play Console developer account.
1. You may need to confirm your ownership of the website via email and then wait a few hours before the site is verified.
1. Once the site is verified, return to the Actions Console.
1. On the left navigation menu under *ADVANCED OPTIONS*, click on *Brand Verification*.
1. Click *CONNECT APP* and follow the instructions to connect the Android app published earlier.

### Setup the Dialogflow Agent
Once the above steps are complete, and you see your website and Android app listed in the *Brand verification* page of the Actions Console, you can continue with the steps below.

1. On the left navigation menu under *DEPLOY*, click on *Directory Information*.
1. Add your App info, including images, a contact email and privacy policy. This information can all be edited before submitting for review.
1. Check the box at the bottom to indicate this app uses the Digital Purchases API under *Additional Information*. Click *Save*.
1. On the left navigation menu under *BUILD*, click on *Actions*. Click on *Add Your First Action* and choose your app's language(s).
1. Select *Custom intent*, click *BUILD*. This will open a Dialogflow console. Click *CREATE*.
1. Click on the gear icon to see the project settings.
1. Select *Export and Import*.
1. Select *Restore from zip*. Follow the directions to restore from the `digitalpurchases_agent.zip` file in this repo.


#### Get a Service Account Key
1. Visit the Google Cloud console for the project used in the Actions console.
1. Navigate to the API Library.
1. Search for and enable the Google Actions API.
1. Navigate to the Credentials page in the API manager. You may need to enable access.
1. Click Create credentials > Service Account Key
1. Click the Select box under Service Account and click New Service Account
1. Give the Service Account a name (like "PROJECT_NAME-digital-goods") and the role of Project Owner
1. Select the JSON key type
1. Click Create
1. A JSON service account key will be downloaded to the local machine.
1. In `functions/digital-goods-service.js`, replace `'path/to/key.json'` with the path to your key.

#### Deploy fulfillment
1. You’ll need to verify some code changes to run the sample.
    1. Verify that *inAppProductIds* in `function/digital-goods-service.js` are the same as those entered in the Play Console.
    1. Verify that any string(s) in the *consumableIds* array in `functions/index.js` are entered as products in the Play Console as well.
1. Replace `'PACKAGE_NAME'` in `functions/digital-goods-service.js` with the package name of your Android app.
1. Deploy the fulfillment webhook provided in the functions folder using [Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/):
    1. Follow the instructions to [set up and initialize Firebase SDK for Cloud Functions](https://firebase.google.com/docs/functions/get-started#set_up_and_initialize_functions_sdk). Make sure to select the project that you have previously generated in the Actions on Google Console and to reply `N` when asked to overwrite existing files by the Firebase CLI.
    1. Run `firebase deploy --only functions` and take note of the endpoint where the fulfillment webhook has been published. It should look like `Function URL (transactions): https://${REGION}-${PROJECT}.cloudfunctions.net/transactions`
1. Go back to the Dialogflow console and select *Fulfillment* from the left navigation menu.
1. Enable *Webhook*, set the value of *URL* to the `Function URL` from the previous step, then click *Save*.
1. Select *Integrations* from the left navigation menu and open the *Integration Settings* menu for Actions on Google. Click *Manage Assistant App*, which will take you to the [Actions on Google Console](https://console.actions.google.com).

#### Testing
1. Return [Actions on Google Console](https://console.actions.google.com), on the left navigation menu under *Test*, click on *Simulator*.
1. Click *Start Testing* and select the latest version (VERSION - Draft).
1. Type `Talk to my test app` in the simulator, or say `OK Google, talk to my test app` to any Actions on Google enabled device signed into your
developer account.
1. Follow the instructions below to test a transaction.
1. To test payment when confirming transaction, uncheck the box in the Actions
console simulator indicating testing in Sandbox mode.

For more detailed information on deployment, see the [documentation](https://developers.google.com/actions/dialogflow/deploy-fulfillment).

## References and How to report bugs
* Actions on Google documentation: [https://developers.google.com/actions/](https://developers.google.com/actions/).
* If you find any issues, please open a bug here on GitHub.
* Questions are answered on [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google).

## How to make contributions?
Please read and follow the steps in the CONTRIBUTING.md.

## License
See LICENSE.md.

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).

## Google+
Actions on Google Developers Community on Google+ [https://g.co/actionsdev](https://g.co/actionsdev).
