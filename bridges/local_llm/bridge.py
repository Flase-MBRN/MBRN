"""Formal local Ollama bridge for Week-2 structured enrichment."""

from __future__ import annotations

import json
import os
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict

from scripts.pipelines.pipeline_utils import (
    ollama_execution_guard,
    parse_strict_json_response,
    repair_json_with_ollama,
)


DEFAULT_ANALYSIS_VERSION = "week2_v1"
ANALYSIS_REQUIRED_KEYS = [
    "summary",
    "score",
    "confidence",
    "tags",
    "recommended_action",
]
ANALYSIS_SCHEMA_HINT = (
    '{'
    '"summary":"One concise summary",'
    '"score":72,'
    '"confidence":0.81,'
    '"tags":["markets","risk-on"],'
    '"recommended_action":"monitor"'
    '}'
)


@dataclass
class LocalLLMBridgeConfig:
    host: str = "localhost"
    port: int = 11434
    model: str = "deepseek-coder-v2"
    timeout_seconds: int = 120
    temperature: float = 0.2
    analysis_version: str = DEFAULT_ANALYSIS_VERSION

    @classmethod
    def from_env(cls) -> "LocalLLMBridgeConfig":
        return cls(
            host=os.getenv("OLLAMA_HOST", "localhost"),
            port=int(os.getenv("OLLAMA_PORT", "11434")),
            model=os.getenv("OLLAMA_MODEL", "deepseek-coder-v2"),
            timeout_seconds=int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120")),
            temperature=float(os.getenv("OLLAMA_TEMPERATURE", "0.2")),
            analysis_version=os.getenv("LOCAL_LLM_ANALYSIS_VERSION", DEFAULT_ANALYSIS_VERSION),
        )


