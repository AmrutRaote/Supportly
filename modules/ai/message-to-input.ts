// helps to convert the user's message to openai compatible message 
import { Message, MESSAGE_ROLE } from "@/lib/generated/prisma/client";
import { assistant, user, type AgentInputItem } from "@openai/agents";

// help you to convert the saved DB messages into the format that openAI sdk expect
export function messageToInput(messages: Message[]): AgentInputItem[] {
  return messages.map((message) => {
    if (message.role === MESSAGE_ROLE.USER) {
      return user(message.content);
    }

    return assistant(message.content);
  });
}