import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse } from 'ai';
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export interface EmpiricalInsight {
  id: string;
  category: 'Target Audience' | 'Core Problem' | 'Current Alternatives' | 'JTBD';
  fact: string;
  evidenceStrength: number;
  sourceContext: string;
}

export const ClarificationStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      const rightArray = Array.isArray(right) ? right : [right];
      return [...left, ...rightArray];
    },
    default: () => [],
  }),
  insights: Annotation<EmpiricalInsight[]>({
    reducer: (left: EmpiricalInsight[], right: EmpiricalInsight | EmpiricalInsight[]) => {
      const rightArray = Array.isArray(right) ? right : [right];
      return [...left, ...rightArray];
    },
    default: () => [],
  }),
  completenessScore: Annotation<number>({
    reducer: (left: number, right: number) => right,
    default: () => 0,
  }),
  documentation_draft: Annotation<string | null>({
    reducer: (left: string | null, right: string | null) => right,
    default: () => null,
  }),
  stepCount: Annotation<number>({
    reducer: (left: number, right: number) => left + right,
    default: () => 0,
  })
});

function calculateCompleteness(insights: EmpiricalInsight[]): number {
  const categories = {
    'Target Audience': { weight: 0.25, required: 1 },
    'Core Problem': { weight: 0.35, required: 2 },
    'Current Alternatives': { weight: 0.20, required: 1 },
    'JTBD': { weight: 0.20, required: 1 },
  };

  const counts: Record<string, number> = {
    'Target Audience': 0,
    'Core Problem': 0,
    'Current Alternatives': 0,
    'JTBD': 0
  };

  for (const insight of insights) {
    if (counts[insight.category] !== undefined) {
      counts[insight.category]++;
    }
  }

  let K = 0;
  for (const [cat, config] of Object.entries(categories)) {
    const fraction = Math.min(1.0, counts[cat] / config.required);
    K += config.weight * fraction;
  }
  return K;
}

const extractJtbdInsight = tool(
  async ({ role, situation, motivation, expectedOutcome, sourceContext }) => {
    return JSON.stringify({
      insight: {
        id: Math.random().toString(36).substring(7),
        category: 'JTBD',
        fact: `Role: ${role}. Situation: ${situation}. Motivation: ${motivation}. Expected Outcome: ${expectedOutcome}.`,
        evidenceStrength: 0.8,
        sourceContext
      }
    });
  },
  {
    name: 'extract_jtbd_insight',
    description: 'Specifically maps user intent to the Jobs-to-be-Done framework.',
    schema: z.object({
      role: z.string().describe("The specific target persona"),
      situation: z.string().describe("The triggering event: 'When this happens...'"),
      motivation: z.string().describe("The core motivation: 'I want to...'"),
      expectedOutcome: z.string().describe("The underlying functional/emotional benefit: 'So that I can...'"),
      sourceContext: z.string().describe("Exact user quote from chat history validating this insight")
    }),
  }
);

const registerCurrentWorkaround = tool(
  async ({ alternativeName, monthlyExpenseCost, criticalGaps, sourceContext }) => {
    return JSON.stringify({
      insight: {
        id: Math.random().toString(36).substring(7),
        category: 'Current Alternatives',
        fact: `Alternative: ${alternativeName}. Cost: $${monthlyExpenseCost}/mo. Gaps: ${criticalGaps.join(', ')}`,
        evidenceStrength: 0.9,
        sourceContext
      }
    });
  },
  {
    name: 'register_current_workaround',
    description: "Documents what the target users do today to solve the problem.",
    schema: z.object({
      alternativeName: z.string().describe("Name of the competitor tool, spreadsheet, or manual process"),
      monthlyExpenseCost: z.number().describe("Estimated current money spent or manual hours wasted"),
      criticalGaps: z.array(z.string()).describe("Direct, unvarnished frustrations or failures in this alternative"),
      sourceContext: z.string().describe("Exact user quote from chat history")
    })
  }
);

