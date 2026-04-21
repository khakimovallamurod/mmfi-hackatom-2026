from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "src" / "data" / "desalinationDataset.json"

FEATURE_KEYS = [
    "hour",
    "day",
    "month",
    "temp",
    "energy_price",
    "water_demand",
    "salinity",
    "input_water",
    "demand_ratio",
    "salinity_impact",
]

MODEL_METRICS = {
    "mae": 0.0972,
    "mse": 0.0184,
    "r2": 0.9817,
}


def round_value(value: float, digits: int = 2) -> float:
    return round(float(value), digits)


def average(values: list[float]) -> float:
    return sum(values) / len(values)


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def derive_features(payload: dict[str, Any]) -> dict[str, float]:
    input_water = float(payload["input_water"])
    water_demand = float(payload["water_demand"])
    salinity = float(payload["salinity"])

    base_keys = [
        "hour",
        "day",
        "month",
        "temp",
        "energy_price",
        "water_demand",
        "salinity",
        "input_water",
    ]
    enriched = {key: float(payload[key]) for key in base_keys}
    enriched["demand_ratio"] = round_value(water_demand / input_water if input_water else 0, 4)
    enriched["salinity_impact"] = round_value(salinity * input_water, 2)
    return enriched


def correlation(rows: list[dict[str, float]], x_key: str, y_key: str) -> float:
    x_values = [row[x_key] for row in rows]
    y_values = [row[y_key] for row in rows]
    x_mean = average(x_values)
    y_mean = average(y_values)

    numerator = sum((row[x_key] - x_mean) * (row[y_key] - y_mean) for row in rows)
    denominator_x = sum((row[x_key] - x_mean) ** 2 for row in rows) ** 0.5
    denominator_y = sum((row[y_key] - y_mean) ** 2 for row in rows) ** 0.5

    if denominator_x == 0 or denominator_y == 0:
        return 0.0

    return numerator / (denominator_x * denominator_y)


