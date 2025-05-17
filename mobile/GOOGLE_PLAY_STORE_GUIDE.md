# Google Play Store Publishing Guide for WeParlay

This guide outlines the steps required to prepare and publish the WeParlay mobile app to the Google Play Store.

## Prerequisites

1. **Google Play Developer Account**
   - Create an account at [play.google.com/apps/publish](https://play.google.com/apps/publish)
   - Pay the one-time $25 registration fee
   - Complete the account details and developer agreement

2. **Development Environment Setup**
   - Install [Android Studio](https://developer.android.com/studio)
   - Install [Node.js](https://nodejs.org/) (v16 or higher)
   - Install React Native CLI: `npm install -g react-native-cli`

## Step 1: Install Dependencies

Navigate to the mobile folder and install dependencies:

```bash
cd mobile
npm install
```

## Step 2: Configure App Information

1. Update `app.json` with your app details:
   - App name
   - Package name (e.g., `com.weparlay.app`)
   - Version numbers

2. Update Android-specific configuration in:
   - `android/app/build.gradle`
   - `android/app/src/main/AndroidManifest.xml`

## Step 3: Generate App Icon and Splash Screen

1. Create app icons at multiple resolutions
   - Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/index.html)
   - Or use the WeParlay logo PNGs with a tool like [React Native Asset](https://github.com/unimonkiez/react-native-asset)

2. Generate splash screen
   - Use [React Native Splash Screen](https://github.com/crazycodeboy/react-native-splash-screen)

## Step 4: Create a Keystore for Signing

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore weparlay-key.keystore -alias weparlay-alias -keyalg RSA -keysize 2048 -validity 10000
```

Keep this keystore file secure - you'll need it for all future app updates.

## Step 5: Configure Gradle for Release Build

1. Create a `gradle.properties` file with your signing information (do not commit this to version control):

```
WEPARLAY_UPLOAD_STORE_FILE=weparlay-key.keystore
WEPARLAY_UPLOAD_KEY_ALIAS=weparlay-alias
WEPARLAY_UPLOAD_STORE_PASSWORD=*****
WEPARLAY_UPLOAD_KEY_PASSWORD=*****
```

2. Modify `android/app/build.gradle` to include signing config

## Step 6: Generate Release Build

```bash
cd android
./gradlew bundleRelease
```

This creates an Android App Bundle (AAB) at:
`android/app/build/outputs/bundle/release/app-release.aab`

## Step 7: Test the Release Build

1. Install the app on test devices using:
```bash
npx react-native run-android --variant=release
```

2. Perform thorough testing of all app features:
   - Test all bet slip functionality
   - Verify live odds updates
   - Test authentication flows
   - Verify crypto wallet connections
   - Test across different Android versions and screen sizes

## Step 8: Prepare Store Listing Materials

1. **App Description**
   - Short description (80 characters)
   - Full description (4000 characters)
   - Include key features and benefits

2. **Screenshots**
   - Capture screenshots from multiple devices
   - Include at least 2-3 screenshots for each main feature
   - Recommended: 8 screenshots total

3. **Feature Graphic**
   - 1024 × 500 px image for store feature placement
   - Include WeParlay logo and brand colors

4. **Video Preview**
   - Optional but recommended
   - 30-second screen recording of app features
   - Add WeParlay branding overlay

## Step 9: Create Content Rating

Complete the Google Play Content Rating questionnaire:
- Target audience age range
- Confirm no gambling with real currency
- Indicate if simulated gambling is present
- Specify user interaction capabilities

## Step 10: Set Up App Pricing & Distribution

1. Select countries for distribution
2. Set app as free or paid
3. Configure in-app purchases if applicable
4. Set app content rating requirements

## Step 11: Prepare Privacy Policy

Create a comprehensive privacy policy document covering:
- Data collection practices
- User information handling
- Third-party services (The Odds API, Yahoo Fantasy)
- User rights and controls
- Host this on the WeParlay website

## Step 12: Upload and Submit for Review

1. Upload the AAB file to Google Play Console
2. Complete all required store listing information
3. Add release notes for the initial version
4. Submit for review

## Step 13: Monitor Review Progress

Google's review process typically takes 1-3 days. Monitor for:
- Approval notifications
- Rejection or change requests
- Release status in the console

## Step 14: Post-Launch Tasks

1. Set up crash reporting and analytics
2. Monitor user reviews and feedback
3. Plan for regular updates and improvements
4. Consider implementing A/B testing for features

## Compliance Considerations

For a sports betting app, ensure compliance with:
1. Age verification mechanisms
2. Clear terms of service regarding simulated betting
3. Appropriate app content rating
4. Proper licenses for sports data usage
5. Clear distinction between virtual and real currency

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Play Console Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [React Native Android Building Guide](https://reactnative.dev/docs/signed-apk-android)