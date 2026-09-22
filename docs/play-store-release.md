# Play Store release preparation

This repository has a separate Android preview build type, signed with Android's debug key for testing. It must not be uploaded to Google Play. Configure a private upload key before producing the final release AAB.

## Publisher details to fill in

Replace `[PUBLISHER LEGAL NAME]` and `[SUPPORT EMAIL]` in the privacy policy and terms. Host the privacy policy at a public HTTPS URL. Add the same support email to the Play listing. Confirm whether the game targets children before completing the Families and Data safety declarations.

## Signing and bundle

1. Generate and securely back up a unique Android upload keystore with `keytool -genkeypair -v -keystore arrow-upload.jks -alias arrow-upload -keyalg RSA -keysize 4096 -validity 10000`. Choose private passwords when prompted; keep the keystore and passwords outside Git.
2. Configure `ARROW_UPLOAD_STORE_FILE`, `ARROW_UPLOAD_STORE_PASSWORD`, `ARROW_UPLOAD_KEY_ALIAS` and `ARROW_UPLOAD_KEY_PASSWORD` in your private Gradle properties or CI secrets. For example, the store file may use an absolute path to your backed-up `.jks` file.
3. Build `android/gradlew.bat bundleRelease`, then inspect the signed bundle and upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console. For a local standalone test APK, run `android/gradlew.bat assemblePreview`; its package ID ends in `.preview`.
4. Enrol in Play App Signing and keep the upload key backed up. Increment `versionCode` for each update. Confirm the final package ID before the first release; it cannot be casually changed afterward.

The project targets Android API 36 and currently packages 64-bit ARM Android devices. The app is offline, has no ads or accounts, and stores progress locally. Verify the final merged manifest and any SDK changes before answering the Data safety form. A privacy policy and app-content declarations still need to be entered in Play Console.

Official references: https://support.google.com/googleplay/android-developer/answer/11926878 (target API), https://support.google.com/googleplay/android-developer/answer/9842756 (Play App Signing), https://support.google.com/googleplay/android-developer/answer/9859455 (privacy policy and app content), https://support.google.com/googleplay/android-developer/answer/10787469 (Data safety).