const extractProblemInsight = tool(
  async ({ problemDescription, sourceContext }) => {
    return JSON.stringify({
      insight: {
        id: Math.random().toString(36).substring(7),
        category: 'Core Problem',
        fact: problemDescription,
        evidenceStrength: 0.85,
        sourceContext
      }
    });
  },
  {
    name: 'extract_problem_insight',
    description: "Documents a core pain or problem the target user faces.",
    schema: z.object({
      problemDescription: z.string().describe("Description of the pain point"),
      sourceContext: z.string().describe("Exact user quote from chat history")
    })
  }
);

const extractTargetAudienceInsight = tool(
  async ({ audienceDescription, sourceContext }) => {
    return JSON.stringify({
      insight: {
        id: Math.random().toString(36).substring(7),
        category: 'Target Audience',
        fact: audienceDescription,
        evidenceStrength: 0.85,
        sourceContext
      }
    });
  },
  {
    name: 'extract_target_audience_insight',
    description: "Documents the exact target audience experiencing the problem.",
    schema: z.object({
      audienceDescription: z.string().describe("Description of the target audience"),
      sourceContext: z.string().describe("Exact user quote from chat history")
    })
  }
);

const draftDocumentation = tool(
  async ({ markdown_content }) => {
    return JSON.stringify({ documentation_draft: markdown_content });
  },
  {
    name: 'draft_documentation',
    description: 'Converts the structured states of the system into an editorial-quality documentation.md artifact. Only runnable when Completeness Score K >= 0.85.',
    schema: z.object({
      markdown_content: z.string().describe("The comprehensive markdown documentation containing the finalized JTBD, Workarounds, and Problem context.")
    })
  }
);

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
          include_images: false,
          include_raw_content: false,
          max_results: 3,
        })
      });
      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }
      const data = await response.json();
      return JSON.stringify(data.results.map((r: any) => ({ title: r.title, content: r.content, url: r.url })));
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: 'search_web',
    description: "Searches the web for real-time information, competitors, YC startup ideas, or market validation. Use this to find real-world context.",
    schema: z.object({
      query: z.string().describe("The search query to look up on the web")
    })
  }
);

const tools = [extractJtbdInsight, registerCurrentWorkaround, extractProblemInsight, extractTargetAudienceInsight, draftDocumentation, searchWeb];

