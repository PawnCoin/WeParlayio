# Google Play release package

The final delivery ZIP must contain only verified release artifacts and store-ready information.

## Android build

- Signed Android App Bundle (`.aab`)
- Application ID and version name/code
- SHA-256 checksum for the bundle
- Signing-key backup instructions (never include the private keystore or passwords in the ZIP)
- Build and upload instructions

## Required graphics

- 512 × 512 PNG app icon
- 1024 × 500 PNG feature graphic
- Phone screenshots in accepted Google Play dimensions
- 7-inch and 10-inch tablet screenshots if tablet support is enabled
- Optional promotional graphics only when they accurately show the production app

## Store information

- App name (30 characters maximum)
- Short description (80 characters maximum)
- Full description (4,000 characters maximum)
- App category and tags
- Support email and website
- Public privacy-policy URL
- Release notes

## Play Console declarations

- Data Safety answers based on the final production code and vendors
- Content rating questionnaire
- Ads declaration
- Target audience and age restrictions
- App access/testing credentials for reviewers, supplied securely outside the ZIP
- Financial-features and real-money-gambling declarations as applicable
- Permissions justification
- Account-deletion URL and instructions if users can create accounts

## Prerequisites before generating the bundle

- Add and test an Android wrapper (for example Capacitor) or native Android client
- Finalize production domain, application ID, name, icon, and splash assets
- Configure HTTPS navigation and deep links
- Complete identity, age, location, licensing, payment, and gambling-law review before enabling money wagering
- Create a protected release-signing key and configure Play App Signing
- Test on physical phones and tablets
