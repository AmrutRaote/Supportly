# Supportly 

### Demo - https://supportly-gules.vercel.app/

Supportly is an intelligent customer support application built using **Next.js**, **Prisma**, **Tailwind CSS**, and **@openai/agents**. It utilizes a multi-agent AI system designed to automatically handle customer inquiries across different domains, ranging from billing and shipping to technical support, while providing real-time streaming responses and maintaining strict safety guardrails.

## Features & Agent Workflow

The core of Supportly is driven by **Multi-agent orchestration**, where a primary triage agent manages the workflow and seamlessly hands off tasks to specialized agents based on the context of the user's inquiry.

### The Agents
1. **Triage Agent (Front-line)**: The first point of contact for the user. It can handle basic greetings and general inquiries. If a request requires specific domain knowledge, the Triage Agent automatically **hands off** the conversation to the appropriate specialist agent.
2. **Billing Agent**: Specialized in handling financial tasks such as invoices, payments, and refunds.
3. **Shipping Agent**: Specialized in retrieving order statuses, tracking information, and delivery updates.
4. **Technical Agent**: Specialized in assisting with bugs, crashes, how-to guides, and checking human support tickets.

*Workflow Note*: If a customer explicitly asks to speak with a human at any point, any agent can utilize the escalation tools to create a human support ticket rather than attempting to resolve it further.

## Streaming with ReadableStream

To provide a snappy, real-time user experience, Supportly uses the native Web `ReadableStream` API within its Next.js API routes (`run-streaming-chat.ts`).

- **Open Pipe**: The `ReadableStream` acts as an open connection to the browser, allowing the server to stream NDJSON (Newline Delimited JSON) events back to the UI.
- **Event Listening**: As the OpenAI `agentStream` generates content, the stream continuously listens for specific event types.
- **Real-Time UI Updates**: 
  - **Agent Handoffs**: When an `agent_updated_stream_event` is fired, the stream instantly notifies the frontend to update the active agent badge.
  - **Text Generation**: `raw_model_stream_event` provides tiny text chunks ("deltas"), which are piped directly to the UI for a typewriter effect.
  - **Tool Execution**: When an agent decides to use a tool, the frontend is notified to display a loading state for that specific action.

## Tools

Each agent is equipped with a specific set of tools (functions) to fetch real data or perform actions:

- **Billing Tools**:
  - `get_invoices`: List all invoices for a customer.
  - `get_invoice_details`: Retrieve specific invoice data.
  - `request_refund`: Submit a refund request.
- **Shipping Tools**:
  - `track_order`: Track an order via ID or tracking number.
  - `get_order_status`: Get a summary of recent orders.
- **Technical Tools**:
  - `search_knowledge_base`: Query the knowledge base for help articles.
  - `get_ticket_status`: Look up the status of a human support ticket.
- **Escalation Tools (Global)**:
  - `create_human_escalation_ticket`: Creates a high-priority ticket when a user demands human intervention.

## Guardrails

To ensure the AI remains safe, helpful, and secure, Supportly implements strict Input and Output Guardrails (`modules/ai/gaurdrails/index.ts`).

- **Input Guardrails**: Executed *before* the AI model is called. They intercept and block:
  - **Jailbreak attempts**: Prompts containing phrases like "ignore previous instructions" or "bypass security".
  - **Abusive language**: Prompts containing harmful or threatening words.
- **Output Guardrails**: Executed *after* the AI generates a response, right before it is sent to the user. They intercept and block:
  - **Secret Leaks**: Uses Regex patterns to detect and block API keys, passwords, and other sensitive credentials from being leaked in the chat.

If a guardrail is triggered, the run is safely blocked, and a friendly fallback message is returned to the user instead.

---

### Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
