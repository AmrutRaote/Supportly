import { run } from "@openai/agents";
import prisma from "@/lib/db";
import { supportAgent } from "./agents";
import { messageToInput } from "./message-to-input";

async function saveUserMessage(conversationId: string, content: string) {
  await prisma.message.create({
    data: {
      conversationId,
      content,
      role: "USER",
    },
  });
}

async function saveAssistantMessage(
  conversationId: string,
  content: string,
) {
  await prisma.message.create({
    data: {
      conversationId,
      content,
      role: "ASSISTANT",
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function runStreamingSupportChat(
  conversationId: string,
  userMessage: string,
) {
  await saveUserMessage(conversationId, userMessage);

  const messages = await getConversationMessages(conversationId);

  const agentStream = await run(supportAgent, messageToInput(messages), {
    stream: true,
  });

  const textStream = agentStream.toTextStream();
  let assistantReply = "";

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of textStream) {
          assistantReply += chunk;
          controller.enqueue(chunk);
        }

        await agentStream.completed;
        await saveAssistantMessage(conversationId, assistantReply);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function readTextStream(
  response: Response,
  onUpdate: (fullText: string) => void,
) {
  if (!response.body) {
    throw new Error("No response stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    fullText += decoder.decode(value, { stream: true });
    onUpdate(fullText);
  }

  return fullText;
}