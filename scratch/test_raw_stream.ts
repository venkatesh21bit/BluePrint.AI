import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { AIMessage, HumanMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

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
});

const agentNode = async (state: any) => {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    temperature: 0,
  }).bindTools(tools);
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const app = new StateGraph(ClarificationStateAnnotation)
  .addNode('agent', agentNode)
  .addEdge(START, 'agent')
  .addEdge('agent', END)
  .compile();

async function run() {
  const stream = await app.streamEvents(
    { messages: [new HumanMessage("I am a software engineer. Extract my JTBD.")] },
    { version: 'v2' }
  );
  
  for await (const chunk of stream) {
    if (['on_chat_model_stream', 'on_chat_model_end', 'on_tool_start', 'on_tool_end'].includes(chunk.event)) {
      console.log('EVENT:', chunk.event);
      if (chunk.event === 'on_chat_model_end') {
         console.log('OUTPUT:', JSON.stringify(chunk.data.output, null, 2));
      }
    }
  }
}

run().catch(console.error);
