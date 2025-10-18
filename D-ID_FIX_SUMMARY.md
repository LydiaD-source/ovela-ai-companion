# D-ID Integration Fix Summary

## Problem Identified

### Issue 1: Incorrect D-ID API Format ❌
**Error from logs:**
```
"body.script.provider": {
  "message": "Could not match the union against any of the items",
  "value": "elevenlabs"  // WRONG: provider as string
}
```

**Root Cause:** 
The D-ID API requires `provider` to be an **object**, not a string when using ElevenLabs.

**Wrong Format:**
```json
{
  "script": {
    "type": "text",
    "input": "text",
    "provider": "elevenlabs",  // ❌ WRONG
    "voice_config": {...}
  }
}
```

**Correct Format:**
```json
{
  "script": {
    "type": "text",
    "input": "text",
    "provider": {              // ✅ CORRECT
      "type": "elevenlabs",
      "voice_id": "9BWtsMINqrJLrRacOk9x",
      "voice_config": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0,
        "use_speaker_boost": true
      }
    }
  }
}
```

### Issue 2: Dual Audio Playback 🔊🔊
**Problem:** 
- ElevenLabs text-to-speech was playing audio separately
- D-ID video also has audio embedded
- Result: Either both play (conflict) or only TTS plays (no animation)

**Solution:**
- Disable text-to-speech when D-ID callback is active
- D-ID video handles BOTH animation AND audio in one stream

## Changes Made

### 1. Fixed Edge Function (`supabase/functions/did-streaming/index.ts`)
```typescript
// BEFORE (WRONG):
provider: ELEVENLABS_API_KEY ? 'elevenlabs' : 'microsoft'

// AFTER (CORRECT):
provider: ELEVENLABS_API_KEY ? {
  type: 'elevenlabs',
  voice_id: voice_id,
} : {
  type: 'microsoft',
  voice_id: 'en-US-JennyNeural',
}
```

### 2. Disabled Competing Audio (`src/components/Chat/FullWellnessGeniUI.tsx`)
```typescript
// Only play text-to-speech if D-ID is NOT active
if (!isMuted && assistantText && !onAIResponse) {
  // Play ElevenLabs TTS (fallback)
  await textToSpeechService.speakText(assistantText);
} else if (onAIResponse) {
  // Skip TTS - D-ID handles audio through video
  console.log('🎬 Skipping text-to-speech - D-ID will handle audio');
}
```

### 3. Enhanced Video Visibility (`src/hooks/useDIDAvatarStream.ts`)
```typescript
video.style.zIndex = '100'; // Higher z-index
video.style.opacity = '1';
video.style.pointerEvents = 'auto';
video.crossOrigin = 'anonymous';
```

### 4. Added Comprehensive Logging
- Every step now logs to console
- Easy to debug where the flow stops
- Clear visibility of D-ID API calls

## Expected Behavior Now

1. User clicks "Start Chatting with Isabella"
2. Audio context unlocks (silent sound plays)
3. User sends message
4. AI responds with text
5. `onAIResponse` callback triggers
6. D-ID API creates talk stream with correct format
7. Video polls until ready
8. Video element injected into `did-container`
9. Video plays with:
   - ✅ Isabella's animated face (lip-sync)
   - ✅ ElevenLabs voice audio
   - ✅ Speech rate at 78 (optimal)
10. After video ends, returns to static image

## Testing Checklist

- [x] Fixed D-ID API format (provider as object)
- [x] Disabled competing text-to-speech
- [x] Enhanced video element visibility
- [x] Added comprehensive logging
- [ ] Test in browser (next step)
- [ ] Verify animation plays
- [ ] Verify audio plays
- [ ] Verify smooth transition
- [ ] Verify cleanup after playback

## What to Look For in Console

When testing, you should see:
```
💬 About to trigger onAIResponse callback
💬 Calling onAIResponse callback with: Well hello there...
🎯 onAIResponse callback triggered with text: Well hello there...
🎯 Calling speakDID...
🎤 useDIDAvatarStream.speak called with text: Well hello there...
🎬 Starting D-ID avatar speech: Well hello there...
🎬 didService.createTalkStream called with config: {...}
🎬 Supabase function response - data: {...}
✅ Talk created, polling for completion...
🔄 D-ID status: started
🔄 D-ID status: done
🎥 Video ready: https://...
🎥 Video element created: {...}
🎥 Video loaded, ready to play
▶️ Video playback started
🎥 Video playback ended
```

## Common Issues & Solutions

### If no logs appear:
- Check if `onAIResponse` callback is being passed to FullWellnessGeniUI
- Verify chat is active and messages are being sent

### If logs stop at "Calling speakDID":
- Check `useDIDAvatarStream` hook is properly initialized
- Verify `didContainerRef` is correctly set

### If logs stop at "Supabase function response":
- Check D-ID API key is configured in Supabase secrets
- Check ElevenLabs API key is configured
- Review edge function logs for API errors

### If video doesn't appear:
- Check z-index of container
- Verify video element is appended to correct container
- Check for CSS conflicts hiding the video

### If audio plays but no video:
- This was the old problem - should be fixed now
- Verify text-to-speech is disabled when D-ID active
- Check D-ID API response includes valid video URL
