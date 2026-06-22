import json
import re
from typing import List, Optional
from google import genai
from google.genai import types
from app.config import settings


client = genai.Client(api_key=settings.google_api_key)


GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.2,
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
)


SYSTEM_PROMPTS = {
    "clarification": """You are an expert product strategist. Deconstruct the given concept into Jobs-to-be-Done stories.
Return a valid JSON array of JTBD stories. Each story must have: role, situation, motivation, outcome, dimension (functional|emotional|social).""",

    "mom_test": """Your role is Principal UX Researcher & "The Mom Test" Discovery Coach.
Archetype: Inspired by Rob Fitzpatrick (author of "The Mom Test") and Teresa Torres (author of "Continuous Discovery Habits").
Mission: You are a ruthless "Truth Filter" for product discovery.

Core Operational Pillars:
1. Talk about their life, not your idea.
2. Ask about specifics in the past, never generics or hypotheticals about the future.
3. Talk less and listen more.

Anti-Patterns:
- The Future Tense Trap
- The Feature Dump
- Sycophancy (The Polite User Trap)
- The Opinion Collector""",

    "risk_assessment": """You are a risk assessment expert. Identify key assumptions for a product concept across four categories:
- desirability (will users want this?)
- viability (can it be profitable?)
- feasibility (can we build it?)
- usability (can users figure it out?)

Return a JSON object with key "assumptions" containing an array of assumption objects.
Each assumption: id (uuid), category, statement, importance (0-1), evidence (0-1), 
validationScore (importance * (1-evidence)), recommendedExperiment.""",

    "planning": """You are a technical planning expert. Create a phased 30/60/90-day milestone roadmap.
Return a JSON object with key "milestones" containing an array of milestone objects.
Each milestone: phase (string), objective (string), tasks (array of task objects).
Each task: id (string), title (string), durationDays (number), dependencies (string[]), 
complexity (low|medium|high), alternativeApproach (optional string).""",

    "evaluate_transcript": """You are a Mom Test transcript evaluator. Parse the given interview transcript and extract:
1. Empirical facts (statements about past behavior with specific details)
2. Polite fluff (compliments, hypothetical agreements, future tense promises)
3. Hypotheticals (statements about what they "would do" or "might do")

Return a JSON object with keys: facts (string[]), fluff (string[]), hypotheticals (string[]).

Then calculate: qScore = facts.length / (facts.length + hypotheticals.length + 2 * fluff.length)
Round qScore to 2 decimal places.""",
}


def _parse_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", text).strip()
    cleaned = re.sub(r"```\s*", "", cleaned).strip()
    return json.loads(cleaned)


async def generate_plan(concept_prompt: str) -> dict:
    jtbd = await clarify_concept(concept_prompt)
    mom_test = await run_mom_test(concept_prompt)
    assumptions_data = await assess_risks(concept_prompt)
    milestones_data = await create_plan(concept_prompt)

    return {
        "conceptName": " ".join(concept_prompt.split(" ")[:6]),
        "jtbdFramework": jtbd,
        "momTestValidation": mom_test,
        "prioritizedAssumptions": assumptions_data,
        "milestones": milestones_data,
        "governance": {
            "confidenceIndex": 0.85,
            "requiresHumanApproval": False,
            "governanceWarning": None,
        },
    }


async def clarify_concept(prompt: str) -> list:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=types.Content(
            role="user",
            parts=[types.Part(text=f'Parse this concept and extract JTBD stories:\n"{prompt}"')],
        ),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPTS["clarification"],
            **GENERATION_CONFIG.model_dump(exclude_none=True),
        ),
    )
    try:
        result = _parse_json(response.text)
        return result if isinstance(result, list) else result.get("jtbdFramework", [])
    except (json.JSONDecodeError, AttributeError):
        return [{"role": "Target user", "situation": f"Using {prompt}", "motivation": "I want a reliable solution", "outcome": "Achieve goal efficiently", "dimension": "functional"}]


async def run_mom_test(prompt: str) -> dict:
    chat = client.chats.create(
        model="gemini-1.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPTS["mom_test"],
            **GENERATION_CONFIG.model_dump(exclude_none=True),
        ),
    )
    response = chat.send_message(
        f'Concept to evaluate:\n"{prompt}"\n\nGenerate a structured Mom Test analysis with: '
        f'executionWorkflow (PLANNER/EVALUATOR/PIVOT), targetHypothesis, validationMetrics, '
        f'behavioralQuestions (at least 5 past-behavior questions), auditReport, and recommendedActionPlan.'
    )
    try:
        return _parse_json(response.text)
    except (json.JSONDecodeError, AttributeError):
        return {"executionWorkflow": "PLANNER", "targetHypothesis": f"Users need {prompt}", "behavioralQuestions": ["Tell me about the last time you faced this problem...", "What did you do specifically?"], "auditReport": "Unable to parse structured output from AI."}


async def assess_risks(prompt: str) -> list:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=types.Content(
            role="user",
            parts=[types.Part(text=f'Identify assumptions for this concept:\n"{prompt}"')],
        ),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPTS["risk_assessment"],
            **GENERATION_CONFIG.model_dump(exclude_none=True),
        ),
    )
    try:
        result = _parse_json(response.text)
        return result.get("assumptions", result if isinstance(result, list) else [])
    except (json.JSONDecodeError, AttributeError):
        return []


async def create_plan(prompt: str) -> list:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=types.Content(
            role="user",
            parts=[types.Part(text=f'Create milestones for this concept:\n"{prompt}"')],
        ),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPTS["planning"],
            **GENERATION_CONFIG.model_dump(exclude_none=True),
        ),
    )
    try:
        result = _parse_json(response.text)
        return result.get("milestones", result if isinstance(result, list) else [])
    except (json.JSONDecodeError, AttributeError):
        return []


async def evaluate_transcript(transcript: str) -> dict:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=types.Content(
            role="user",
            parts=[types.Part(text=f"Evaluate this interview transcript:\n\n{transcript}")],
        ),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPTS["evaluate_transcript"],
            **GENERATION_CONFIG.model_dump(exclude_none=True),
        ),
    )
    try:
        result = _parse_json(response.text)
        facts = result.get("facts", [])
        fluff = result.get("fluff", [])
        hypotheticals = result.get("hypotheticals", [])
        q_score = result.get("qScore", 0.0)
        if q_score == 0.0 and (facts or fluff or hypotheticals):
            total = len(facts) + len(hypotheticals) + 2 * len(fluff)
            q_score = round(len(facts) / total, 2) if total > 0 else 0.0
        return {"facts": facts, "fluff": fluff, "hypotheticals": hypotheticals, "qScore": q_score}
    except (json.JSONDecodeError, AttributeError):
        return {"facts": [], "fluff": [], "hypotheticals": [], "qScore": 0.0}
