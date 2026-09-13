# Risk Prediction Module (Member 3 Ownership)

Transparent, explainable multi-variable risk scoring engine that evaluates operational risk tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) across:
1. Heavy equipment downtime
2. Monsoon precipitation and soil moisture
3. Blasting shot-firing delays
4. Cumulative production shortfall

## Key Features
- **Explainable AI (XAI)**: Attributes specific percentage weights and human-readable root cause descriptions to every factor.
- **Pluggable Architecture**: Currently implemented with transparent domain heuristic weights; ready for replacement with gradient boosted classification or anomaly detection models.
- **Calibrated Scores**: 0 to 100 continuous score with discrete severity tiers.
