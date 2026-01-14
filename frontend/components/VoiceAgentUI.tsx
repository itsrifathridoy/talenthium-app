"use client";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  RoomAudioRenderer,
} from "@livekit/components-react";

interface VoiceAgentUIProps {
  roomName: string;
  serverUrl: string;
  token: string;
}

export default function VoiceAgentUI({ roomName, serverUrl, token }: VoiceAgentUIProps) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      data-lk-theme="default"
    >
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <BarVisualizer state={state} trackRef={audioTrack} barCount={7} />
        <p>Assistant State: <strong>{state}</strong></p>
        <VoiceAssistantControlBar />
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}
