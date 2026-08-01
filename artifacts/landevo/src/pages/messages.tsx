import React, { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Phone, Video, Info, MoreVertical, Paperclip, Image as ImageIcon, Send, ShieldCheck, MapPin, Loader2, MessageSquare } from "lucide-react";
import {
  useListThreads,
  useGetThreadMessages,
  useSendMessage,
  getGetThreadMessagesQueryKey,
  getListThreadsQueryKey,
} from "@workspace/api-client-react";
import type { MessageThread } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/format";
import { ChevronRight } from "lucide-react";

function threadTime(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return formatDate(dateStr);
}

function getOtherParticipant(thread: MessageThread, currentUserId?: number) {
  if (!thread.participants || thread.participants.length === 0) return null;
  const other = thread.participants.find((p) => p.id !== currentUserId);
  return other ?? thread.participants[0];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useListThreads();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages = [], isLoading: messagesLoading } = useGetThreadMessages(
    selectedThreadId ?? 0,
    { query: { enabled: !!selectedThreadId } as any }
  );

  const { mutate: send, isPending: isSending } = useSendMessage({
    mutation: {
      onSuccess: () => {
        setMessageText("");
        queryClient.invalidateQueries({ queryKey: getGetThreadMessagesQueryKey(selectedThreadId ?? 0) });
        queryClient.invalidateQueries({ queryKey: getListThreadsQueryKey() });
      },
    },
  });

  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null;

  const filteredThreads = threads.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const other = getOtherParticipant(t);
    return (
      other?.name?.toLowerCase().includes(q) ||
      t.listingTitle?.toLowerCase().includes(q) ||
      t.lastMessage?.toLowerCase().includes(q)
    );
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedThreadId) return;
    send({
      threadId: selectedThreadId,
      data: { content: messageText.trim() },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select first thread automatically
  useEffect(() => {
    if (threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  const otherParticipant = selectedThread ? getOtherParticipant(selectedThread) : null;

  return (
    <AppLayout>
      <div className="flex h-full w-full bg-background overflow-hidden">
        
        {/* Left Panel - Inbox */}
        <div className="w-[300px] flex-shrink-0 border-r flex flex-col bg-card">
          <div className="p-4 border-b flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8"><Filter className="w-4 h-4" /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inbox..."
                className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No conversations yet.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const other = getOtherParticipant(thread);
                const isSelected = thread.id === selectedThreadId;
                const hasUnread = thread.unreadCount > 0;
                return (
                  <div
                    key={thread.id}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 ${isSelected ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm border shadow-sm">
                        {other ? initials(other.name) : '??'}
                      </div>
                      {hasUnread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`text-sm truncate pr-2 ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                          {other?.name ?? 'Unknown'}
                        </h4>
                        <span className={`text-[10px] flex-shrink-0 ${hasUnread ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                          {threadTime(thread.lastMessageAt)}
                        </span>
                      </div>
                      {thread.listingTitle && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">{thread.listingTitle}</span>
                        </div>
                      )}
                      <p className={`text-xs truncate ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {thread.lastMessage ?? 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Panel - Chat */}
        {selectedThread ? (
          <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
            {/* Chat Header */}
            <div className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm border">
                    {otherParticipant ? initials(otherParticipant.name) : '??'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{otherParticipant?.name ?? 'Unknown'}</h3>
                  {selectedThread.listingTitle && (
                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">{selectedThread.listingTitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-border mx-1"></div>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Info className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedThread.listingTitle && (
                <div className="flex justify-center my-2">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-md w-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-primary tracking-wider mb-0.5">INQUIRY FOR PROPERTY</p>
                      <p className="font-bold text-sm text-foreground">{selectedThread.listingTitle}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white">View</Button>
                  </div>
                </div>
              )}

              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm font-medium">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = otherParticipant && msg.senderId !== otherParticipant.id;
                  return isMine ? (
                    <div key={msg.id} className="flex gap-3 max-w-[80%] ml-auto justify-end">
                      <div className="text-right">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 shadow-sm text-sm">
                          {msg.content}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.readAt && <span className="text-[10px] text-primary font-bold">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs flex-shrink-0 border mt-1">
                        {initials(msg.senderName)}
                      </div>
                      <div>
                        <div className="bg-card border rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm">
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium ml-1 mt-1 block">
                          {new Date(msg.createdAt).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-card border-t">
              <div className="flex items-end gap-3 bg-muted/30 border rounded-lg p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <div className="flex gap-1 pb-1 pl-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:bg-background"><Paperclip className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:bg-background"><ImageIcon className="w-4 h-4" /></Button>
                </div>
                <textarea 
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none min-h-[40px] max-h-[120px] text-sm py-2 px-1"
                  placeholder="Type a message..."
                  rows={1}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                ></textarea>
                <Button
                  size="icon"
                  className="w-9 h-9 rounded-md mb-0.5"
                  onClick={handleSend}
                  disabled={isSending || !messageText.trim()}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-muted-foreground font-medium">Press Enter to send, Shift + Enter for new line</span>
                <div className="flex gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-primary"/> Escrow Secure</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] text-muted-foreground gap-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm">Choose from the inbox to start messaging.</p>
          </div>
        )}

        {/* Right Panel - Contact Info */}
        {selectedThread && otherParticipant && (
          <div className="w-[260px] flex-shrink-0 border-l bg-card flex flex-col hidden lg:flex">
            <div className="p-6 border-b flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center font-bold text-2xl border-4 border-background shadow-sm mb-3">
                {initials(otherParticipant.name)}
              </div>
              <h3 className="font-bold text-lg leading-tight">{otherParticipant.name}</h3>
              <Badge variant="outline" className="mt-2 text-[10px] font-bold tracking-wider uppercase">
                {otherParticipant.role}
              </Badge>
            </div>
            
            {selectedThread.listingTitle && (
              <div className="p-5 border-b">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">LINKED PROPERTY</p>
                <div className="border rounded-md overflow-hidden cursor-pointer">
                  <div className="h-20 bg-muted relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
                  </div>
                  <div className="p-2.5 bg-background">
                    <h4 className="text-xs font-bold truncate mb-0.5">{selectedThread.listingTitle}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 hover:underline">View listing details →</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">QUICK ACTIONS</p>
              <button className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors py-1">
                Shared Media <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors py-1">
                Documents <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-auto p-5 border-t space-y-2">
              <button className="w-full text-left text-xs font-semibold text-destructive hover:underline py-1">Report User</button>
              <button className="w-full text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1">Mute Notifications</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
