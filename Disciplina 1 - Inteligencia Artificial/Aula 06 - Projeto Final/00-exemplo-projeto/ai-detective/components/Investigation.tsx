"use client";

import { useCallback, useState } from "react";
import type { EvidenceMeta, Suspect, TimelineEvent } from "@/types";
import Header from "@/components/Header";
import { Panel, IconButton } from "@/components/ui/primitives";
import SuspectList from "@/components/suspects/SuspectList";
import EvidenceList from "@/components/evidence/EvidenceList";
import UploadEvidenceModal from "@/components/evidence/UploadEvidenceModal";
import TimelineView from "@/components/timeline/TimelineView";
import ChatPanel from "@/components/chat/ChatPanel";
import { useAgentChat } from "@/components/chat/useAgentChat";
import AgentTrace from "@/components/trace/AgentTrace";

// A tela inteira: sidebar com o caso, chat com o agente e painel de rastreio.
// Todo o "estado da conversa" vive no hook useAgentChat; aqui só montamos o layout.

type MobileTab = "chat" | "caso" | "trace";

const MOBILE_TABS: Array<{ key: MobileTab; label: string }> = [
  { key: "chat", label: "💬 Chat" },
  { key: "caso", label: "🗂️ Caso" },
  { key: "trace", label: "📡 Rastreio" },
];

export default function Investigation({
  caseInfo,
  suspects,
  timeline,
  initialEvidence,
  suggestions,
}: {
  caseInfo: { id: string; title: string };
  suspects: Suspect[];
  timeline: TimelineEvent[];
  initialEvidence: EvidenceMeta[];
  suggestions: string[];
}) {
  const chat = useAgentChat();
  const [evidence, setEvidence] = useState(initialEvidence);
  const [showUpload, setShowUpload] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");

  const refreshEvidence = useCallback(async () => {
    const res = await fetch("/api/evidence");
    if (res.ok) setEvidence((await res.json()).evidence);
  }, []);

  return (
    <>
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header caseTitle={caseInfo.title} caseId={caseInfo.id} />

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-bg-elevated/40 px-4 py-2 sm:px-6">
          <IconButton onClick={() => chat.sendMessage("Analise todas as evidências e proponha o suspeito mais provável.")} disabled={chat.isStreaming}>
            🔎 Analisar o caso
          </IconButton>
          <IconButton onClick={() => setShowUpload(true)}>📎 Nova evidência</IconButton>
          <IconButton onClick={chat.reset} disabled={chat.isStreaming} className="ml-auto" title="Limpa a conversa e o caderno de notas do agente">
            🧹 Nova investigação
          </IconButton>
        </div>

        <div className="flex gap-1 border-b border-border px-3 py-2 lg:hidden">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                mobileTab === tab.key ? "bg-accent-soft text-accent" : "text-ink-dim hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
          <div className="mx-auto grid h-full max-w-[1680px] grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className={`min-h-0 ${mobileTab === "caso" ? "block" : "hidden"} lg:block`}>
              <Panel className="scroll-thin h-full overflow-y-auto">
                <div className="flex flex-col gap-6">
                  <SuspectList suspects={suspects} />
                  <EvidenceList evidence={evidence} />
                  <TimelineView timeline={timeline} />
                </div>
              </Panel>
            </aside>

            <section className={`min-h-0 ${mobileTab === "chat" ? "block" : "hidden"} lg:block`}>
              <Panel className="flex h-full flex-col overflow-hidden">
                <ChatPanel
                  messages={chat.messages}
                  isStreaming={chat.isStreaming}
                  error={chat.error}
                  suggestions={suggestions}
                  onSend={chat.sendMessage}
                  onDecide={chat.decide}
                />
              </Panel>
            </section>

            <aside className={`min-h-0 ${mobileTab === "trace" ? "block" : "hidden"} lg:block`}>
              <Panel className="h-full overflow-hidden" noPadding>
                <div className="flex h-full flex-col p-4">
                  <AgentTrace steps={chat.steps} />
                </div>
              </Panel>
            </aside>
          </div>
        </main>
      </div>

      {showUpload && <UploadEvidenceModal onClose={() => setShowUpload(false)} onUploaded={refreshEvidence} />}
    </>
  );
}
