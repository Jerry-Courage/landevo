import React, { useState, useEffect, useRef } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Send,
  ShieldCheck,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  useListThreads,
  useGetThreadMessages,
  useSendMessage,
  getListThreadsQueryKey,
  getGetThreadMessagesQueryKey,
} from "@workspace/api-client-react";
import type { MessageThread, Message } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

function timeAgo(date: string | null | undefined) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function getOtherParticipant(thread: MessageThread, myId: number) {
  return thread.participants?.find((p) => p.id !== myId) ?? thread.participants?.[0];
}

function initials(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function BuyerMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: threads = [], isLoading: loadingThreads } = useListThreads({
    query: { refetchInterval: 15_000, queryKey: getListThreadsQueryKey() },
  });

  const selectedThread = (threads as MessageThread[]).find(
    (t: MessageThread) => t.id === selectedThreadId
  );

  const { data: messages = [], isLoading: loadingMessages } = useGetThreadMessages(
    selectedThreadId!,
    {
      query: {
        enabled: selectedThreadId !== null,
        refetchInterval: 5_000,
        queryKey: getGetThreadMessagesQueryKey(selectedThreadId!),
      },
    }
  );

  const { mutate: sendMessage, isPending: sending } = useSendMessage({
    mutation: {
      onSuccess: () => {
        setDraft("");
        qc.invalidateQueries({ queryKey: [`/api/threads/${selectedThreadId}/messages`] });
        qc.invalidateQueries({ queryKey: ["/api/threads"] });
      },
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select first thread
  useEffect(() => {
    if (selectedThreadId === null && threads.length > 0) {
      setSelectedThreadId((threads[0] as MessageThread).id);
    }
  }, [threads, selectedThreadId]);

  const filteredThreads = (threads as MessageThread[]).filter((t: MessageThread) => {
    if (!search) return true;
    const other = getOtherParticipant(t, user?.id ?? 0);
    const q = search.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(q) ||
      t.listingTitle?.toLowerCase().includes(q) ||
      t.lastMessage?.toLowerCase().includes(q)
    );
  });

  function handleSend() {
    if (!draft.trim() || selectedThreadId === null) return;
    sendMessage({ threadId: selectedThreadId, data: { content: draft.trim() } });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const otherParticipant = selectedThread
    ? getOtherParticipant(selectedThread, user?.id ?? 0)
    : null;

  return (
    <BuyerLayout>
      <div className="flex h-full w-full bg-background overflow-hidden">
        {/* Left Panel - Thread List */}
        <div className="w-full md:w-[300px] flex-shrink-0 border-r flex flex-col bg-card">
          <div className="p-4 border-b flex flex-col gap-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingThreads && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            )}

            {!loadingThreads && filteredThreads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Message an agent from a property listing to start a conversation.
                </p>
              </div>
            )}

            {filteredThreads.map((thread: MessageThread) => {
              const other = getOtherParticipant(thread, user?.id ?? 0);
              const isSelected = thread.id === selectedThreadId;
              const hasUnread = (thread.unreadCount ?? 0) > 0;

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm border shadow-sm bg-slate-700">
                      {initials(other?.name)}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-sm truncate pr-2 ${hasUnread ? "font-bold" : "font-semibold"}`}>
                        {other?.name ?? "Unknown"}
                      </h4>
                      <span
                        className={`text-[10px] flex-shrink-0 ${
                          hasUnread ? "text-primary font-bold" : "text-muted-foreground font-medium"
                        }`}
                      >
                        {timeAgo(thread.lastMessageAt ?? (thread as any).createdAt)}
                      </span>
                    </div>
                    {thread.listingTitle && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                          {thread.listingTitle}
                        </span>
                      </div>
                    )}
                    <p className={`text-xs truncate ${hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {thread.lastMessage ?? "No messages yet"}
                    </p>
                  </div>
                  {hasUnread && (
                    <Badge className="h-5 px-1.5 text-[10px] bg-primary text-white border-none hover:bg-primary self-center">
                      {thread.unreadCount}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Panel - Chat */}
        <div className="flex-1 flex-col min-w-0 bg-muted/30 hidden md:flex">
          {selectedThread && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm border">
                    {initials(otherParticipant.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{otherParticipant.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {otherParticipant.role?.replace("_", " ")}
                      {selectedThread.listingTitle && ` · ${selectedThread.listingTitle}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground">Secure Comm</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading messages…
                  </div>
                )}

                {!loadingMessages && (messages as Message[]).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <p className="text-sm font-semibold">No messages yet</p>
                    <p className="text-xs mt-1">Send a message to start the conversation.</p>
                  </div>
                )}

                {(messages as Message[]).map((msg: Message) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isMe ? "max-w-[80%] ml-auto justify-end" : "max-w-[80%]"}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 border mt-1">
                          {initials(msg.senderName)}
                        </div>
                      )}
                      <div className={isMe ? "text-right" : ""}>
                        <div
                          className={`rounded-2xl p-3 shadow-sm text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-card border rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium mt-1 block mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-card border-t">
                <div className="flex items-end gap-3 bg-muted/30 border rounded-lg p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none focus:outline-none resize-none min-h-[40px] max-h-[120px] text-sm py-2 px-1"
                    placeholder={`Message ${otherParticipant.name}…`}
                    rows={1}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="w-9 h-9 rounded-md mb-0.5 bg-primary hover:bg-primary/90"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium mt-2 px-1">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            /* No thread selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-40" />
              <p className="font-semibold text-foreground">Select a conversation</p>
              <p className="text-sm mt-1">
                Choose a thread on the left to read and reply to messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
