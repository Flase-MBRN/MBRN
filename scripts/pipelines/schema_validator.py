#!/usr/bin/env python3
"""
MBRN Schema Validator - Cross-Sector Data Integrity Guard
=========================================================

Validates all data passing from Sector C (Data) to Sector B (Logic/Supabase).
Enforces strict schema compliance at the handoff boundary while supporting
legacy V1 sentiment payloads and the new V2 signal payload format.
"""

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from pipeline_utils import log


class ValidationError(Exception):
    """Raised when payload fails schema validation."""

    def __init__(self, errors: List[str], schema_name: str, payload_sample: str = ""):
        self.errors = errors
        self.schema_name = schema_name
        self.payload_sample = payload_sample[:200]
        super().__init__(f"Schema validation failed for '{schema_name}': {', '.join(errors)}")


@dataclass
class FieldSchema:
    """Schema definition for a single field."""

    name: str
    field_type: Any
    required: bool = True
    validators: Optional[List[Callable[[Any], object]]] = None

    def __post_init__(self):
        if self.validators is None:
            self.validators = []


class SchemaValidator:
    """Bulletproof schema validation for C->B sector handoff."""

    UTC_TIMESTAMP_PATTERN = re.compile(
        r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$"
    )
    SUPPORTED_SIGNAL_TYPES = (
        "market_sentiment",
        "credibility",
        "impact",
        "alert_level",
    )

    SCHEMAS = {
        "market_sentiment": {
            "timestamp": FieldSchema("timestamp", str, True, [
                lambda v: SchemaValidator._is_valid_utc(v) or "Invalid UTC timestamp"
            ]),
            "sentiment_score": FieldSchema("sentiment_score", (int, float), True, [
                lambda v: (0 <= float(v) <= 100) or "sentiment_score must be 0-100"
            ]),
            "confidence": FieldSchema("confidence", (int, float), True, [
                lambda v: (0.0 <= float(v) <= 1.0) or "confidence must be 0.0-1.0"
            ]),
            "source": FieldSchema("source", str, True, [
                lambda v: bool(v.strip()) or "source must not be empty"
            ]),
            "verdict": FieldSchema("verdict", str, True, [
                lambda v: bool(v.strip()) or "verdict must not be empty"
            ]),
            "raw_data": FieldSchema("raw_data", dict, False),
            "metadata": FieldSchema("metadata", dict, False),
        },
        "signal_payload": {
            "timestamp": FieldSchema("timestamp", str, True, [
                lambda v: SchemaValidator._is_valid_utc(v) or "Invalid UTC timestamp"
            ]),
            "source": FieldSchema("source", str, True, [
                lambda v: bool(v.strip()) or "source must not be empty"
            ]),
            "signal_type": FieldSchema("signal_type", str, True, [
                lambda v: v in SchemaValidator.SUPPORTED_SIGNAL_TYPES or "unsupported signal_type"
            ]),
            "normalized_score": FieldSchema("normalized_score", (int, float), True, [
                lambda v: (0 <= float(v) <= 100) or "normalized_score must be 0-100"
            ]),
            "verdict": FieldSchema("verdict", str, True, [
                lambda v: bool(v.strip()) or "verdict must not be empty"
            ]),
            "confidence": FieldSchema("confidence", (int, float), False, [
                lambda v: (0.0 <= float(v) <= 1.0) or "confidence must be 0.0-1.0"
            ]),
            "summary": FieldSchema("summary", str, False),
            "dimensions": FieldSchema("dimensions", dict, False),
            "raw_data": FieldSchema("raw_data", dict, False),
            "metadata": FieldSchema("metadata", dict, False),
        },
        "api_contract_base": {
            "timestamp": FieldSchema("timestamp", str, True, [
                lambda v: SchemaValidator._is_valid_utc(v) or "Invalid UTC timestamp"
            ]),
            "payload": FieldSchema("payload", dict, True),
            "error": FieldSchema("error", (str, type(None)), False),
            "checksum": FieldSchema("checksum", str, False),
            "source": FieldSchema("source", str, False),
            "version": FieldSchema("version", str, False),
        },
        "fear_greed_data": {
            "timestamp": FieldSchema("timestamp", str, True, [
                lambda v: SchemaValidator._is_valid_utc(v) or "Invalid UTC timestamp"
            ]),
            "value": FieldSchema("value", (int, float), True, [
                lambda v: (0 <= float(v) <= 100) or "Fear/Greed value must be 0-100"
            ]),
            "value_classification": FieldSchema("value_classification", str, True),
            "source": FieldSchema("source", str, True),
        },
    }

    def __init__(self):
        self.validation_stats = {
            "total_validated": 0,
            "total_failed": 0,
            "last_error": None,
        }

    @staticmethod
    def _is_valid_utc(timestamp: str) -> bool:
        """Validate ISO 8601 UTC timestamp format."""
        if not SchemaValidator.UTC_TIMESTAMP_PATTERN.match(timestamp):
            return False

        try:
            datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            return True
        except ValueError:
            return False

    @staticmethod
    def _field_type_name(field_type: Any) -> str:
        """Format field type names for validation errors."""
        if isinstance(field_type, tuple):
            return " | ".join(t.__name__ for t in field_type)
        return field_type.__name__

    def validate_payload(
        self,
        payload: Dict[str, Any],
        schema_name: str,
        strict: bool = True,
    ) -> Dict[str, Any]:
        """
        Validate a data payload against its schema.

        Raises ValidationError on failure.
        """
        if schema_name not in self.SCHEMAS:
            raise ValidationError([f"Unknown schema: {schema_name}"], schema_name)

        schema = self.SCHEMAS[schema_name]
        errors: List[str] = []
        validated: Dict[str, Any] = {}

        for field_name, field_schema in schema.items():
            if field_schema.required and field_name not in payload:
                errors.append(f"Missing required field: {field_name}")
                continue

            if field_name not in payload:
                continue

            value = payload[field_name]
            if not isinstance(value, field_schema.field_type):
                errors.append(
                    f"Field '{field_name}': expected {self._field_type_name(field_schema.field_type)}, "
                    f"got {type(value).__name__}"
                )
                continue

            for validator in field_schema.validators or []:
                result = validator(value)
                if result is not True and isinstance(result, str):
                    errors.append(f"Field '{field_name}': {result}")

            validated[field_name] = value

        if strict:
            unknown_fields = set(payload.keys()) - set(schema.keys())
            if unknown_fields:
                errors.append(f"Unknown fields: {', '.join(sorted(unknown_fields))}")
        else:
            for key, value in payload.items():
                if key not in schema:
                    log("WARN", f"Schema '{schema_name}': Unknown field '{key}' passed through")
                    validated[key] = value

        self.validation_stats["total_validated"] += 1

        if errors:
            self.validation_stats["total_failed"] += 1
            self.validation_stats["last_error"] = errors
            log("ERROR", f"Validation failed for '{schema_name}': {errors}")
            raise ValidationError(errors, schema_name, str(payload))

        log("OK", f"Schema validation passed: {schema_name}")
        return validated

    def validate_signal_payload(self, payload: Dict[str, Any], strict: bool = True) -> Dict[str, Any]:
        """Normalize legacy data to V2 signal format and validate it."""
        normalized = normalize_to_signal_payload(payload)
        return self.validate_payload(normalized, "signal_payload", strict=strict)

    def validate_batch(
        self,
        payloads: List[Dict[str, Any]],
        schema_name: str,
        fail_fast: bool = True,
    ) -> List[Dict[str, Any]]:
        """Validate multiple payloads in batch."""
        validated = []
        all_errors = []

        for index, payload in enumerate(payloads):
            try:
                if schema_name == "signal_payload":
                    validated.append(self.validate_signal_payload(payload))
                else:
                    validated.append(self.validate_payload(payload, schema_name))
            except ValidationError as exc:
                if fail_fast:
                    raise
                all_errors.append(f"Item {index}: {exc.errors}")

        if all_errors:
            raise ValidationError(all_errors, schema_name)

        return validated

    def add_custom_schema(self, name: str, schema: Dict[str, FieldSchema]):
        """Add a custom schema at runtime."""
        self.SCHEMAS[name] = schema
        log("INFO", f"Custom schema registered: {name}")

    def get_stats(self) -> Dict[str, Any]:
        """Return validation statistics."""
        total = max(1, self.validation_stats["total_validated"])
        success_count = self.validation_stats["total_validated"] - self.validation_stats["total_failed"]
        return {
            **self.validation_stats,
            "success_rate": success_count / total,
        }


