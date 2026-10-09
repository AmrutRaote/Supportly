"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createConversation, deleteConversation, getConversations, updateConversation } from "../actions"

// Fetches all conversations from your backend using getConversations
// By tagging this data with ["conversations"], React Query saves the result in memory
// useQuery loads the data on page loads and store it in the memory
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
}

// used to create a new conversion
// When you modify data on the server, you use useMutation
// useMutation is used to save the data on server side
export function useCreateConversion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (title?: string) => createConversation(title),
        onSuccess: () => {
            // invalidate the data which we stored in the ["conversations"] and then automatically runs the getConversations 
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