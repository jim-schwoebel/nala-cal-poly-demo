import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationSidebar } from "./conversation-sidebar";
import { ConversationHeader } from "./conversation-header";
import { MainPanel } from "./main-panel";
import { ChatHistory } from "./chat-history";
import type { Status } from "./status-indicator";
import { VoicePanel } from "./voice-panel";
import { ModelLoader } from "./model-loader";
import { MicPermissionModal } from "./mic-permission-modal";
import { DeleteToast } from "./delete-toast";
import { useConversations } from "../hooks/use-conversations";
import { useMessages } from "../hooks/use-messages";
import { useWebLLM } from "../hooks/use-web-llm";
import { useVoiceInput } from "../hooks/use-voice-input";
import { useVoiceOutput } from "../hooks/use-voice-output";
import { useAudioAnalyser } from "../hooks/use-audio-analyser";
import type { Conversation } from "@nala/shared";

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversationActive, setConversationActive] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteToast, setDeleteToast] = useState<{ conversation: Conversation; messages: any[] } | null>(null);
  const { conversations, create, remove, updateTitle } = useConversations();
  const { messages, isGenerating, sendMessage } = useMessages(selectedId);
  const webLLM = useWebLLM();
  const voiceInput = useVoiceInput();
  const voiceOutput = useVoiceOutput();
  const audioAnalyser = useAudioAnalyser();
  const selectedIdRef = useRef(selectedId);
  const messagesRef = useRef(messages);
  const conversationActiveRef = useRef(conversationActive);
  const micPermissionGranted = useRef(false);
  const lastSpokenMsgId = useRef<string | null>(null);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { conversationActiveRef.current = conversationActive; }, [conversationActive]);

  // Initialize WebLLM on mount
  useEffect(() => {
    webLLM.init();
  }, []);

  // Check media query for mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const autoResumeListen = useCallback(() => {
    if (conversationActiveRef.current) {
      audioAnalyser.start().then(() => {
        voiceInput.startListening();
      });
    }
  }, []);

  // When voice input completes, check for "stop" or send message
  useEffect(() => {
    if (!voiceInput.isListening && voiceInput.transcript && selectedIdRef.current) {
      const transcript = voiceInput.transcript;
      audioAnalyser.stop();

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

  // Cancel playback when switching conversations and mark history as "already seen"
  const suppressNextMessages = useRef(false);
  useEffect(() => {
    voiceOutput.cancel();
    suppressNextMessages.current = true;
  }, [selectedId]);

  // Speak assistant response — skip messages loaded from history
  useEffect(() => {
    if (suppressNextMessages.current) {
      suppressNextMessages.current = false;
      return;
    }
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        voiceOutput.speak(lastMessage.content, autoResumeListen);
      }
    }
  }, [messages]);

  const startMicSession = useCallback(async () => {
    let convoId = selectedId;
    if (!convoId) {
      const convo = await create();
      convoId = convo.id;
      setSelectedId(convo.id);
    }
    setConversationActive(true);
    await audioAnalyser.start();
    voiceInput.startListening();
    // Close sidebar on mobile
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, [selectedId]);

  const handleToggleMic = useCallback(async () => {
    if (conversationActive) {
      setConversationActive(false);
      voiceInput.stopListening();
      voiceOutput.cancel();
      audioAnalyser.stop();
    } else {
      // Show permission modal on first use
      if (!micPermissionGranted.current) {
        setShowMicModal(true);
      } else {
        await startMicSession();
      }
    }
  }, [conversationActive, selectedId, startMicSession]);

  const handleMicAllow = useCallback(async () => {
    setShowMicModal(false);
    micPermissionGranted.current = true;
    await startMicSession();
  }, [startMicSession]);

  const handleMicDeny = useCallback(() => {
    setShowMicModal(false);
  }, []);

  const handleCreate = useCallback(async () => {
    setConversationActive(false);
    voiceInput.stopListening();
    voiceOutput.cancel();
    audioAnalyser.stop();
    const convo = await create();
    setSelectedId(convo.id);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, [create]);

  const handleDelete = useCallback(
    async (id: string) => {
      // Find conversation for toast
      const convo = conversations.find((c) => c.id === id);
      if (convo) {
        setDeleteToast({ conversation: convo, messages: [] });
      }
      await remove(id);
      if (selectedId === id) {
        setSelectedId(null);
        setConversationActive(false);
      }
    },
    [remove, selectedId, conversations]
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
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, [selectedId]);

  // Get current conversation title
  const currentTitle = conversations.find((c) => c.id === selectedId)?.title || null;

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

  if (!webLLM.isReady) {
    return <ModelLoader progress={webLLM.loadProgress} error={webLLM.error} />;
  }

  return (
    <div className="app">
      {showMicModal && (
        <MicPermissionModal onAllow={handleMicAllow} onDeny={handleMicDeny} />
      )}

      {deleteToast && (
        <DeleteToast
          conversationTitle={deleteToast.conversation.title || "New Conversation"}
          onUndo={() => {
            // Re-create is not possible after server delete, just dismiss
            setDeleteToast(null);
          }}
          onDismiss={() => setDeleteToast(null)}
        />
      )}

      <div className={`sidebar-backdrop ${sidebarOpen ? "sidebar-backdrop--visible" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className={`sidebar-drawer ${sidebarOpen ? "sidebar-drawer--open" : ""}`}>
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            if (window.innerWidth <= 768) setSidebarOpen(false);
          }}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </div>

      <MainPanel>
        <ConversationHeader
          title={currentTitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
        />
        <VoicePanel
          status={status}
          waveformMode={waveformMode}
          analyserNode={audioAnalyser.analyserNode}
          isRecording={voiceInput.isListening}
          onToggleMic={handleToggleMic}
          micDisabled={isGenerating}
          conversationActive={conversationActive}
          hasMessages={messages.length > 0}
          onPromptSelect={handlePromptSelect}
        />
        <ChatHistory
          messages={messages}
          isGenerating={isGenerating}
          isSpeaking={voiceOutput.isSpeaking}
        />
      </MainPanel>
    </div>
  );
}
