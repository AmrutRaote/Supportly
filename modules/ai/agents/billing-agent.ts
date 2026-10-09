import { Agent } from "@openai/agents"
import { withHandoffInstructions } from "../prompts"
import type { SupportContext } from "../context"
import { billingTools } from "../tools/billing-tool";
import { createInputGuardrail, createOutputGuardrail } from "../gaurdrails";
import { escalationTools } from "../tools/escalation-tools";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export const billingAgent = new Agent<SupportContext>({
  name: "Billing Agent",
  handoffDescription:
    "Handles invoices, payments, refunds, and billing disputes.",
  instructions: withHandoffInstructions(`You are the Billing Agent for Supportly.
    Help customers with invoices, payments, and refunds.
    Use your tools to look up real invoice data before answering.
    Keep replies concise and friendly.
    Never invent invoice IDs or payment details.

    If the user asks to speak with a human, agent, or representative:
    1. Call create_human_escalation_ticket
    2. Confirm the ticket was created
    3. Tell them a human will follow up
    4. Do not try to solve the issue further after escalating`),
  model,
  tools: [...billingTools, ...escalationTools],
  inputGuardrails: [createInputGuardrail("Billing Agent")],
  outputGuardrails: [createOutputGuardrail("Billing Agent")],
});
