# Actions on Google: Digital Goods Sample

This sample demonstrates Actions on Google features for use on Google Assistant including the Digital Purchase API -- using the [Node.js client library](https://github.com/actions-on-google/actions-on-google-nodejs) and deployed on [Cloud Functions for Firebase](https://firebase.google.com/docs/functions/).

## Setup Instructions
### Prerequisites
1. Node.js and NPM
    + We recommend installing using [NVM](https://github.com/creationix/nvm)
1. Install the [Firebase CLI](https://developers.google.com/assistant/actions/dialogflow/deploy-fulfillment)
    + We recommend using version 6.5.0, `npm install -g firebase-tools@6.5.0`
    + Run `firebase login` with your Google account

### Digital Goods Requirements
+ You must own a web domain.
    + The domain owner will receive an email to verify ownership via [Google Search Console](https://search.google.com/search-console/welcome)
+ You must have a Play Console developer account: [**sign up**](https://play.google.com/apps/publish/signup/)
+ You must have an Android APK.
    + This sample uses [android-play-billing](https://github.com/googlesamples/android-play-billing/tree/master/TrivialDriveKotlin) Kotlin sample app on Github.
    + Follow the Kotlin README for the setup details.
    + Read about generating a keystore in [Android Studio](https://developer.android.com/studio/publish/app-signing.html#generate-key).
    + Must do an Alpha release at minimum
+ You can only test digital goods on Android devices.
    + Google Assistant installed alongside a payment method set up for your Google account.
    + **Note**: All purchases are done in Sandbox mode by default.
+ Brand verification must be completed before testing (website and Android app state `Connected` in Actions console).

### Configuration
#### Actions Console
1. From the [Actions on Google Console](https://console.actions.google.com/), New project > **Create project** > under **More options** > **Conversational**
1. In the Actions console, from the top menu under **Deploy** > fill out **Directory Information**, where all of the information is required to run transactions (sandbox or otherwise) unless specifically noted as optional.
    + **Additional information** >
        + Do your Actions use the Digital Purchase API to perform transactions of digital goods? > **Yes** > **Save**.
1. From the top menu under **Deploy** > **Brand verification** (left nav) > select **</>** to verify your website. Once the status is `Connected` then can connect an Android app.
1. In the [Google Play Developer Console](https://play.google.com/apps/publish) > **Development tools** > **Services & APIs** > **App Indexing from Google Search** > **Verify Website** button. Once you've verified your site it will take up to 24hrs for *Brand verification* reflect this change in the Actions console, nonetheless move on to the next step.
1. Back in the Actions console, from the top menu under **Develop** > **Actions** > **Add your first action** > **BUILD** (this will bring you to the Dialogflow console) > Select language and time zone > **CREATE**.
1. In the Dialogflow console, go to **Settings** ⚙ > **Export and Import** > **Restore from zip** using the `agent.zip` in this sample's directory.

### Service Account Authentication with JWT/OAuth 2.0
1. In the [Google Cloud Platform console](https://console.cloud.google.com/), select your *Project ID* from the dropdown > **Menu ☰** > **APIs & Services** > **Library**
1. Select **Actions API** > **Enable**
1. Under **Menu ☰** > **APIs & Services** > **Credentials** > **Create Credentials** > **Service Account Key**.
1. From the dropdown, select **New Service Account**
    + name:  `service-account`
    + role:  **Project/Owner**
    + key type: **JSON** > **Create**
    + Your private JSON file will be downloaded to your local machine; save as `service-account.json` in `functions/`

#### Firebase Deployment
1. Replace `'PACKAGE_NAME'` in `functions/digital-goods-service.js` with the package name of your Android app
1. On your local machine, in the `functions` directory, run `npm install`
1. Run `firebase deploy --project {PROJECT_ID}` to deploy the function
    + To find your **Project ID**: In [Dialogflow console](https://console.dialogflow.com/) under **Settings** ⚙ > **General** tab > **Project ID**.

#### Dialogflow Console
1. Return to the [Dialogflow Console](https://console.dialogflow.com) > select **Fulfillment** > **Enable** Webhook > Set **URL** to the **Function URL** that was returned after the deploy command > **SAVE**.
    ```
    Function URL (dialogflowFirebaseFulfillment): https://${REGION}-${PROJECT_ID}.cloudfunctions.net/dialogflowFirebaseFulfillment
    ```
1. From the left navigation menu, click **Integrations** > **Integration Settings** under Google Assistant > Enable **Auto-preview changes** >  **Test** to open the Actions on Google simulator then say or type `Talk to my test app`.

### Running this Sample
+ You can test this Action on any Android device with Google Assistant-enabled, where the Assistant is signed into the same account used to create this project. Just say or type, “OK Google, talk to my test app”.
+ You can also use the Actions on Google Console simulator to test most features and preview on-device behavior.

## References & Issues
+ Questions? Go to [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google), [Assistant Developer Community on Reddit](https://www.reddit.com/r/GoogleAssistantDev/) or [Support](https://developers.google.com/assistant/support).
+ For bugs, please report an issue on Github.
+ Actions on Google [Documentation](https://developers.google.com/assistant)
+ Actions on Google [Codelabs](https://codelabs.developers.google.com/?cat=Assistant)
+ [Webhook Boilerplate Template](https://github.com/actions-on-google/dialogflow-webhook-boilerplate-nodejs) for Actions on Google

## Make Contributions
Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE](LICENSE).

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
