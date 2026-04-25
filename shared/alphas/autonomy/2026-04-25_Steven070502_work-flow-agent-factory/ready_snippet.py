class MyTool(Tool):
    name = "my_tool"
    description = "工具描述"
    
    def run(self, input: str) -> str:
        return "结果"
