"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createConversation, deleteConversation, getConversations, updateConversation } from "../actions"

// Fetches all conversations from your backend using getConversations
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
}

// used to create a new conversion
// When you modify data on the server, you use useMutation
export function useCreateConversion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (title?: string) => createConversation(title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"]})
        }
    })
}

export function useUpdateConversion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, title} : {id : string, title: string}) => updateConversation(id, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"]})
        }
    })
}

export function useDeleteConversion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id : string) => deleteConversation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"]})
        }
    })
}