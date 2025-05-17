# APK Signing Guide for WeParlay Mobile App

This guide explains how to create a signed APK file for the WeParlay mobile app, which is required for publishing to the Google Play Store.

## 1. Generate a Signing Key

First, you'll need to generate a keystore file using the Java keytool utility:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore weparlay-key.keystore -alias weparlay-alias -keyalg RSA -keysize 2048 -validity 10000
```

When prompted:
- Enter a secure password for the keystore
- Provide your organization information
- Set validity period (10000 days is recommended)

⚠️ **IMPORTANT**: Store your keystore file and password securely. If you lose them, you won't be able to update your app on the Play Store.

## 2. Configure Gradle Variables

Create a file named `gradle.properties` in the `android` directory with these contents:

```properties
WEPARLAY_UPLOAD_STORE_FILE=weparlay-key.keystore
WEPARLAY_UPLOAD_KEY_ALIAS=weparlay-alias
WEPARLAY_UPLOAD_STORE_PASSWORD=your-keystore-password
WEPARLAY_UPLOAD_KEY_PASSWORD=your-key-password
```

Replace the password values with your actual passwords.

## 3. Configure App Signing in Gradle

Edit `android/app/build.gradle` to include your signing configuration:

```gradle
android {
    ...
    
    defaultConfig {
        ...
    }
    
    signingConfigs {
        release {
            storeFile file(WEPARLAY_UPLOAD_STORE_FILE)
            storePassword WEPARLAY_UPLOAD_STORE_PASSWORD
            keyAlias WEPARLAY_UPLOAD_KEY_ALIAS
            keyPassword WEPARLAY_UPLOAD_KEY_PASSWORD
        }
    }
    
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## 4. Build the Release APK

To build a signed APK, run:

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

## 5. Build an Android App Bundle (AAB) for Play Store

Google Play Store prefers Android App Bundles. To build an AAB file, run:

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

## 6. Testing the Signed APK

Before uploading to the Play Store, test the signed APK:

```bash
# Install the APK on a connected device
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 7. Upload to Google Play Store

1. Create a developer account at [play.google.com/apps/publish](https://play.google.com/apps/publish)
2. Create a new application
3. Configure store listing details
4. Upload your AAB file in the App Releases section
5. Complete content rating questionnaire 
6. Set pricing and distribution options
7. Submit for review

## Troubleshooting

If you encounter issues with the signing process:

1. Make sure the keystore path is correct
2. Confirm the password values in gradle.properties match what you used when creating the keystore
3. Ensure Gradle has read permissions for the keystore file

## Security Best Practices

- Keep your keystore file backed up in a secure location
- Never commit keystore files or passwords to version control
- Consider using a CI/CD service with encrypted environment variables for automated builds