from app.models.schemas import ExecutionPlan, JtbdStory, Assumption, Milestone, RoadmapTask, Governance
from app.utils.exporter import export_to_markdown


def test_export_markdown():
    plan = ExecutionPlan(
        conceptName="TestConcept",
        jtbdFramework=[
            JtbdStory(
                role="User",
                situation="Managing tasks",
                motivation="Be productive",
                outcome="Get things done",
                dimension="functional",
            )
        ],
        momTestValidation=None,
        prioritizedAssumptions=[
            Assumption(
                category="desirability",
                statement="Users want this",
                importance=0.8,
                evidence=0.3,
                validationScore=0.56,
                recommendedExperiment="Survey",
            )
        ],
        milestones=[
            Milestone(
                phase="30 days",
                objective="Build MVP",
                tasks=[
                    RoadmapTask(
                        title="Set up project",
                        durationDays=5,
                        dependencies=[],
                        complexity="low",
                        alternativeApproach="Use template",
                    )
                ],
            )
        ],
        governance=Governance(),
    )
    md = export_to_markdown(plan)
    assert "# Execution Plan: TestConcept" in md
    assert "## Jobs-to-be-Done" in md
    assert "## Risk-Assumptions Prioritization Matrix" in md
    assert "### 30 days: Build MVP" in md
    assert "[5d] Set up project" in md
