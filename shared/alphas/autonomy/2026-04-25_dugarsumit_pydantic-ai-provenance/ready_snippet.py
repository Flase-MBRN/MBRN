import asyncio
from pydantic_ai import Agent
from pydantic_ai_provenance.capability import ProvenanceCapability
from pydantic_ai_provenance.attribution import attribute_output

provenance = ProvenanceCapability(
    agent_name="summariser",
    source_tools=["read_file"],   # tools whose results are raw data sources
)

agent = Agent(
    "anthropic:claude-sonnet-4-6",
    capabilities=[provenance],
    system_prompt="Summarise the content of files.",
)

@agent.tool_plain
def read_file(path: str) -> str:
    return open(path).read()

async def main():
    result = await agent.run("Read report.txt and summarise it.")

    store = provenance.store

    # Path-level attribution
    print(attribute_output(store).summary())

    # Mermaid diagram
    print(store.to_mermaid())

    # Citation verification (Steps 1 + 2, no extra API calls)
    report = await provenance.verify(result.output)
    print(report.text_with_verified_citations)

asyncio.run(main())
