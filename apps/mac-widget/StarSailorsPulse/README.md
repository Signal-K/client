# Star Sailors Pulse (macOS accessory app + desktop widget)

Native macOS menu-bar accessory app and desktop widget for Star Sailors survey telemetry.

## Features

- Runs from the menu bar without a Dock icon
- Desktop WidgetKit widget for macOS desktop / Notification Center
- Live PostHog survey telemetry
- Recent successful completions with answer snippets
- Lightweight derived insights from repeated responses
- Local macOS notifications for new successful completions
- Adjustable auto-refresh interval
- Custom generated app icon asset

## Build & run

1. Generate project files:

```bash
cd apps/mac-widget/StarSailorsPulse
xcodegen generate
```

2. Open in Xcode:

```bash
open StarSailorsPulse.xcodeproj
```

3. Run target `StarSailorsPulse`.

4. Create local secrets config from the example:

```bash
cp Config/Secrets.xcconfig.example Config/Secrets.xcconfig
```

5. Fill in the real values in `Config/Secrets.xcconfig`.

## Notes

- `Config/Secrets.xcconfig` is git-ignored and is used to inject bundle values at build time.
- The built local app bundle contains the values, but the repo does not track them.
- The menu-bar extra still requires the app process to run; it just no longer needs a Dock presence.
