from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
import uuid
from datetime import datetime, timezone


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    email_verified = Column(DateTime(timezone=True), nullable=True)
    image = Column(String(500), nullable=True)
    password_hash = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    recovery_email = Column(String(255), nullable=True)


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="cascade"), nullable=False)
    name = Column(String(255), nullable=False)
    raw_input = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assumptions = relationship("Assumption", back_populates="concept", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="concept", cascade="all, delete-orphan")
    ost_nodes = relationship("OstNode", back_populates="concept", cascade="all, delete-orphan")


class Assumption(Base):
    __tablename__ = "assumptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="cascade"), nullable=False)
    category = Column(String(50), nullable=False)
    statement = Column(Text, nullable=False)
    importance = Column(Float, nullable=False)
    evidence = Column(Float, nullable=False)
    validation_score = Column(Float, nullable=False)
    recommended_experiment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    concept = relationship("Concept", back_populates="assumptions")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="cascade"), nullable=False)
    phase = Column(String(100), nullable=False)
    objective = Column(Text, nullable=False)
    tasks = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    concept = relationship("Concept", back_populates="milestones")


class OstNode(Base):
    __tablename__ = "ost_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="cascade"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    parent_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    concept = relationship("Concept", back_populates="ost_nodes")
