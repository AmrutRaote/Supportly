//  useMessages.ts makes sure your chat history is perfectly synced with the database
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMessage, deleteMessage, getMessages, updateMessage } from "../actions";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId, //If there is no active conversation selected yet, it won't pointlessly query the database.
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => createMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      // After successfully saving the user's message to the database, it invalidates two caches:
      // ["messages", conversationId] and ["conversations"]
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateMessage(id, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
    },
  });
}