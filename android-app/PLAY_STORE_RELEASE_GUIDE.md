# Learn Online - Google Play Store Release Guide

This guide walks you through publishing the Learn Online app to the Google Play Store.

## Prerequisites

- Android Studio installed (or command-line tools)
- Java 17 or higher
- Google Play Developer account ($25 one-time fee)

## Step 1: Generate a Signing Key

Run this command to create a new keystore:

```bash
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias learn-online
```

You'll be prompted for:
- Keystore password (remember this!)
- Key password (can be same as keystore password)
- Your name, organization, city, state, country

**⚠️ IMPORTANT: Back up your keystore file! If you lose it, you cannot update your app.**

## Step 2: Configure Signing

1. Copy the keystore file to `android-app/`
2. Copy `keystore.properties.example` to `keystore.properties`
3. Fill in your keystore details:

```properties
storeFile=release-keystore.jks
storePassword=your_keystore_password
keyAlias=learn-online
keyPassword=your_key_password
```

## Step 3: Generate App Icons

You need to create PNG icons from the SVG. Use Android Studio's Image Asset Studio:

1. Open the project in Android Studio
2. Right-click `res` folder > New > Image Asset
3. Select "Launcher Icons (Adaptive and Legacy)"
4. Use the icon from `public/pwa/icons/icon-512.svg`
5. Generate icons for all densities

Or use an online tool like https://icon.kitchen/ to generate all sizes.

Required icon sizes:
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192
- Play Store: 512x512

## Step 4: Build Release AAB (Recommended)

```bash
cd android-app
./gradlew bundleRelease
```

The AAB file will be at: `app/build/outputs/bundle/release/learn-online-v1.0.0-release.aab`

Or build an APK:
```bash
./gradlew assembleRelease
```

## Step 5: Prepare Play Store Assets

Place the following in `play-store-assets/`:

1. **icon-512.png** - 512x512 hi-res icon
2. **feature-graphic.png** - 1024x500 banner
3. **screenshots/** - At least 2 phone screenshots (1080x1920 recommended)

## Step 6: Create Play Store Listing

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in app details from `docs/google-play-listing.md`:
   - App name: Learn Online
   - Short description: Modern CMS with real-time messaging, video calls, and collaboration tools.
   - Full description: (see the listing doc)
   - Category: Productivity
   - Privacy policy: https://learnonline.cc/privacy-policy.html

4. Upload assets:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (min 2)

5. Complete all required sections:
   - Content rating questionnaire
   - Target audience and content
   - Data safety form

## Step 7: Upload and Publish

1. Go to Release > Production
2. Create new release
3. Upload your `.aab` file
4. Add release notes
5. Review and roll out

## Version Updates

When releasing updates:

1. Update `versionCode` (increment by 1) in `app/build.gradle`
2. Update `versionName` to new version
3. Build new AAB
4. Create new release in Play Console

## Troubleshooting

### "App not installed" error
- Make sure you uninstall any debug version first
- Check that the signing is correct

### Build fails
- Run `./gradlew clean` first
- Check Java version: `java -version` (need 17+)

### Icons look wrong
- Regenerate using Android Studio Image Asset tool
- Make sure adaptive icons have proper foreground/background

## Quick Commands

```bash
# Clean build
./gradlew clean

# Build debug APK (for testing)
./gradlew assembleDebug

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Build release APK
./gradlew assembleRelease

# Install on connected device
./gradlew installRelease
```

