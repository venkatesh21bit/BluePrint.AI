import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const PlannerStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      const rightArray = Array.isArray(right) ? right : [right];
      return [...left, ...rightArray];
    },
    default: () => [],
  }),
  startupPlan: Annotation<string | null>({
    reducer: (left: string | null, right: string | null) => right,
    default: () => null,
  }),
  marketData: Annotation<any | null>({
    reducer: (left: any | null, right: any | null) => right,
    default: () => null,
  }),
  stepCount: Annotation<number>({
    reducer: (left: number, right: number) => left + right,
    default: () => 0,
  })
});

const searchWeb = tool(
  async ({ query }) => {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query,
          search_depth: "basic",
          include_answer: false,
        })
      });
      const data = await response.json();
      return JSON.stringify({ results: data.results?.slice(0, 5) || [] });
    } catch (err) {
      return JSON.stringify({ error: 'Search failed' });
    }
  },
  {
    name: 'search_web',
    description: "Searches the web for real-time information, competitors, YC startup ideas, or market validation. Use this to find real-world context for market sizing and competitors.",
    schema: z.object({
      query: z.string().describe("The search query to look up on the web")
    })
  }
);

const draftStartupPlan = tool(
  async ({ tam, sam, som, competitors, targetAudience, gtmStrategy, markdown_content }) => {
    return JSON.stringify({ 
      args: { tam, sam, som, competitors, targetAudience, gtmStrategy, markdown_content },
      startupPlan: markdown_content,
      marketData: { tam, sam, som, competitors, targetAudience, gtmStrategy }
    });
  },
  {
    name: 'draft_startup_plan',
    description: 'Generates the final startup document when enough information has been gathered.',
    schema: z.object({
      tam: z.string().describe("Total Addressable Market size and explanation"),
      sam: z.string().describe("Serviceable Available Market size and explanation"),
      som: z.string().describe("Serviceable Obtainable Market size and explanation"),
      competitors: z.array(z.string()).describe("List of main competitors"),
      targetAudience: z.string().describe("Description of the primary target audience"),
      gtmStrategy: z.string().describe("Initial Go-To-Market strategy"),
      markdown_content: z.string().describe("The comprehensive markdown document for the startup plan")
    })
  }
);

const tools = [searchWeb, draftStartupPlan];

const toolNode = async (state: typeof PlannerStateAnnotation.State, config?: any) => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCalls = lastMessage.tool_calls || [];
  
  let draft = state.startupPlan;
  let mData = state.marketData;
  const toolMessages: BaseMessage[] = [];

  for (const tc of toolCalls) {
    const matchedTool = tools.find(t => t.name === tc.name);
    if (!matchedTool) continue;

    const resultStr = await (matchedTool as any).invoke(tc.args, config);
    try {
      const resultObj = JSON.parse(resultStr);
      if (resultObj.startupPlan) draft = resultObj.startupPlan;
      if (resultObj.marketData) mData = resultObj.marketData;
      
      toolMessages.push(new ToolMessage({
        tool_call_id: tc.id!,
        name: tc.name,
        content: resultStr
      }));
    } catch (e) {
      toolMessages.push(new ToolMessage({
        tool_call_id: tc.id!,
        name: tc.name,
        content: resultStr
      }));
    }
  }

  return {
    messages: toolMessages,
    startupPlan: draft,
    marketData: mData,
    stepCount: 1
  };
};

const agentNode = async (state: typeof PlannerStateAnnotation.State) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    temperature: 0,
  }).bindTools(tools);

  if (state.stepCount >= 5) {
    return {
      messages: [new AIMessage("I noticed we are looping. Could you clarify your idea a bit more?")]
    };
  }

  const response = await model.invoke(state.messages);
  return {
    messages: [response],
    stepCount: 1
  };
};

const routeLogic = (state: typeof PlannerStateAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
};

