import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { toUIMessageStream } from '@ai-sdk/langchain';
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Dummy tool
const extractJtbdInsight = tool(
  async ({ role }) => {
    return JSON.stringify({
      insight: { id: '1', category: 'JTBD', fact: `Role: ${role}`, evidenceStrength: 0.8, sourceContext: '' }
    });
  },
  {
    name: 'extract_jtbd_insight',
    description: 'Extracts JTBD',
    schema: z.object({ role: z.string() }),
  }
);

const tools = [extractJtbdInsight];

const ClarificationStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => [...left, ...(Array.isArray(right) ? right : [right])],
    default: () => [],
  }),
  stepCount: Annotation<number>({
    reducer: (left, right) => left + right,
    default: () => 0,
  })
});

const agentNode = async (state: any) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    temperature: 0,
  }).bindTools(tools);
  const response = await model.invoke(state.messages);
  return { messages: [response], stepCount: 1 };
};

const toolNode = async (state: any, config?: any) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];
  const toolMessages = [];
  
  for (const tc of toolCalls) {
    const matchedTool = tools.find(t => t.name === tc.name);
    const resultStr = await (matchedTool as any).invoke(tc.args, config);
    toolMessages.push(new ToolMessage({ tool_call_id: tc.id, name: tc.name, content: resultStr }));
  }
  return { messages: toolMessages, stepCount: 1 };
};

const shouldContinue = (state: any) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (state.stepCount >= 5) return END;
  if (lastMessage && "tool_calls" in lastMessage && lastMessage.tool_calls?.length) return 'tools';
  return END;
};

const app = new StateGraph(ClarificationStateAnnotation)
  .addNode('agent', agentNode)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue, { tools: 'tools', [END]: END })
  .addEdge('tools', 'agent')
  .compile();

async function run() {
  const stream = await app.streamEvents(
    { messages: [new HumanMessage("I am a software engineer. Extract my JTBD.")] },
    { version: 'v2' }
  );
  
  const uiStream = toUIMessageStream(stream);
  const reader = uiStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(value);
  }
}

run().catch(console.error);
