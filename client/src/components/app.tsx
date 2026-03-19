import { useState, useEffect, useCallback, useRef } from "react";
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
  const [conversationActive, setConversationActive] = useState(false);
  const { conversations, create, remove, updateTitle } = useConversations();
  const { messages, isGenerating, sendMessage } = useMessages(selectedId);
  const webLLM = useWebLLM();
  const voiceInput = useVoiceInput();
  const voiceOutput = useVoiceOutput();
  const audioAnalyser = useAudioAnalyser();
  const selectedIdRef = useRef(selectedId);
  const messagesRef = useRef(messages);

  // Keep refs in sync
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Initialize WebLLM on mount
  useEffect(() => {
    webLLM.init();
  }, []);

  // Auto-restart listening after TTS finishes speaking
  const autoResumeListen = useCallback(() => {
    if (conversationActive) {
      audioAnalyser.start().then(() => {
        voiceInput.startListening();
      });
    }
  }, [conversationActive]);

  // When voice input completes, check for "stop" or send message
  useEffect(() => {
    if (!voiceInput.isListening && voiceInput.transcript && selectedIdRef.current) {
      const transcript = voiceInput.transcript;
      audioAnalyser.stop();

      // Check for stop command
      if (transcript.toLowerCase().trim() === "stop" || transcript.toLowerCase().trim() === "stop.") {
        setConversationActive(false);
        return;
      }

      sendMessage(transcript, webLLM.generate).then(() => {
        if (messagesRef.current.length === 0) {
          const title = transcript.slice(0, 50);
          updateTitle(selectedIdRef.current!, title);
        }
      });
    }
  }, [voiceInput.isListening, voiceInput.transcript]);

  // Speak assistant response, then auto-resume listening
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        voiceOutput.speak(lastMessage.content, autoResumeListen);
      }
    }
  }, [messages]);

  const handleToggleMic = useCallback(async () => {
    if (conversationActive) {
      // Stop the conversation
      setConversationActive(false);
      voiceInput.stopListening();
      voiceOutput.cancel();
      audioAnalyser.stop();
    } else {
      // Start a conversation
      let convoId = selectedId;
      if (!convoId) {
        const convo = await create();
        convoId = convo.id;
        setSelectedId(convo.id);
      }
      setConversationActive(true);
      await audioAnalyser.start();
      voiceInput.startListening();
    }
  }, [conversationActive, selectedId]);

  const handleCreate = useCallback(async () => {
    setConversationActive(false);
    voiceInput.stopListening();
    voiceOutput.cancel();
    audioAnalyser.stop();
    const convo = await create();
    setSelectedId(convo.id);
  }, [create]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      if (selectedId === id) {
        setSelectedId(null);
        setConversationActive(false);
      }
    },
    [remove, selectedId]
  );

  const handlePromptSelect = useCallback(async (prompt: string) => {
    let convoId = selectedId;
    if (!convoId) {
      const convo = await create();
      convoId = convo.id;
      setSelectedId(convo.id);
    }
    setConversationActive(true);
    sendMessage(prompt, webLLM.generate).then(() => {
      if (messagesRef.current.length === 0) {
        updateTitle(convoId!, prompt.slice(0, 50));
      }
    });
  }, [selectedId]);

  // Determine current status
  let status: Status = "idle";
  if (voiceInput.isListening) status = "listening";
  else if (isGenerating) status = "thinking";
  else if (voiceOutput.isSpeaking) status = "speaking";

  // Determine waveform mode
  let waveformMode: "idle" | "recording" | "thinking" | "speaking" = "idle";
  if (voiceInput.isListening) waveformMode = "recording";
  else if (isGenerating) waveformMode = "thinking";
  else if (voiceOutput.isSpeaking) waveformMode = "speaking";

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
        <ChatHistory
          messages={messages}
          onPromptSelect={handlePromptSelect}
        />
        <StatusIndicator status={status} />
        <Waveform mode={waveformMode} analyserNode={audioAnalyser.analyserNode} />
        <VoiceControls
          isRecording={conversationActive}
          onToggle={handleToggleMic}
          disabled={isGenerating}
        />
        {conversationActive && (
          <p className="stop-hint">Say &quot;stop&quot; to end the conversation</p>
        )}
      </MainPanel>
    </div>
  );
}
