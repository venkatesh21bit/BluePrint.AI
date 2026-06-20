from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from google.genai import errors as genai_errors
from app.database import get_db
from app.models.schemas import (
    GenerateRequest, GenerateResponse, ConceptCreate, ConceptResponse,
    TranscriptEvalRequest, TranscriptEvalResponse, ExecutionPlan,
)
from app.models.database import Concept
from app.services.gemini_service import generate_plan, evaluate_transcript
from app.utils.exporter import export_to_markdown
from sqlalchemy import select
from uuid import uuid4, UUID

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "blueprint-ai-backend"}


@router.post("/generate", response_model=GenerateResponse)
async def generate_execution_plan(req: GenerateRequest):
    try:
        plan = await generate_plan(req.conceptPrompt)
        return GenerateResponse(**plan)
    except genai_errors.APIError as e:
        raise HTTPException(status_code=e.code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/concepts", response_model=ConceptResponse, status_code=201)
async def save_concept(concept: ConceptCreate, db: AsyncSession = Depends(get_db)):
    user_id_str = concept.rawInput[:36]
    new_concept = Concept(
        id=uuid4(),
        user_id=UUID(user_id_str) if len(user_id_str) >= 36 else uuid4(),
        name=concept.name,
        raw_input=concept.rawInput,
    )
    db.add(new_concept)
    await db.commit()
    await db.refresh(new_concept)
    return ConceptResponse(
        id=new_concept.id,
        name=new_concept.name,
        rawInput=new_concept.raw_input,
        userId=str(new_concept.user_id),
        createdAt=new_concept.created_at,
    )


@router.get("/concepts", response_model=list[ConceptResponse])
async def list_concepts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Concept).order_by(Concept.created_at.desc()))
    concepts = result.scalars().all()
    return [
        ConceptResponse(
            id=c.id,
            name=c.name,
            rawInput=c.raw_input,
            userId=str(c.user_id),
            createdAt=c.created_at,
        )
        for c in concepts
    ]


@router.get("/concepts/{concept_id}", response_model=ConceptResponse)
async def get_concept(concept_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Concept).where(Concept.id == concept_id))
    concept = result.scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return ConceptResponse(
        id=concept.id,
        name=concept.name,
        rawInput=concept.raw_input,
        userId=str(concept.user_id),
        createdAt=concept.created_at,
    )


@router.delete("/concepts/{concept_id}", status_code=204)
async def delete_concept(concept_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Concept).where(Concept.id == concept_id))
    concept = result.scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    await db.delete(concept)
    await db.commit()


@router.post("/evaluate-transcript", response_model=TranscriptEvalResponse)
async def evaluate_interview_transcript(req: TranscriptEvalRequest):
    try:
        result = await evaluate_transcript(req.transcript)
        return TranscriptEvalResponse(**result)
    except genai_errors.APIError as e:
        raise HTTPException(status_code=e.code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export/{concept_id}")
async def export_concept(concept_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Concept).where(Concept.id == concept_id))
    concept = result.scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    plan_dict = await generate_plan(concept.raw_input)
    plan_obj = ExecutionPlan(**plan_dict)
    return {"markdown": export_to_markdown(plan_obj)}
