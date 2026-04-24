from typing import TypedDict, List, Optional
from langgraph.checkpoint.sqlite import SqliteSaver

class AgentState(TypedDict):
    messages: List[dict]          # full conversation history
    intent: Optional[str]         # "product_question", "lead", "general"
    lead_info: Optional[dict]     # {name, email, platform}
    retrieved_docs: Optional[str] # context from FAISS
