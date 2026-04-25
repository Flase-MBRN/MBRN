from crewai import Agent
from crewai_agentphone import AgentPhoneToolkit

toolkit = AgentPhoneToolkit()

agent = Agent(
    role="Sales Caller",
    goal="Call leads and send follow-up texts",
    tools=toolkit.get_tools(),
)
