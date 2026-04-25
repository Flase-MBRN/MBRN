from registry.registry_client import RegistryClient

client = RegistryClient(base_url="http://localhost:8000")

# Register
client.register_tool(
    name="weather_lookup",
    description="Fetch current weather for a city using OpenMeteo.",
    category="web",
    endpoint_url="https://api.open-meteo.com/v1/forecast",
    tags=["weather", "api"],
)

# Discover
tools = client.list_tools(category="web")
hits = client.search_tools(query="analyze a csv file", top_k=3)
best = client.recommend_tool(task="read and analyze a csv", budget_usd=0.01)

# Reliability tracking
client.ping_result(tool_id="web_search", success=True, latency_ms=250)
