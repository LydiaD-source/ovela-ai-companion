# D-ID Integration for Isabella Avatar

## Overview
This document describes the D-ID streaming integration for Isabella's avatar on the Ovela landing page.

## Architecture

### Components
1. **Edge Function**: `supabase/functions/did-streaming/index.ts`
   - Handles all D-ID API communication
   - Supports ElevenLabs voice (Aria - voice_id: 9BWtsMINqrJLrRacOk9x)
   - Speech rate optimized at 78 (0.78 in API) - not too fast, just right
   - Secure API key management through Supabase secrets

2. **Service Layer**: `src/services/did/didService.ts`
   - Client-side wrapper for D-ID functionality
   - Handles talk stream creation and polling
   - Manages talk lifecycle (create, status, delete)

3. **React Hook**: `src/hooks/useDIDAvatarStream.ts`
   - Manages video playback state
   - Handles video element creation and cleanup
   - Provides smooth transitions between static image and animated video

4. **Integration**: `src/pages/Home.tsx`
   - Connects D-ID with chat interface
   - Triggers avatar animation on AI responses
   - Handles browser autoplay policies

## Features

### Speech Configuration
- **Voice**: ElevenLabs Aria (warm, natural female voice)
- **Rate**: 78 (optimal speaking pace)
- **Stability**: 0.5 (balanced expressiveness)
- **Similarity Boost**: 0.75 (high voice consistency)
- **Style**: 0.0 (neutral, professional delivery)

### Visual Transitions
- Static Isabella image fades out when D-ID video starts
- Smooth opacity transitions (0.5s ease-in-out)
- Video overlays perfectly on static image position
- Automatic cleanup after video playback ends

### Browser Compatibility
- Handles autoplay restrictions with silent audio unlock
- Cross-browser video playback support
- Mobile-optimized with playsInline attribute

## Usage

### Starting Chat with D-ID
When user clicks "Start Chatting with Isabella":
1. Silent audio plays to unlock audio context (browser policy workaround)
2. Chat interface activates
3. On AI response, D-ID talk stream is automatically created
4. Video plays with synchronized lip-sync and speech

### API Flow
```
User clicks button
  → Unlock audio context
  → Chat becomes active
  → User sends message
    → AI responds with text
      → Create D-ID talk stream
        → Poll for video completion
          → Play video with audio
            → Cleanup after playback
```

## Configuration

### Required Secrets (Supabase)
- `DID_API_KEY`: D-ID API authentication
- `ELEVENLABS_API_KEY`: (Optional) For premium ElevenLabs voices

### Edge Function Config
The `did-streaming` function is configured in `supabase/config.toml`:
```toml
[functions.did-streaming]
verify_jwt = false
```

## Testing Checklist

- [ ] Click "Start Chatting with Isabella" button
- [ ] Verify audio context unlocks (check console)
- [ ] Send a message in chat
- [ ] Confirm D-ID talk stream creation (check console logs)
- [ ] Verify video appears and plays smoothly
- [ ] Check lip-sync quality matches speech
- [ ] Confirm speech rate is appropriate (78)
- [ ] Test video cleanup after playback
- [ ] Verify static image returns after video ends
- [ ] Test multiple consecutive messages
- [ ] Check mobile responsiveness
- [ ] Verify no audio issues with browser autoplay

## Troubleshooting

### Video doesn't play
- Check D-ID_API_KEY is configured in Supabase secrets
- Verify browser allows autoplay (check console errors)
- Ensure CORS headers are correct in edge function

### Speech too fast/slow
- Adjust `speed: 0.78` in edge function (range: 0.5-2.0)
- Lower = slower, Higher = faster
- Current setting: 78 (0.78) = optimal pace

### Lip-sync issues
- Check source image URL is correct
- Verify D-ID API response contains valid video URL
- Ensure stable internet connection for video streaming

### Audio not playing
- Check browser autoplay policy
- Verify video element has `muted={false}` attribute
- Test silent audio unlock on button click

## Performance Optimization

### Video Caching
- D-ID videos are generated on-demand
- Each talk is uniquely created per message
- Videos auto-cleanup after playback to save memory

### Network Efficiency
- Video streaming starts while still generating
- Polling interval: 1 second
- Maximum polling attempts: 60 (1 minute timeout)

### Memory Management
- Video elements removed from DOM after playback
- Proper cleanup on component unmount
- No memory leaks from abandoned video elements

## Future Enhancements

### Potential Improvements
1. **Video Caching**: Cache frequently used responses
2. **Preloading**: Pre-generate common greetings
3. **Queue Management**: Handle multiple rapid responses
4. **Emotion Detection**: Adjust facial expressions based on sentiment
5. **Custom Animations**: Add idle animations between responses
6. **Multi-language**: Support for multiple language voices

### Advanced Features
- Real-time streaming (when D-ID supports it)
- Custom avatar poses and backgrounds
- Interactive gesture controls
- Voice cloning for brand-specific voices

## Notes
- Always test on actual devices before deployment
- Monitor D-ID API usage and costs
- Keep speech rate at 78 unless specifically requested
- Maintain smooth UX with loading states
