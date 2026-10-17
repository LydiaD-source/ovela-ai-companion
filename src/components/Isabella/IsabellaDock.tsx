import { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { StreamingService } from '@/services/StreamingService';
import { textToSpeechService } from '@/lib/textToSpeech';
import { trackAssessmentStart } from '@/lib/usageBeacon';
import { trackIsabellaClick } from '@/lib/analytics';
import { digitalCardEnquirySeed } from '@/config/digitalCardEnquiry';
import type { AssessmentLaunchPayload } from '@/components/Home/AssessmentsSection';
const ISABELLA_AVATAR_URL = 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1758918813/Flux_Dev_v_0_xhxy5n.jpg';
export const openIsabella = (payload?: AssessmentLaunchPayload) => window.dispatchEvent(new CustomEvent('ovela:open-isabella', { detail: payload }));
export default function IsabellaDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasOpened = useRef(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [launchId, setLaunchId] = useState(0);
  const [cookieHeight, setCookieHeight] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isStreamSpeaking, setIsStreamSpeaking] = useState(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);
  const [hasLipSyncFrame, setHasLipSyncFrame] = useState(false);
  const isAISpeaking = isStreamSpeaking || isTTSSpeaking;
  // Avatar is "visually" speaking only when the canvas has a fresh lip-sync frame
  const isAvatarVisible = isStreamSpeaking && hasLipSyncFrame;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const activateChatRef = useRef<((opts?: { seeded?: boolean }) => void) | null>(null);

  // Register video element globally for StreamingService
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    (window as any).__AVATAR_VIDEO_REF__ = video;
    
    // Configure video for D-ID audio playback
    video.muted = false;
    video.volume = 1.0;
    video.playsInline = true;
    video.autoplay = true;
    
    console.log('[Home] ✅ Video element registered');
    
    return () => {
      // Reset on unmount so it reinitializes when navigating back
      (window as any).__AVATAR_VIDEO_REF__ = null;
    };
  }, []);

  // Control canvas visibility based on real lip-sync frame availability
  useEffect(() => {
    const canvas = (window as any).__AVATAR_CANVAS_REF__ as HTMLCanvasElement | undefined;
    if (!canvas) return;

    canvas.style.opacity = isAvatarVisible ? '1' : '0';
    if (isAvatarVisible) canvas.style.display = 'block';

    // Ensure audio plays when streaming is speaking
    if (isStreamSpeaking && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
    }
  }, [isAvatarVisible, isStreamSpeaking]);

  // Listen for canvas first-frame and speech-end events from StreamingService
  useEffect(() => {
    const onFrame = () => setHasLipSyncFrame(true);
    const onEnd = () => setHasLipSyncFrame(false);
    window.addEventListener('avatar-frame-ready', onFrame);
    window.addEventListener('avatar-speech-end', onEnd);
    return () => {
      window.removeEventListener('avatar-frame-ready', onFrame);
      window.removeEventListener('avatar-speech-end', onEnd);
    };
  }, []);

  // Subscribe to StreamingService state changes
  useEffect(() => {
    const unsubConnection = StreamingService.onConnectionChange((connected) => {
      console.log('[Home] 🔗 Connection:', connected);
      if (connected) setIsLoading(false);
    });

    const unsubSpeaking = StreamingService.onSpeakingChange((speaking) => {
      console.log('[Home] 🎤 Speaking:', speaking);
      setIsStreamSpeaking(speaking);
    });

    textToSpeechService.setOnSpeakingChange(setIsTTSSpeaking);

    return () => {
      unsubConnection();
      unsubSpeaking();
      textToSpeechService.setOnSpeakingChange(() => {});
      setIsTTSSpeaking(false);
    };
  }, []);

  // Handle URL params: open chat & optionally pre-seed (partner OR authority tool OR ?tool=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partner = params.get('partner');
    const toolParam = params.get('tool'); // shareable deep links e.g. ?tool=nutrition
    const partnerLabels: Record<string, string> = {
      wellnespirit: 'WellneSpirit',
      luxdeftec: 'LuxDefTec',
      superior: 'Superior Immobiliaris',
      general: 'the Ovela Network',
    };

    // Shareable deep-link presets — map ?tool=X to the same prompts as the
    // assessment cards on the homepage. Keeps email/SMS links short.
    const TOOL_DEEPLINKS: Record<string, { initialPrompt: string; tool_context: string; authority_topic: string }> = {
      nutrition: {
        initialPrompt: "I'd like the Nutrition & Muscle Preservation Assessment. Please walk me through it conversationally — I can type my week, paste my meal diary, upload a PDF or screenshot, or just describe it. Start with the disclaimer, then ask for what you need.",
        tool_context: 'nutrition_assessment',
        authority_topic: 'protein_nutrition_assessment',
      },
      recovery: {
        initialPrompt: "I'd like the Recovery & Resilience Assessment. Please run it conversationally in 5 short phases (personal profile, workload & stress, recovery, lifestyle & resilience, optional nutrition integration). Lifestyle questions only — no medical history, no diagnosis. Start with the disclaimer and ask 2–3 questions at a time.",
        tool_context: 'recovery_resilience_assessment',
        authority_topic: 'recovery_resilience_assessment',
      },
      reception: {
        initialPrompt: "I'd like to calculate what a human receptionist would actually cost in my country, and compare it to deploying you instead. Please ask me what you need.",
        tool_context: 'receptionist_cost_calculator',
        authority_topic: 'receptionist_cost',
      },
      missed: {
        initialPrompt: "Help me estimate how much revenue I'm losing to missed calls, after-hours leads, and language barriers. Ask me whatever you need to run the numbers.",
        tool_context: 'missed_leads_calculator',
        authority_topic: 'missed_leads',
      },
    };

    // 1) Authority-tool launch from any TopicHub page (sessionStorage)
    let toolSeed: { initialPrompt: string; tool_context?: string; authority_topic?: string } | null = null;
    try {
      const raw = sessionStorage.getItem('ovela:isabella:tool');
      if (raw) {
        toolSeed = JSON.parse(raw);
        sessionStorage.removeItem('ovela:isabella:tool');
      }
    } catch {}

    if (!toolSeed && toolParam === 'digital-card') {
      toolSeed = digitalCardEnquirySeed(params.get('plan'));
    }

    // 1b) URL-driven deep link — same effect as a card click
    if (!toolSeed && toolParam && TOOL_DEEPLINKS[toolParam]) {
      toolSeed = TOOL_DEEPLINKS[toolParam];
    }

    // Defer to next tick so activateChatRef is populated by its sync effect.
    const fireActivate = (seeded: boolean) => setTimeout(() => activateChatRef.current?.({ seeded }), 0);

    if (toolSeed?.initialPrompt) {
      // Always start a NEW assessment session — never resume the previous one.
      try { localStorage.removeItem('ovela_chat_session_v1'); } catch {}
      window.dispatchEvent(new Event('isabella:reset'));
      if (toolSeed.tool_context && toolSeed.tool_context !== 'digital_card_enquiry') trackAssessmentStart(toolSeed.tool_context);
      (window as any).__ISABELLA_CTX__ = {
        tool_context: toolSeed.tool_context,
        authority_topic: toolSeed.authority_topic,
      };
      window.dispatchEvent(new CustomEvent('isabella:tool-context', {
        detail: { tool_context: toolSeed.tool_context, authority_topic: toolSeed.authority_topic }
      }));
      setLaunchId(id => id + 1);
      setInitialChatMessage(toolSeed.initialPrompt);
      fireActivate(true);
      navigate({ pathname: location.pathname, search: '', hash: location.hash }, { replace: true });
      return;
    }

    if (partner && partnerLabels[partner]) {
      const label = partnerLabels[partner];
      const msg = `I'd like to register for Ovela Network membership${partner === 'general' ? '' : ` for ${label} access`}. Please acknowledge my interest, confirm my details will be sent to the Ovela team, and go straight into collecting my information (full name, email, company, country, and a short note on what I'm looking for). Skip the presentation — I'll ask if I want to know more.`;
      setLaunchId(id => id + 1);
      setInitialChatMessage(msg);
      fireActivate(true);
      navigate({ pathname: location.pathname, search: '', hash: location.hash }, { replace: true });
    } else if (params.get('chat') === 'open') {
      fireActivate(false);
      navigate({ pathname: location.pathname, search: '', hash: location.hash }, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // Stable callback for AI responses - triggers D-ID animation
  const handleAIResponse = useCallback((text: string) => {
    if (!text) return;
    
    console.log('[Home] 🎯 AI Response received, triggering speak');
    StreamingService.speak({
      avatarUrl: ISABELLA_AVATAR_URL,
      text,
    }).catch(err => {
      console.error('[Home] ❌ D-ID speak failed, falling back to TTS:', err);
      // Fallback to ElevenLabs TTS when D-ID is unavailable
      textToSpeechService.speakText(text).catch(ttsErr => {
        console.error('[Home] ❌ TTS fallback also failed:', ttsErr);
      });
    });
  }, []);

  // Activate chat and initialize D-ID connection
  const activateChat = useCallback(async (opts?: { seeded?: boolean }) => {
    console.log('[Home] 🟢 Activating chat');

    // If this is a plain "Ask About Digital Employees" open (no tool seed,
    // no partner preset), clear any leftover assessment context/messages from
    // a previous session so Isabella doesn't greet with the wrong topic
    // (e.g. nutrition prompt persisting after a prior assessment).
    if (!opts?.seeded && !hasOpened.current) {
      try { localStorage.removeItem('ovela_chat_session_v1'); } catch {}
      try { delete (window as any).__ISABELLA_CTX__; } catch {}
      window.dispatchEvent(new Event('isabella:reset'));
      setInitialChatMessage(undefined);
    }

    // Unlock audio context (browser autoplay policy workaround)
    try {
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await silentAudio.play();
    } catch (e) {
      // Ignore - audio context may already be unlocked
    }
    
    hasOpened.current = true;
    setHasOpenedChat(true);
    setIsChatActive(true);
    setIsLoading(true);

    // Initialize D-ID stream in background
    StreamingService.init(ISABELLA_AVATAR_URL)
      .then(() => setIsLoading(false))
      .catch(e => {
        console.error('[Home] ❌ D-ID init failed:', e);
        setIsLoading(false);
      });
  }, []);

  // Keep ref in sync so the URL-param effect (mounted before activateChat) can call it
  useEffect(() => {
    activateChatRef.current = activateChat;
  }, [activateChat]);


  useEffect(() => {
    const update = () => setCookieHeight(document.querySelector('[data-cookie-banner]')?.getBoundingClientRect().height ?? 0);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const closeChat = useCallback(() => {
    setIsChatActive(false);
    StreamingService.disconnect();
    textToSpeechService.stopAudio();
    launcherRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!isChatActive) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeChat(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [isChatActive, closeChat]);
  useEffect(() => {
    const launch = (event: Event) => {
      const payload = (event as CustomEvent<AssessmentLaunchPayload | undefined>).detail;
      if (payload?.initialPrompt) {
        try { localStorage.removeItem('ovela_chat_session_v1'); } catch {}
        window.dispatchEvent(new Event('isabella:reset'));
        if (payload.tool_context !== 'digital_card_enquiry') trackAssessmentStart(payload.tool_context);
        (window as any).__ISABELLA_CTX__ = { tool_context: payload.tool_context, authority_topic: payload.authority_topic };
        window.dispatchEvent(new CustomEvent('isabella:tool-context', { detail: payload }));
        setLaunchId(id => id + 1);
        setInitialChatMessage(payload.initialPrompt);
      }
      activateChat({ seeded: Boolean(payload) });
    };
    window.addEventListener('ovela:open-isabella', launch);
    return () => window.removeEventListener('ovela:open-isabella', launch);
  }, [activateChat]);
  return <>
    <div className={`isabella-dock-portrait ${isChatActive ? 'isabella-dock-source' : ''}`} style={{ bottom: `${cookieHeight + 20}px` }}>
      <img src={ISABELLA_AVATAR_URL} alt="" className="h-full w-full object-cover object-[center_35%]" />
      <video ref={videoRef} id="did-video" autoPlay playsInline crossOrigin="anonymous" className="hidden" />
      {!isChatActive && <Button ref={launcherRef} variant="ghost" className="absolute inset-0 z-30 h-full w-full rounded-full p-0 hover:bg-transparent" aria-label="Chat with Isabella" title="Chat with Isabella" onClick={() => { trackIsabellaClick(location.pathname); activateChat(); }} />}
    </div>
    {hasOpenedChat && <aside aria-label="Isabella conversation" role="dialog" className={`isabella-dock-panel ${isChatActive ? '' : 'hidden'}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-solution-border bg-solution px-4 py-2 text-solution-muted">
        <span className="text-xs">Ovela Interactive</span>
        <div className="flex items-center gap-1">
          {isLoading && <span className="mr-2 text-xs">Connecting voice…</span>}
          <Button variant="ghost" size="icon" onClick={closeChat} aria-label="Minimise Isabella" title="Minimise Isabella" className="h-8 w-8 text-solution-foreground hover:bg-solution-surface"><Minus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={closeChat} aria-label="Close Isabella" title="Close Isabella" className="h-8 w-8 text-solution-foreground hover:bg-solution-surface"><X className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <FullWellnessGeniUI key={launchId} isGuestMode defaultPersona="isabella-navia" allowedPersonas={['isabella-navia']} showOnlyPromoter onAIResponse={handleAIResponse} isAISpeaking={isAISpeaking} onClose={closeChat} initialMessage={initialChatMessage} />
      </div>
    </aside>}
  </>;
}
