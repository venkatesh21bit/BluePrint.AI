from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class JtbdStory(BaseModel):
    role: str = Field(description="The persona/role experiencing the need")
    situation: str = Field(description="The context or trigger event")
    motivation: str = Field(description="The emotional or functional driver")
    outcome: str = Field(description="The desired end state")
    dimension: str = Field(description="functional | emotional | social")


class MomTestValidation(BaseModel):
    executionWorkflow: str = Field(description="PLANNER | EVALUATOR | PIVOT")
    targetHypothesis: str
    validationMetrics: dict = Field(default={})
    behavioralQuestions: List[str] = Field(default=[])
    auditReport: str = ""
    recommendedActionPlan: dict = Field(default={})


class Assumption(BaseModel):
    category: str = Field(description="desirability | viability | feasibility | usability")
    statement: str
    importance: float = Field(ge=0, le=1)
    evidence: float = Field(ge=0, le=1)
    validationScore: float = Field(ge=0, le=1)
    recommendedExperiment: str = ""


class RoadmapTask(BaseModel):
    title: str
    durationDays: int = Field(ge=1)
    dependencies: List[str] = Field(default=[])
    complexity: str = Field(default="medium", description="low | medium | high")
    alternativeApproach: Optional[str] = None


class Milestone(BaseModel):
    phase: str
    objective: str
    tasks: List[RoadmapTask] = Field(default=[])


class Governance(BaseModel):
    confidenceIndex: float = Field(default=0.85, ge=0, le=1)
    requiresHumanApproval: bool = False
    governanceWarning: Optional[str] = None


class ExecutionPlan(BaseModel):
    conceptName: str
    jtbdFramework: List[JtbdStory] = Field(default=[])
    momTestValidation: Optional[MomTestValidation] = None
    prioritizedAssumptions: List[Assumption] = Field(default=[])
    milestones: List[Milestone] = Field(default=[])
    governance: Governance = Field(default=Governance())


class ConceptCreate(BaseModel):
    name: str
    rawInput: str


class ConceptResponse(BaseModel):
    id: UUID
    name: str
    rawInput: str
    userId: str
    createdAt: datetime


class GenerateRequest(BaseModel):
    conceptPrompt: str
    userId: Optional[str] = "anonymous"


class GenerateResponse(BaseModel):
    conceptName: str
    jtbdFramework: List[JtbdStory] = Field(default=[])
    momTestValidation: Optional[dict] = None
    prioritizedAssumptions: List[Assumption] = Field(default=[])
    milestones: List[Milestone] = Field(default=[])
    governance: Governance = Field(default=Governance())


class TranscriptEvalRequest(BaseModel):
    transcript: str


class TranscriptEvalResponse(BaseModel):
    facts: List[str] = Field(default=[])
    fluff: List[str] = Field(default=[])
    hypotheticals: List[str] = Field(default=[])
    qScore: float = Field(default=0.0)
