from smallclawlm import NLMAgent, create_agent

# Create a research agent
agent = create_agent("research")
result = agent.run("What are the latest fusion energy breakthroughs?")

# Create a podcast agent with a specific notebook
agent = NLMAgent(notebook_id="abc123", tools="podcast")
result = agent.run("Create a podcast about quantum computing")
