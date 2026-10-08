import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { runStreamingSupportChat } from "@/modules/ai/run-streaming-chat";
import { headers } from "next/headers";


const streamHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache"
}


export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return new Response("Unauthorized", {status: 401})
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response("OpenAI API key is not set", { status: 500 })
    }

    const { conversationId, content } = await request.json()
    
    if (!conversationId || !content) {
        return new Response("Conversation ID and the content are required", {status: 400})
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: session.user.id
        }
    })

    if (!conversation) {
        return new Response("Conversation not found", {status: 404})
    }

    const stream = await runStreamingSupportChat(conversationId,content)

    return new Response(
        stream,
        { headers: streamHeaders }
    )
}