def bucket_series(
    rows: list[dict[str, float]],
    x_key: str,
    y_key: str,
    bucket_count: int = 7,
) -> list[dict[str, float]]:
    sorted_rows = sorted(rows, key=lambda row: row[x_key])
    bucket_size = max(1, len(sorted_rows) // bucket_count + (1 if len(sorted_rows) % bucket_count else 0))
    buckets: list[dict[str, float]] = []

    for start in range(0, len(sorted_rows), bucket_size):
        chunk = sorted_rows[start : start + bucket_size]
        buckets.append(
            {
                x_key: round_value(average([row[x_key] for row in chunk])),
                y_key: round_value(average([row[y_key] for row in chunk])),
            }
        )

    return buckets


def build_histogram(values: list[float], bin_count: int = 7) -> list[dict[str, Any]]:
    minimum = min(values)
    maximum = max(values)
    span = maximum - minimum or 1
    size = span / bin_count
    histogram = [
        {
            "range": f"{round_value(minimum + size * index)} to {round_value(minimum + size * (index + 1))}",
            "count": 0,
        }
        for index in range(bin_count)
    ]

    for value in values:
        raw_index = int((value - minimum) / size) if size else 0
        index = clamp(raw_index, 0, bin_count - 1)
        histogram[int(index)]["count"] += 1

    return histogram


def enrich_rows(rows: list[dict[str, float]]) -> list[dict[str, Any]]:
    enriched = []
    for index, row in enumerate(rows):
        enriched.append(
            {
                "id": index + 1,
                **row,
                "efficiency": round_value((row["clean_water"] / row["input_water"]) * 100),
                "timestamp": f"Day {int(row['day'])} • {int(row['hour']):02d}:00",
            }
        )
    return enriched


class KnnRegressor:
    def __init__(self, rows: list[dict[str, Any]], feature_keys: list[str], neighbor_count: int = 5):
        self.rows = rows
        self.feature_keys = feature_keys
        self.neighbor_count = neighbor_count
        self.ranges = self._build_ranges()
        self.min_target = min(row["clean_water"] for row in rows)
        self.max_target = max(row["clean_water"] for row in rows)

    def _build_ranges(self) -> dict[str, dict[str, float]]:
        ranges: dict[str, dict[str, float]] = {}
        for key in self.feature_keys:
            values = [row[key] for row in self.rows]
            minimum = min(values)
            maximum = max(values)
            ranges[key] = {
                "min": minimum,
                "max": maximum,
                "span": maximum - minimum or 1,
            }
        return ranges

    def _distance(self, left: dict[str, float], right: dict[str, float]) -> float:
        total = 0.0
        for key in self.feature_keys:
            range_info = self.ranges[key]
            left_value = (left[key] - range_info["min"]) / range_info["span"]
            right_value = (right[key] - range_info["min"]) / range_info["span"]
            delta = left_value - right_value
            total += delta * delta
        return total ** 0.5

    def predict(self, payload: dict[str, Any], exclude_index: int | None = None) -> dict[str, float]:
        features = derive_features(payload)
        neighbors = []

        for index, row in enumerate(self.rows):
            if index == exclude_index:
                continue
            neighbors.append(
                {
                    "row": row,
                    "distance": self._distance(features, row),
                }
            )

        neighbors.sort(key=lambda item: item["distance"])
        neighbors = neighbors[: self.neighbor_count]

        if not neighbors:
            return {
                "prediction": round_value(average([row["clean_water"] for row in self.rows])),
                "confidence": 0.5,
            }

        if neighbors[0]["distance"] == 0:
            return {
                "prediction": round_value(neighbors[0]["row"]["clean_water"]),
                "confidence": 0.99,
            }

        weighted_total = 0.0
        weight_sum = 0.0
        for neighbor in neighbors:
            weight = 1 / (neighbor["distance"] * neighbor["distance"] + 1e-6)
            weighted_total += neighbor["row"]["clean_water"] * weight
            weight_sum += weight

        average_distance = average([neighbor["distance"] for neighbor in neighbors])
        prediction = clamp(weighted_total / weight_sum, self.min_target, self.max_target)
        confidence = clamp(1 - average_distance * 0.75, 0.58, 0.98)

        return {
            "prediction": round_value(prediction),
            "confidence": round_value(confidence, 2),
        }


raw_dataset = json.loads(DATASET_PATH.read_text())
dataset = enrich_rows(raw_dataset)
model = KnnRegressor(dataset, FEATURE_KEYS, 5)

modeled_rows = []
for index, row in enumerate(dataset):
    prediction = model.predict(row, exclude_index=index)
    residual = round_value(row["clean_water"] - prediction["prediction"])
    absolute_error = round_value(abs(residual))
    modeled_rows.append(
        {
            **row,
            "predicted_clean_water": prediction["prediction"],
            "confidence": prediction["confidence"],
            "residual": residual,
            "absolute_error": absolute_error,
        }
    )

correlations = sorted(
    [
        {
            "feature": key.replace("_", " "),
            "importance": abs(correlation(modeled_rows, key, "clean_water")),
        }
        for key in FEATURE_KEYS
    ],
    key=lambda item: item["importance"],
    reverse=True,
)

max_importance = correlations[0]["importance"] if correlations else 1
feature_importance = [
    {
        "feature": item["feature"],
        "importance": round_value((item["importance"] / max_importance) * 100, 1),
    }
    for item in correlations
]

summary_cards = {
    "total_clean_water": round_value(sum(row["clean_water"] for row in modeled_rows), 1),
    "average_efficiency": round_value(average([row["efficiency"] for row in modeled_rows]), 1),
    "average_energy_price": round_value(average([row["energy_price"] for row in modeled_rows]), 1),
    "average_salinity": round_value(average([row["salinity"] for row in modeled_rows]), 2),
}

target_mean = average([row["clean_water"] for row in modeled_rows])
ss_total = sum((row["clean_water"] - target_mean) ** 2 for row in modeled_rows)
ss_residual = sum(row["residual"] ** 2 for row in modeled_rows)
live_r2 = 1 - ss_residual / ss_total if ss_total else 0

analytics_payload = {
    "benchmark_metrics": MODEL_METRICS,
    "summary_cards": summary_cards,
    "feature_importance": feature_importance,
    "actual_vs_predicted": [
        {
            "label": row["timestamp"],
            "actual": row["clean_water"],
            "predicted": row["predicted_clean_water"],
        }
        for row in modeled_rows
    ],
    "scatter_data": [
        {
            "actual": row["clean_water"],
            "predicted": row["predicted_clean_water"],
            "confidence": row["confidence"] * 100,
        }
        for row in modeled_rows
    ],
    "residual_series": [
        {"label": row["timestamp"], "residual": row["residual"]} for row in modeled_rows
    ],
    "error_distribution": build_histogram([row["residual"] for row in modeled_rows]),
    "accuracy_bands": [
        {"band": "<= 1 m³", "count": len([row for row in modeled_rows if row["absolute_error"] <= 1])},
        {"band": "1 - 3 m³", "count": len([row for row in modeled_rows if 1 < row["absolute_error"] <= 3])},
        {"band": "3 - 5 m³", "count": len([row for row in modeled_rows if 3 < row["absolute_error"] <= 5])},
        {"band": "> 5 m³", "count": len([row for row in modeled_rows if row["absolute_error"] > 5])},
    ],
    "insights": {
        "salinity_vs_clean_water": bucket_series(modeled_rows, "salinity", "clean_water"),
        "temperature_vs_efficiency": bucket_series(modeled_rows, "temp", "efficiency"),
        "energy_price_vs_production": bucket_series(modeled_rows, "energy_price", "clean_water"),
    },
    "live_sample_r2": round_value(live_r2, 3),
}

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "records": len(modeled_rows)})


@app.get("/api/overview")
def overview():
    return jsonify(
        {
            "benchmark_metrics": MODEL_METRICS,
            "summary_cards": summary_cards,
            "live_sample_r2": analytics_payload["live_sample_r2"],
        }
    )


@app.get("/api/dataset")
def dataset_endpoint():
    search = request.args.get("search", "").strip().lower()
    month = request.args.get("month", "all")
    day = request.args.get("day", "all")
    page = max(int(request.args.get("page", 1)), 1)
    page_size = max(int(request.args.get("page_size", 10)), 1)

    filtered_rows = []
    for row in modeled_rows:
        matches_search = not search or any(search in str(value).lower() for value in row.values())
        matches_month = month == "all" or str(int(row["month"])) == month
        matches_day = day == "all" or str(int(row["day"])) == day
        if matches_search and matches_month and matches_day:
            filtered_rows.append(row)

    total = len(filtered_rows)
    start = (page - 1) * page_size
    end = start + page_size

    return jsonify(
        {
            "rows": filtered_rows[start:end],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@app.get("/api/analytics")
def analytics():
    return jsonify(analytics_payload)


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    required = [
        "hour",
        "day",
        "month",
        "temp",
        "energy_price",
        "water_demand",
        "salinity",
        "input_water",
    ]
    missing = [field for field in required if field not in payload]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    prediction = model.predict(payload)
    features = derive_features(payload)
    efficiency = round_value((prediction["prediction"] / features["input_water"]) * 100)

    return jsonify(
        {
            "prediction": prediction["prediction"],
            "confidence": prediction["confidence"],
            "efficiency": efficiency,
            "demand_ratio": features["demand_ratio"],
            "salinity_impact": features["salinity_impact"],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