class LocalLLMBridge:
    """Structured JSON bridge around a local Ollama runtime."""

    def __init__(self, config: LocalLLMBridgeConfig | None = None):
        self.config = config or LocalLLMBridgeConfig.from_env()

    @property
    def endpoint(self) -> str:
        return f"http://{self.config.host}:{self.config.port}/api/generate"

    def is_available(self) -> bool:
        try:
            req = urllib.request.Request(
                f"http://{self.config.host}:{self.config.port}/api/tags",
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status == 200
        except Exception:
            return False

    def build_prompt(self, raw_item: Dict[str, Any]) -> str:
        payload = {
            "raw_item_id": raw_item["id"],
            "source_family": raw_item["source_family"],
            "source_name": raw_item["source_name"],
            "source_url": raw_item["source_url"],
            "title": raw_item.get("title"),
            "fetched_at": raw_item["fetched_at"],
            "payload": raw_item["payload"],
        }
        compact_payload = json.dumps(payload, ensure_ascii=False, sort_keys=True)
        return (
            "You are the MBRN local enrichment bridge.\n"
            "You are a professional JSON-only output engine. Never add conversational filler or markdown code blocks like ```json. Output raw JSON only.\n"
            "Analyze the provided raw item and return ONLY one valid JSON object.\n"
            "Do not output markdown, prose, or any text outside the JSON object.\n"
            "Use this exact schema:\n"
            f"{ANALYSIS_SCHEMA_HINT}\n"
            "Rules:\n"
            "- summary: max 280 chars\n"
            "- score: integer from 0 to 100\n"
            "- confidence: number from 0.0 to 1.0\n"
            "- tags: array of 1 to 6 short lowercase strings\n"
            "- recommended_action: one of monitor, watch, buy, sell, hedge, ignore\n"
            "Raw item:\n"
            f"{compact_payload}"
        )

    def _request_model(self, prompt: str, worker_name: str) -> str:
        payload = {
            "model": self.config.model,
            "prompt": prompt,
            "stream": False,
            "keep_alive": 0,  # CRITICAL: Force VRAM release immediately after request
            "options": {
                "temperature": self.config.temperature,
            },
        }
        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with ollama_execution_guard(
            worker_name=worker_name,
            acquire_timeout_seconds=self.config.timeout_seconds,
            gpu_wait_timeout_seconds=30,
        ):
            with urllib.request.urlopen(req, timeout=self.config.timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))

        return str(body.get("response", ""))

    def analyze_raw_item(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self.build_prompt(raw_item)
        worker_name = f"local_llm:{raw_item['id']}"
        raw_output = self._request_model(prompt, worker_name=worker_name)

        try:
            parsed = parse_strict_json_response(raw_output, required_keys=ANALYSIS_REQUIRED_KEYS)
        except ValueError:
            repaired = repair_json_with_ollama(
                raw_output=raw_output,
                schema_hint=ANALYSIS_SCHEMA_HINT,
                model=self.config.model,
                timeout=self.config.timeout_seconds,
                host=self.config.host,
                port=self.config.port,
            )
            if not repaired:
                raise ValueError("local_llm_invalid_json")
            parsed = parse_strict_json_response(
                json.dumps(repaired, ensure_ascii=False),
                required_keys=ANALYSIS_REQUIRED_KEYS,
            )

        tags = parsed.get("tags")
        if not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags):
            raise ValueError("local_llm_invalid_tags")

        score = int(parsed["score"])
        confidence = float(parsed["confidence"])
        if score < 0 or score > 100:
            raise ValueError("local_llm_invalid_score")
        if confidence < 0 or confidence > 1:
            raise ValueError("local_llm_invalid_confidence")

        normalized = {
            "summary": str(parsed["summary"]).strip()[:280],
            "score": score,
            "confidence": round(confidence, 3),
            "tags": [str(tag).strip().lower() for tag in tags if str(tag).strip()][:6],
            "recommended_action": str(parsed["recommended_action"]).strip().lower(),
            "analysis_version": self.config.analysis_version,
            "model_name": self.config.model,
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
        normalized["analysis_json"] = {
            "summary": normalized["summary"],
            "score": normalized["score"],
            "confidence": normalized["confidence"],
            "tags": normalized["tags"],
            "recommended_action": normalized["recommended_action"],
            "analysis_version": normalized["analysis_version"],
            "model_name": normalized["model_name"],
            "processed_at": normalized["processed_at"],
        }
        return normalized

    def execute_custom_prompt(
        self,
        prompt: str,
        required_keys: list[str] | None = None,
        schema_hint: str = "",
        worker_name: str = "custom_prompt"
    ) -> tuple[bool, dict[str, Any] | str]:
        """
        Execute a custom prompt against Ollama without schema normalization.
        
        Args:
            prompt: The prompt string to send to Ollama
            required_keys: Optional list of keys to validate in JSON response
            schema_hint: Optional schema hint for JSON repair on failure
            worker_name: Identifier for the GPU execution guard
            
        Returns:
            Tuple (success, result) where result is dict on success, error string on failure
        """
        # Check Ollama availability
        if not self.is_available():
            return False, "Ollama not available"
        
        try:
            # Send prompt via internal method
            raw_output = self._request_model(prompt, worker_name=worker_name)
            
            # Try to parse as JSON
            try:
                if required_keys:
                    parsed = parse_strict_json_response(raw_output, required_keys=required_keys)
                else:
                    parsed = json.loads(raw_output)
                return True, parsed
            except (ValueError, json.JSONDecodeError) as e:
                # Attempt repair if schema_hint provided
                if schema_hint:
                    repaired = repair_json_with_ollama(
                        raw_output=raw_output,
                        schema_hint=schema_hint,
                        model=self.config.model,
                        timeout=self.config.timeout_seconds,
                        host=self.config.host,
                        port=self.config.port,
                    )
                    if repaired:
                        return True, repaired
                
                return False, f"JSON parse error: {e}"
                
        except Exception as e:
            return False, f"Request failed: {e}"
