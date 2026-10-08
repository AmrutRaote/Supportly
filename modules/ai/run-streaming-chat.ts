import { run } from "@openai/agents";
import prisma from "@/lib/db";
import { messageToInput } from "./message-to-input";
import { SupportContext } from "./context";
import { triageAgent } from "./agents/triage-agent";
import { MESSAGE_ROLE } from "@/lib/generated/prisma/enums";

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
  activeAgentName: string | null,
  toolsUsed: string | null,
) {
  await prisma.message.create({
    data: {
      conversationId,
      content,
      role: MESSAGE_ROLE.ASSISTANT,
      activeAgentName,
      toolsUsed 
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

type ChatStreamEvent = 
  | { type: "agent";  name: string}
  | { type: "tool";  name: string}
  | { type: "text";  name: string}

function getToolName(item: {
  type?: string;
  rawItem?: { type?: string; name?: string };
}) {
  if (
    item.type === "tool_call_item" &&
    item.rawItem?.type === "function_call" &&
    item.rawItem.name
  ) {
    return item.rawItem.name;
  }

  return null;
}
function encodeEvent(event: ChatStreamEvent) {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`)
}



export async function runStreamingSupportChat(
  conversationId: string,
  userMessage: string,
  context: SupportContext,
) {
  await saveUserMessage(conversationId, userMessage);

  const messages = await getConversationMessages(conversationId);

  const agentStream = await run(triageAgent, messageToInput(messages), {
    stream: true,
    context
  });

  const textStream = agentStream.toTextStream();
  let assistantReply = "";
  let activeAgentName: string | null = triageAgent.name
  const toolsUsed: string[] = []

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (activeAgentName) {
          controller.enqueue(
            encodeEvent({type: "agent", name:activeAgentName})
          )
        }

        for await (const event of agentStream) {
          if (event.type === "agent_updated_stream_event") {
            activeAgentName = event.agent.name
            controller.enqueue(
              encodeEvent({ type: "text", name: activeAgentName})
            )
          }
          
          if (event.type === "raw_model_stream_event" && event.data.type == "output_text_delta") {
            const delta = event.data.delta
            controller.enqueue(
              encodeEvent({ type: "text", delta: delta})
            )
          }
        }

        await agentStream.completed
        await saveAssistantMessage(conversationId, assistantReply, activeAgentName, toolsUsed)
        
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