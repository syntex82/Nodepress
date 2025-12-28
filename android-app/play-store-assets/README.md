# Google Play Store Assets

This folder contains all the assets required for publishing to the Google Play Store.

## Required Assets Checklist

### App Icon
- [x] `icon-512.png` - 512x512 PNG (Hi-res icon)

### Feature Graphic
- [x] `feature-graphic.png` - 1024x500 PNG

### Screenshots (minimum 2, maximum 8 per device type)
Place screenshots in the appropriate folders:
- `screenshots/phone/` - Phone screenshots (16:9 or 9:16 ratio)
- `screenshots/tablet-7/` - 7" tablet screenshots
- `screenshots/tablet-10/` - 10" tablet screenshots

Recommended screenshot dimensions:
- Phone: 1080x1920 or 1920x1080
- 7" Tablet: 1200x1920
- 10" Tablet: 1600x2560

### Promo Video (Optional)
- YouTube URL for your app promo video

## How to Create Screenshots

1. Run the app on an emulator or device
2. Navigate to each feature screen
3. Take screenshots using:
   - Android Studio: View > Tool Windows > Logcat > Camera icon
   - ADB: `adb shell screencap -p /sdcard/screenshot.png`
   - Device: Power + Volume Down

## Recommended Screenshots

1. **Dashboard** - Main admin dashboard
2. **Messages** - Real-time messaging
3. **Video Call** - Video calling feature
4. **Posts** - Content management
5. **Shop** - E-commerce features
6. **Courses** - LMS/Learning features
7. **Profile** - User profile
8. **Settings** - Customization options

## Store Listing Text

See `../docs/google-play-listing.md` for:
- App name
- Short description (80 chars)
- Full description (4000 chars)
- Category and tags
- Privacy policy URL

