import { Agent } from "@openai/agents";
import { withHandoffInstructions } from "../prompts";
import { billingAgent } from "./billing-agent";
import { shippingAgent } from "./shipping-agent";
import { technicalAgent } from "./technical-agent";
import { createInputGuardrail, createOutputGuardrail } from "../gaurdrails";
import { escalationTools } from "../tools/escalation-tools";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";


import { SupportContext } from "../context";

export const triageAgent = new Agent<SupportContext>({
  name: "Support Triage",
  instructions: withHandoffInstructions(`You are the front-line support triage agent for Supportly.
Your job is to understand the customer's question and hand off to the right specialist:

- Billing questions (invoices, payments, refunds) → hand off to Billing Agent
- Shipping questions (orders, tracking, delivery) → hand off to Shipping Agent
- Technical questions (bugs, crashes, tickets, how-to) → hand off to Technical Agent

For simple greetings or general questions you can handle yourself.
Always be friendly and concise.

If the user asks to speak with a human, agent, or representative:
1. Call create_human_escalation_ticket yourself (do not hand off first)
2. Confirm the ticket was created
3. Tell them a human will follow up
4. Do not try to solve the issue further after escalating`),
  model,
  tools: escalationTools,
  handoffs: [billingAgent, shippingAgent, technicalAgent],
  inputGuardrails: [createInputGuardrail("Support Triage")],
  outputGuardrails: [createOutputGuardrail("Support Triage")],
});