async function createPlannerAgent() {
  const workflow = new StateGraph(PlannerStateAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", routeLogic)
    .addEdge("tools", "agent");

  return workflow.compile();
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const langchainMessages: BaseMessage[] = [];
  
  langchainMessages.push(new SystemMessage(
    "You are an elite Startup Planner. You are integrated with a dashboard that ONLY works if you execute function calls.\n" +
    "CRITICAL RULES:\n" +
    "1. You MUST NOT tell the user 'I have generated a plan' or 'I have done market analysis' as plain text unless you have ACTUALLY called the `search_web` and `draft_startup_plan` tools!\n" +
    "2. To research, you MUST physically execute the `search_web` tool call.\n" +
    "3. To draft the plan, you MUST physically execute the `draft_startup_plan` tool call.\n" +
    "4. If you understand the user's idea, immediately call `search_web` now. Do not respond with a conversational confirmation first.\n" +
    "5. Your `draft_startup_plan`'s `markdown_content` argument MUST explicitly contain sections for: Market Analysis, Opportunity Solution Tree (OST), Prioritized Risk Assumptions, JTBD Stories, and Mom Test Questions."
  ));

  messages.forEach((m: any) => {
    let textContent = m.content || m.text || '';
    if (Array.isArray(m.content)) {
      textContent = m.content.find((c: any) => c.type === 'text')?.text || '';
    } else if (m.parts && m.parts.length > 0) {
      const partsText = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
      if (partsText) textContent = partsText;
    }

    if (m.role === 'user') {
      langchainMessages.push(new HumanMessage(textContent));
    } else if (m.role === 'assistant') {
      let msg = new AIMessage({ content: textContent });

      if (m.parts && m.parts.length > 0) {
        const tcs: any[] = [];
        m.parts.forEach((p: any) => {
          if (p.type === 'tool-invocation') {
            const toolName = p.toolInvocation?.toolName || p.toolName;
            const toolCallId = p.toolInvocation?.toolCallId || p.toolCallId;
            let args = p.toolInvocation?.args || p.toolInvocation?.input || p.args || p.input;
            
            tcs.push({ id: toolCallId, name: toolName, args });
          }
        });
        msg.tool_calls = tcs;
        langchainMessages.push(msg);

        // Inject dummy ToolMessages
        tcs.forEach((tc) => {
          langchainMessages.push(new ToolMessage({
            tool_call_id: tc.id,
            name: tc.name,
            content: "Tool executed in a previous turn."
          }));
        });
      } else {
        langchainMessages.push(msg);
      }
    } else if (m.role === 'system') {
       langchainMessages.push(new SystemMessage(textContent));
    }
  });

  const app = await createPlannerAgent();

  const stream = await app.streamEvents(
    { messages: langchainMessages, startupPlan: null, marketData: null },
    { version: 'v2' }
  );

  function sseEvent(data: object): string {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  const encoder = new TextEncoder();
  let currentTextId: string | null = null;
  let textIdCounter = 0;
  const pendingToolCallIds: Array<{ id: string; name: string }> = [];

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.event === 'on_chat_model_stream') {
            const content = chunk.data?.chunk?.content;
            
            let text = '';
            if (typeof content === 'string') {
              text = content;
            } else if (Array.isArray(content)) {
              for (const part of content) {
                if (typeof part === 'string') text += part;
                else if (part?.type === 'text' && part.text) text += part.text;
              }
            }

            if (text.length > 0) {
              if (!currentTextId) {
                currentTextId = `text-${textIdCounter++}`;
                controller.enqueue(encoder.encode(sseEvent({
                  type: 'text-start',
                  id: currentTextId
                })));
              }
              controller.enqueue(encoder.encode(sseEvent({
                type: 'text-delta',
                id: currentTextId,
                delta: text
              })));
            }
          } else if (chunk.event === 'on_chat_model_end') {
            if (currentTextId) {
              controller.enqueue(encoder.encode(sseEvent({
                type: 'text-end',
                id: currentTextId
              })));
              currentTextId = null;
            }

            const output = chunk.data?.output;
            const toolCalls = output?.kwargs?.tool_calls || output?.tool_calls;
            if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
              for (const tc of toolCalls) {
                pendingToolCallIds.push({ id: tc.id, name: tc.name });

                controller.enqueue(encoder.encode(sseEvent({
                  type: 'tool-input-start',
                  toolCallId: tc.id,
                  toolName: tc.name,
                  dynamic: true
                })));
                controller.enqueue(encoder.encode(sseEvent({
                  type: 'tool-input-available',
                  toolCallId: tc.id,
                  toolName: tc.name,
                  input: tc.args,
                  dynamic: true
                })));
              }
            }
          } else if (chunk.event === 'on_tool_end') {
            const toolOutput = chunk.data?.output;
            const toolName = chunk.name;
            
            let matched: { id: string; name: string } | undefined;
            const idx = pendingToolCallIds.findIndex(p => p.name === toolName);
            if (idx >= 0) {
              matched = pendingToolCallIds.splice(idx, 1)[0];
            } else if (pendingToolCallIds.length > 0) {
              matched = pendingToolCallIds.shift();
            }

            if (matched) {
              let result: any = toolOutput;
              if (typeof toolOutput === 'string') {
                try { result = JSON.parse(toolOutput); } catch(e) {}
              }
              controller.enqueue(encoder.encode(sseEvent({
                type: 'tool-output-available',
                toolCallId: matched.id,
                output: result,
                dynamic: true
              })));
            }
          }
        }
        if (currentTextId) {
          controller.enqueue(encoder.encode(sseEvent({
            type: 'text-end',
            id: currentTextId
          })));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (err) {
        console.error('Stream error:', err);
        controller.enqueue(encoder.encode(sseEvent({
          type: 'error',
          errorText: (err as Error).message || 'Stream error'
        })));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
