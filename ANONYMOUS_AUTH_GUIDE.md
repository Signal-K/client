# Anonymous Authentication Guide

Star Sailors now supports anonymous authentication, allowing users to explore and contribute without creating an account initially.

## Features

### Anonymous Sign-In
- **Quick Start**: Users can begin exploring immediately without providing any personal information
- **Temporary Account**: Progress is saved during the session but may be lost when the browser data is cleared
- **No Email Required**: Perfect for users who want to try the platform before committing

### Account Upgrade
- **Seamless Conversion**: Anonymous users can upgrade to permanent accounts at any time
- **Progress Preservation**: All discoveries and classifications are preserved during the upgrade
- **Multiple Options**: Upgrade using email/password or link with Google account

## User Experience Flow

### 1. Landing Page
- Users see options to sign up with email, Google, or continue as a guest
- Clear explanation of benefits for each option

### 2. Anonymous Session
- User can explore all features with temporary account
- Visual indicators show "Guest Account" status in the header
- Progress tracking shows classifications and discoveries made

### 3. Upgrade Prompts
- Smart prompts appear after meaningful engagement (3+ classifications, discoveries, or 10+ minutes)
- Dismissible banners with clear upgrade benefits
- Modal for account conversion accessible from header and prompts

## Technical Implementation

### Configuration
Anonymous authentication is enabled in the Supabase configuration:
```toml
# supabase/config.toml
enable_anonymous_sign_ins = true
enable_manual_linking = true
```

### Components
- `EnhancedAuth.tsx`: New authentication page with anonymous option
- `ConvertAnonymousAccount.tsx`: Account upgrade modal
- `AnonymousUserPrompt.tsx`: Smart upgrade prompts
- Enhanced `MainHeader.tsx`: Anonymous user indicators

### Database Considerations
- Anonymous users use the `authenticated` role in Postgres
- RLS policies can distinguish using `auth.jwt()->>'is_anonymous'` claim
- Automatic cleanup can be implemented for old anonymous accounts

## Benefits

### For Users
- **Lower Barrier to Entry**: Try before you commit
- **Privacy First**: No personal information required initially
- **Flexible**: Upgrade when ready, dismiss when not

### For Platform
- **Increased Engagement**: More users willing to try the platform
- **Better Conversion**: Users upgrade after seeing value
- **Reduced Friction**: Eliminates registration bottlenecks

## Best Practices

### User Communication
- Clear messaging about temporary nature of anonymous accounts
- Highlight benefits of upgrading at appropriate moments
- Respectful of user's choice to remain anonymous

### Data Management
- Implement cleanup for old anonymous accounts (30+ days)
- Handle conflicts when linking to existing accounts
- Preserve user progress during conversions

### Security
- Enable CAPTCHA for anonymous sign-ins to prevent abuse
- Monitor for unusual patterns
- Rate limit anonymous account creation

## Rate Limits & Abuse Prevention

Anonymous sign-ins have built-in protections:
- IP-based rate limit: 30 requests per hour (configurable)
- CAPTCHA integration recommended for production
- Automatic cleanup of inactive anonymous accounts

## Future Enhancements

- **Progress Sync**: Allow anonymous users to sync progress across devices
- **Feature Limitations**: Potentially restrict some features for anonymous users
- **Analytics Integration**: Track conversion funnel from anonymous to permanent accounts