def _build_signal_payload(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """Strip out optional None fields and enforce dict types for complex fields."""
    payload = {
        "timestamp": candidate["timestamp"],
        "source": candidate["source"],
        "signal_type": candidate["signal_type"],
        "normalized_score": candidate["normalized_score"],
        "verdict": candidate["verdict"],
    }

    if isinstance(candidate.get("confidence"), (int, float)):
        payload["confidence"] = float(candidate["confidence"])
    if isinstance(candidate.get("summary"), str) and candidate["summary"].strip():
        payload["summary"] = candidate["summary"]
    if isinstance(candidate.get("dimensions"), dict):
        payload["dimensions"] = candidate["dimensions"]
    if isinstance(candidate.get("raw_data"), dict):
        payload["raw_data"] = candidate["raw_data"]
    if isinstance(candidate.get("metadata"), dict):
        payload["metadata"] = candidate["metadata"]

    return payload


def normalize_to_signal_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize V1 sentiment payloads and native V2 signal payloads
    into the canonical signal_payload shape.
    """
    if not isinstance(payload, dict):
        raise ValidationError(["Payload must be a dict"], "signal_payload", str(payload))

    now_iso = datetime.now(timezone.utc).isoformat()

    if "signal_type" in payload and "normalized_score" in payload:
        candidate = {
            "timestamp": payload.get("timestamp") or now_iso,
            "source": payload.get("source"),
            "signal_type": payload.get("signal_type"),
            "normalized_score": payload.get("normalized_score"),
            "verdict": payload.get("verdict"),
            "confidence": payload.get("confidence"),
            "summary": payload.get("summary"),
            "dimensions": payload.get("dimensions"),
            "raw_data": payload.get("raw_data", payload),
            "metadata": payload.get("metadata", {}),
        }
        return _build_signal_payload(candidate)

    if "sentiment_score" in payload and "verdict" in payload:
        summary = None
        enriched = payload.get("mbrn_enriched")
        if isinstance(enriched, dict):
            summary = enriched.get("analysis")

        candidate = {
            "timestamp": payload.get("timestamp") or now_iso,
            "source": payload.get("source"),
            "signal_type": "market_sentiment",
            "normalized_score": payload.get("sentiment_score"),
            "verdict": payload.get("verdict"),
            "confidence": payload.get("confidence"),
            "summary": summary,
            "raw_data": payload.get("raw_data", payload),
            "metadata": payload.get("metadata", {}),
        }
        return _build_signal_payload(candidate)

    enrichment = payload.get("enrichment")
    if payload.get("pipeline") == "market_sentiment" and isinstance(enrichment, dict):
        candidate = {
            "timestamp": payload.get("timestamp") or payload.get("fetched_at") or now_iso,
            "source": payload.get("source", "market_sentiment_pipeline"),
            "signal_type": "market_sentiment",
            "normalized_score": enrichment.get("sentiment_score"),
            "verdict": payload.get("verdict") or enrichment.get("recommendation") or "hold",
            "confidence": enrichment.get("confidence"),
            "summary": enrichment.get("analysis"),
            "raw_data": payload.get("raw_data", payload),
            "metadata": payload.get("metadata", {
                "pipeline": payload.get("pipeline"),
                "version": payload.get("version"),
            }),
        }
        return _build_signal_payload(candidate)

    raise ValidationError(
        ["Payload cannot be normalized to signal_payload"],
        "signal_payload",
        str(payload),
    )


def validate_before_handoff(
    payload: Dict[str, Any],
    data_type: str = "market_sentiment",
    output_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Convenience function: validate and optionally save for handoff.
    """
    validator = SchemaValidator()
    if data_type == "signal_payload":
        validated = validator.validate_signal_payload(payload)
    else:
        validated = validator.validate_payload(payload, data_type)

    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as handle:
            json.dump(validated, handle, indent=2, ensure_ascii=False)
        log("OK", f"Validated data saved for handoff: {output_path}")

    return validated


if __name__ == "__main__":
    print("=" * 60)
    print("MBRN Schema Validator - Module Test")
    print("=" * 60)

    validator = SchemaValidator()

    valid_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sentiment_score": 75,
        "confidence": 0.85,
        "source": "market_sentiment_pipeline",
        "verdict": "Extreme Greed",
        "raw_data": {"foo": "bar"},
    }

    try:
        validator.validate_payload(valid_payload, "market_sentiment")
        log("OK", "Test 1 PASSED: Valid legacy payload accepted")
    except ValidationError as exc:
        log("ERROR", f"Test 1 FAILED: {exc}")

    try:
        normalized = validator.validate_signal_payload(valid_payload)
        log("OK", f"Test 2 PASSED: Legacy payload normalized to {normalized['signal_type']}")
    except ValidationError as exc:
        log("ERROR", f"Test 2 FAILED: {exc}")

    credibility_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "trust_matrix_worker",
        "signal_type": "credibility",
        "normalized_score": 92,
        "verdict": "high_trust",
        "confidence": 0.91,
        "summary": "Source is consistent with primary reporting.",
        "raw_data": {"headline_count": 3},
    }

    try:
        validator.validate_signal_payload(credibility_payload)
        log("OK", "Test 3 PASSED: Native V2 signal payload accepted")
    except ValidationError as exc:
        log("ERROR", f"Test 3 FAILED: {exc}")

    invalid_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "trust_matrix_worker",
        "signal_type": "credibility",
        "normalized_score": 120,
        "verdict": "invalid_score",
    }

    try:
        validator.validate_signal_payload(invalid_payload)
        log("ERROR", "Test 4 FAILED: Should have rejected invalid score")
    except ValidationError as exc:
        log("OK", f"Test 4 PASSED: Correctly rejected - {exc.errors}")

    stats = validator.get_stats()
    log("INFO", f"Validation stats: {stats['total_validated']} checked, {stats['total_failed']} failed")

    print("=" * 60)
    print("Module test complete")
    print("=" * 60)
