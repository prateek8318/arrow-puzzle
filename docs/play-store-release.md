# Play Store release preparation

This repository has a separate Android preview build type, signed with Android's debug key for testing. It must not be uploaded to Google Play. Configure a private upload key before producing the final release AAB.

## Publisher and public policy pages

Publisher: **Prateek Pandey**. Public support email: **prateekpandey2580@gmail.com**. App name: **Tap Away Arrows**. These match the privacy policy and terms in this repository.

Upload `docs/legal/privacy-policy.html` and `docs/legal/terms-of-use.html` to your public HTTPS website. Enter the live privacy-policy URL in Play Console; a local file path is not sufficient. The page must load without login and must not be a PDF. Hosting is still pending. Both documents are also available offline from the app's Settings screen.

After editing either Markdown policy, run `node scripts/sync-legal.cjs` before building. This regenerates the public HTML and bundled app text from the same source.

The intended age groups still need the publisher's confirmation. Do not assume an audience or content rating from the game's appearance. Confirm asset rights before publication.

## Play Console entries

| Section | Entry or action |
| --- | --- |
| App details | Tap Away Arrows; Game; Puzzle |
| Package | `com.arrowpuzzle.tapawayarrows` |
| Store contact | `prateekpandey2580@gmail.com` |
| Privacy policy | Public HTTPS URL of the hosted privacy-policy page |
| Ads | No ads in this release |
| App access | All functionality is available without login or special access |
| Data safety | Current app code stores progress/settings locally and has no data collection/sharing service; review the final build and answer accordingly |
| Account creation | No accounts in this release |
| Target audience | Publisher must choose the actual intended age groups; complete Families requirements if children are included |
| Content rating | Complete the IARC questionnaire truthfully; use its assigned rating |
| Store listing | Add descriptions from `play-store-assets.md`, a 512×512 icon, 1024×500 feature graphic and real phone screenshots |
| Countries and pricing | Choose distribution countries and pricing in Console |
| Testing | Upload to internal testing first and check gameplay, audio, saved progress, reset, and both legal screens on a device |
| Production access | Complete any testing and verification requirements shown for your developer account before applying for production |

Play Console review, public policy hosting, audience selection, store artwork uploads and account declarations are not completed by building an AAB.

## Signing and bundle

The release package ID is `com.arrowpuzzle.tapawayarrows`. Rebuild the release AAB after changing this ID before uploading to Play Console.

1. Generate and securely back up a unique Android upload keystore with `keytool -genkeypair -v -keystore arrow-upload.jks -alias arrow-upload -keyalg RSA -keysize 4096 -validity 10000`. Choose private passwords when prompted; keep the keystore and passwords outside Git.
2. Configure `ARROW_UPLOAD_STORE_FILE`, `ARROW_UPLOAD_STORE_PASSWORD`, `ARROW_UPLOAD_KEY_ALIAS` and `ARROW_UPLOAD_KEY_PASSWORD` in your private Gradle properties or CI secrets. For example, the store file may use an absolute path to your backed-up `.jks` file.
3. Build `android/gradlew.bat bundleRelease`, then inspect the signed bundle and upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console. For a local standalone test APK, run `android/gradlew.bat assemblePreview`; its package ID ends in `.preview`.
4. Enrol in Play App Signing and keep the upload key backed up. Increment `versionCode` for each update. Confirm the final package ID before the first release; it cannot be casually changed afterward.

The project targets Android API 36 and currently packages 64-bit ARM Android devices. The app is offline, has no ads or accounts, and stores progress locally. Verify the final merged manifest and any SDK changes before answering the Data safety form. A privacy policy and app-content declarations still need to be entered in Play Console.

Official references: https://support.google.com/googleplay/android-developer/answer/11926878 (target API), https://support.google.com/googleplay/android-developer/answer/9842756 (Play App Signing), https://support.google.com/googleplay/android-developer/answer/9859455 (privacy policy and app content), https://support.google.com/googleplay/android-developer/answer/10787469 (Data safety).
