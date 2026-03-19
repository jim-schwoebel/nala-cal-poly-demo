import { useState, useEffect, useCallback } from "react";
import { ConversationSidebar } from "./conversation-sidebar";
import { MainPanel } from "./main-panel";
import { ChatHistory } from "./chat-history";
import { StatusIndicator } from "./status-indicator";
import type { Status } from "./status-indicator";
import { Waveform } from "./waveform";
import { VoiceControls } from "./voice-controls";
import { ModelLoader } from "./model-loader";
import { useConversations } from "../hooks/use-conversations";
import { useMessages } from "../hooks/use-messages";
import { useWebLLM } from "../hooks/use-web-llm";
import { useVoiceInput } from "../hooks/use-voice-input";
import { useVoiceOutput } from "../hooks/use-voice-output";
import { useAudioAnalyser } from "../hooks/use-audio-analyser";

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { conversations, create, remove, updateTitle } = useConversations();
  const { messages, isGenerating, sendMessage } = useMessages(selectedId);
  const webLLM = useWebLLM();
  const voiceInput = useVoiceInput();
  const voiceOutput = useVoiceOutput();
  const audioAnalyser = useAudioAnalyser();

  // Initialize WebLLM on mount
  useEffect(() => {
    webLLM.init();
  }, []);

  // When voice input completes, send the message
  useEffect(() => {
    if (!voiceInput.isListening && voiceInput.transcript && selectedId) {
      const transcript = voiceInput.transcript;
      audioAnalyser.stop();

      sendMessage(transcript, webLLM.generate).then(() => {
        // Auto-title on first message
        if (messages.length === 0) {
          const title = transcript.slice(0, 50);
          updateTitle(selectedId, title);
        }
      });
    }
  }, [voiceInput.isListening, voiceInput.transcript]);

  // Speak assistant response
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        voiceOutput.speak(lastMessage.content);
      }
    }
  }, [messages]);

  const handleToggleMic = useCallback(async () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
    } else {
      // Ensure a conversation exists
      let convoId = selectedId;
      if (!convoId) {
        const convo = await create();
        convoId = convo.id;
        setSelectedId(convo.id);
      }
      await audioAnalyser.start();
      voiceInput.startListening();
    }
  }, [voiceInput.isListening, selectedId]);

  const handleCreate = useCallback(async () => {
    const convo = await create();
    setSelectedId(convo.id);
  }, [create]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      if (selectedId === id) setSelectedId(null);
    },
    [remove, selectedId]
  );

  // Determine current status
  let status: Status = "idle";
  if (voiceInput.isListening) status = "listening";
  else if (isGenerating) status = "thinking";

  // Determine waveform mode
  let waveformMode: "idle" | "recording" | "thinking" = "idle";
  if (voiceInput.isListening) waveformMode = "recording";
  else if (isGenerating) waveformMode = "thinking";

  // Gate on model loading
  if (!webLLM.isReady) {
    return <ModelLoader progress={webLLM.loadProgress} error={webLLM.error} />;
  }

  return (
    <div className="app">
      <ConversationSidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
      <MainPanel>
        <ChatHistory messages={messages} />
        <StatusIndicator status={status} />
        <Waveform mode={waveformMode} analyserNode={audioAnalyser.analyserNode} />
        <VoiceControls
          isRecording={voiceInput.isListening}
          onToggle={handleToggleMic}
          disabled={isGenerating}
        />
      </MainPanel>
    </div>
  );
}