const toolNode = async (state: typeof ClarificationStateAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCalls = lastMessage.tool_calls || [];
  
  const newInsights: EmpiricalInsight[] = [];
  let draft = state.documentation_draft;
  const toolMessages: BaseMessage[] = [];

  for (const tc of toolCalls) {
    const matchedTool = tools.find(t => t.name === tc.name);
    if (!matchedTool) continue;

    if (tc.name === 'draft_documentation' && state.completenessScore < 0.85) {
      toolMessages.push(new ToolMessage({
        tool_call_id: tc.id!,
        name: tc.name,
        content: `ERROR: Completeness Score K is ${state.completenessScore.toFixed(2)}. It must be >= 0.85 to draft documentation.`
      }));
      continue;
    }

    const resultStr = await (matchedTool as any).invoke(tc.args, {});
    try {
      const resultObj = JSON.parse(resultStr);
      if (resultObj.insight) newInsights.push(resultObj.insight);
      if (resultObj.documentation_draft) draft = resultObj.documentation_draft;
      
      toolMessages.push(new ToolMessage({
        tool_call_id: tc.id!,
        name: tc.name,
        // Pass the actual result back to the LLM so it has context!
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

  const newScore = calculateCompleteness([...state.insights, ...newInsights]);

  return {
    messages: toolMessages,
    insights: newInsights,
    completenessScore: newScore,
    documentation_draft: draft,
    stepCount: 1
  };
};

const agentNode = async (state: typeof ClarificationStateAnnotation.State) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    temperature: 0,
  }).bindTools(tools);

  if (state.stepCount >= 5) {
    return {
      messages: [new AIMessage("I noticed we are looping. Could you clarify how you are tracking this problem today?")]
    };
  }

  const systemPrompt = new SystemMessage(`You are a highly analytical Startup Coach ReAct agent.
Your goal is to deeply understand the founder's product idea by gathering empirical facts.
Current Knowledge Completeness Score (K): ${state.completenessScore.toFixed(2)}/1.0.
Current Insights: ${JSON.stringify(state.insights, null, 2)}

Instructions:
1. Ask ONE highly specific clarifying question at a time.
2. If the user provides a concrete fact, call the appropriate extraction tool immediately (extract_jtbd_insight, register_current_workaround, extract_problem_insight, extract_target_audience_insight).
3. DO NOT call draft_documentation until K >= 0.85.
4. If you loop or fail, ask a direct human-style clarifying question.
5. You CAN and SHOULD use the searchWeb tool to look up existing companies, market validation, or YC requested ideas to ask more curated questions like 'How does your idea differ from [Competitor X]?' or 'YC is looking for [Y], how does your idea align with that?'. Do this proactively if you need more context about their market.`);

  const response = await model.invoke([systemPrompt, ...state.messages]);
  return { messages: [response], stepCount: 1 };
};

function shouldContinue(state: typeof ClarificationStateAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (state.stepCount >= 5) {
    return END;
  }
  
  if (lastMessage && "tool_calls" in lastMessage && (lastMessage as AIMessage).tool_calls?.length) {
    return 'tools';
  }
  
  return END;
}

async function createClarificationAgent() {
  const graph = new StateGraph(ClarificationStateAnnotation)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', shouldContinue, { tools: 'tools', [END]: END })
    .addEdge('tools', 'agent');

  return graph.compile();
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const insights: EmpiricalInsight[] = [];
  const langchainMessages: BaseMessage[] = [];

  messages.forEach((m: any) => {
    let textContent = m.content || m.text || '';
    if (m.parts && m.parts.length > 0) {
      const partsText = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
      if (partsText) textContent = partsText;
    }

    if (m.role === 'user') {
      langchainMessages.push(new HumanMessage(textContent));
    } else if (m.role === 'assistant') {
      const msg = new AIMessage(textContent);
      const tcs: any[] = [];
      
      const toolInvocations = m.toolInvocations || m.toolCalls || [];
      if (toolInvocations.length > 0) {
        toolInvocations.forEach((t: any) => {
          const toolName = t.toolName || t.name;
          const args = t.args;
          const toolCallId = t.toolCallId || t.id || Math.random().toString(36).substring(7);
          
          tcs.push({
            id: toolCallId,
            name: toolName,
            args: args,
          });

          if (['extract_jtbd_insight', 'extract_problem_insight', 'extract_target_audience_insight', 'register_current_workaround'].includes(toolName)) {
            let fact = '';
            let category: any = 'Core Problem';
            if (toolName === 'extract_jtbd_insight') {
               category = 'JTBD';
               fact = `Role: ${args.role}. Situation: ${args.situation}. Motivation: ${args.motivation}. Expected Outcome: ${args.expectedOutcome}.`;
            } else if (toolName === 'register_current_workaround') {
               category = 'Current Alternatives';
               fact = `Alternative: ${args.alternativeName}. Cost: $${args.monthlyExpenseCost}/mo. Gaps: ${args.criticalGaps?.join(', ')}`;
            } else if (toolName === 'extract_problem_insight') {
               category = 'Core Problem';
               fact = args.problemDescription;
            } else if (toolName === 'extract_target_audience_insight') {
               category = 'Target Audience';
               fact = args.audienceDescription;
            }
            insights.push({
              id: Math.random().toString(36).substring(7),
              category,
              fact,
              evidenceStrength: 0.85,
              sourceContext: args.sourceContext || ''
            });
          }
        });
        msg.tool_calls = tcs;
        langchainMessages.push(msg);

        // Inject dummy ToolMessages to satisfy Google API strict sequence rules
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

  const initialCompleteness = calculateCompleteness(insights);

  const app = await createClarificationAgent();

  const stream = await app.streamEvents(
    { messages: langchainMessages, insights, completenessScore: initialCompleteness },
    { version: 'v2' }
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream)
  });
}
