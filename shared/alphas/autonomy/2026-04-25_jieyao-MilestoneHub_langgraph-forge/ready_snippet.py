from langgraph_forge import (
    ModelSpec,
    SpecialistSpec,
    create_supervisor_agent,
    get_model,
)

supervisor = get_model(ModelSpec(model="claude-opus-4-7", provider="anthropic"))
worker_model = ModelSpec(model="claude-haiku-4-5", provider="anthropic")

graph = create_supervisor_agent(
    supervisor_model=supervisor,
    specialists=[
        SpecialistSpec(
            name="researcher",
            prompt="You gather facts.",
            model=worker_model,
        ),
        SpecialistSpec(
            name="summariser",
            prompt="You produce concise summaries.",
            model=worker_model,
        ),
    ],
    supervisor_prompt="Delegate research and summarisation to specialists.",
)
