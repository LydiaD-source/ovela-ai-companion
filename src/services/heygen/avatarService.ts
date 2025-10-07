import { heygenClient } from './apiClient';

export class HeyGenAvatarService {
  private peerConnection: RTCPeerConnection | null = null;
  private sessionId: string | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    // Create streaming session
    const session = await heygenClient.createStreamingSession('Angela-inblackskirt-20220820');
    this.sessionId = session.sessionId;

    // Set up WebRTC peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers: session.iceServers
    });

    // Handle incoming video track
    this.peerConnection.ontrack = (event) => {
      console.log('Received video track');
      if (this.videoElement && event.streams[0]) {
        this.videoElement.srcObject = event.streams[0];
        this.videoElement.play();
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.sessionId) {
        await heygenClient.sendICE(this.sessionId, event.candidate);
      }
    };

    // Set remote description
    await this.peerConnection.setRemoteDescription({
      type: 'offer',
      sdp: session.sdp
    });

    // Create answer
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Start session
    if (answer.sdp) {
      await heygenClient.startSession(session.sessionId, answer.sdp);
      console.log('HeyGen session started');
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('Session not initialized');
    }

    await heygenClient.sendTask(this.sessionId, text);
    console.log('Sent text to HeyGen:', text);
  }

  async close(): Promise<void> {
    if (this.sessionId) {
      await heygenClient.stopSession(this.sessionId);
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.sessionId = null;
  }
}
