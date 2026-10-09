// use-chat-stream.ts brings the AI to life by animating its thoughts, tool usage, and text on the screen in real-time.
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { readChatStream } from "../lib/read-chat-stream";

type SendMessageInput = {
  conversationId: string;
  content: string;
  onChunk?: () => void;
};

export function useChatStream(onMessagesChange: () => Promise<unknown>) {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingAgentName, setStreamingAgentName] = useState<string | null>(
    null,
  );
  const [streamingTools, setStreamingTools] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  async function sendMessage({
    conversationId,
    content,
    onChunk,
  }: SendMessageInput) {
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingAgentName(null);
    setStreamingTools([]);
    setLockedNotice(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send message");
      }

      // hook checks the X-Conversation-Locked header. If it's locked, it stops the user from continuing the chat.
      const wasLocked = response.headers.get("X-Conversation-Locked") === "true";

      if (!wasLocked) {
        await onMessagesChange();
      }

      const fullText = await readChatStream(response, {
        onAgent: setStreamingAgentName,   // set the agent name to display on the frontend
        onTool: (toolName) => {  // set the tool name to display on the frontend
          setStreamingTools((current) =>
            current.includes(toolName) ? current : [...current, toolName],
          );
          onChunk?.();
        },
        onText: (text) => {
          setStreamingContent(text);
          onChunk?.();
        },
      });

      if (wasLocked) {
        setLockedNotice(fullText);
        setStreamingContent("");
        setStreamingAgentName(null);
        setStreamingTools([]);
        await queryClient.invalidateQueries({
          queryKey: ["open-ticket", conversationId],
        });
        return fullText;
      }

      setStreamingContent("");
      setStreamingAgentName(null);
      setStreamingTools([]);
      await onMessagesChange();
      await queryClient.invalidateQueries({
        queryKey: ["open-ticket", conversationId],
      });

      return fullText;
    } finally {
      setIsStreaming(false);
    }
  }

  return {
    sendMessage,
    isStreaming,
    streamingContent,
    streamingAgentName,
    streamingTools,
    lockedNotice,
  };
}