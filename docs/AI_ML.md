# AI/ML & Decision Intelligence Technical Manual
**MOIL AI Mining Intelligence Platform**
**Organization:** MOIL Limited / Ministry of Steel

---

## 1. Reserve Prediction & Geological Classification

### Core Objective
Accurately identify and classify manganese ore reserves into **High**, **Medium**, or **Low** potential zones using subsurface borehole core drilling assays fused with surface geological characteristics.

### Model Architecture
- **Algorithm:** Random Forest Classifier combined with Ordinary Spatial Kriging.
- **Model Artifact:** `ai_ml/models/reserve_model.joblib`
- **Validation Metric:** ROC-AUC: **0.88** | F1-Score: **0.86**

### Feature Engineering & Leakage Prevention
To ensure strict scientific and mathematical validity, the model is trained exclusively on pre-mining geological variables:

| Feature Name | Type | Physical Range | Description |
| :--- | :--- | :--- | :--- |
| `manganese_pct` ($Mn$) | Float | $15.0 - 52.0\%$ | Elemental manganese concentration in drill core assay. |
| `iron_pct` ($Fe$) | Float | $3.0 - 18.0\%$ | Iron content (crucial for $Mn:Fe$ metallurgical ratio). |
| `silica_pct` ($SiO_2$) | Float | $2.0 - 25.0\%$ | Deleterious silica gangue content. |
| `depth_m` | Float | $10.0 - 250.0\text{ m}$ | Subsurface borehole collar depth. |
| `stripping_ratio` | Float | $1.2 - 6.5$ | Estimated waste-to-ore volumetric ratio. |
| `lithology_encoded` | Categorical | 0 – 5 | Geological host rock (e.g., Gondite, Manganiferous Quartzite, Phyllite). |

> **Anti-Leakage Safeguard:** No post-extraction tonnages, daily dispatch logs, or operational machinery hours are included during reserve model training.

---

## 2. Production Forecasting & Shortfall Prediction

### Core Objective
Forecast daily run-of-mine (ROM) manganese ore extraction tonnages and project operational shortfalls against scheduled targets.

### Model Architecture
- **Algorithm:** Gradient Boosting Regressor (`scikit-learn`).
- **Model Artifact:** `ai_ml/models/production_model.joblib`
- **Validation Metrics:** $R^2 = 0.85$ | Mean Absolute Error (MAE): **$34.2\text{ tonnes}$**

### The 14 Canonical Feature Contract
The model enforces a strict 14-feature vector preserving chronological causality:

$$\hat{y}_t = f\left(\mathbf{x}_t, y_{t-1}, \bar{y}_{t-7:t-1}\right)$$

```python
PRODUCTION_FEATURE_NAMES = [
    "planned_tonnage",               # Daily scheduled extraction target
    "excavator_hours_operating",     # Primary shovel operating runtime (hours)
    "excavator_hours_breakdown",     # Shovel mechanical breakdown downtime (hours)
    "dumper_hours_operating",        # Haul dumper operating fleet hours
    "dumper_hours_breakdown",        # Haul dumper fleet breakdown downtime
    "drill_rig_hours_operating",     # Blast drill rig operating hours
    "rainfall_mm",                   # Preceding 24h meteorological rainfall
    "soil_moisture_pct",             # Surface soil moisture saturation percentage
    "temp_celsius",                  # Ambient dry-bulb temperature
    "blasting_delay_hours",          # Wet-hole shot-firing ignition delay (hours)
    "stripping_ratio",               # Active pit bench overburden ratio
    "active_faces_count",            # Number of operational mining faces
    "production_lag_1d",             # Strictly shifted previous day's extraction (tonnes)
    "production_lag_7d_mean"         # Strictly shifted 7-day rolling extraction average
]
```

### Shortfall Calculation Formula
$$\text{Shortfall Tonnes} = \max\left(0, \text{Target Planned Tonnes} - \text{Predicted Tonnes}\right)$$
$$\text{Shortfall Percentage} = \frac{\text{Shortfall Tonnes}}{\text{Target Planned Tonnes}} \times 100\%$$

---

## 3. Multi-Factor Transparent Risk Engine

### Core Objective
Compute a normalized operational risk score ($0 - 100$) reflecting pit safety, equipment bottlenecks, weather severity, and shortfall magnitude.

### The 4 Operational Risk Pillars
The composite risk score is calculated as a weighted linear combination of normalized domain factors:

$$\text{Risk Score} = \sum_{i=1}^4 w_i \cdot S_i$$

| Risk Pillar ($i$) | Mathematical Weight ($w_i$) | Primary Contributing Variables | Sensitivity Function |
| :--- | :--- | :--- | :--- |
| **Equipment Reliability** | $0.35$ (35%) | Excavator & dumper breakdown hours, fleet OEE. | $\text{Ratio of breakdown hours to 24h operational window}$. |
| **Weather & Inundation** | $0.25$ (25%) | Rainfall (mm), soil moisture (%), flood alerts. | $\text{Sigmoid saturation above 50mm precipitation threshold}$. |
| **Blasting Adherence** | $0.20$ (20%) | Shot-firing delays, bench water accumulation. | $\text{Linear penalty for blast delays exceeding 1.0 hour}$. |
| **Production Shortfall** | $0.20$ (20%) | Projected daily shortfall percentage. | $\text{Direct proportion of deficit percentage up to 40\%}$. |

### Risk Tiers
- **LOW ($0 \le \text{Score} < 35$):** Normal operating conditions.
- **MEDIUM ($35 \le \text{Score} < 60$):** Minor bottlenecks; monitor pit drainage and equipment queues.
- **HIGH ($60 \le \text{Score} < 80$):** Substantial disruption; actionable mitigations required.
- **CRITICAL ($80 \le \text{Score} \le 100$):** Emergency threshold; severe pit flooding or major fleet failure.

### Explainable AI (XAI) Attribution
Every evaluated factor produces an authentic attribution object:
```json
{
  "name": "Equipment Downtime",
  "severity": "HIGH",
  "weight": 0.35,
  "description": "CAT 349D2 Excavator hydraulic failure incurred 6.5h idle time.",
  "observed_value": "6.5 hrs"
}
```

---

## 4. Prescriptive Recommendation Engine

### Governance Rule
AI recommendations **never** execute direct automated mechanical actions. All recommendations enter a **Human-in-the-Loop** managerial review queue:

$$\text{Recommendation Lifecycle: } \text{PENDING} \xrightarrow{\quad\text{Manager Action}\quad} \begin{cases} \text{APPROVED} \\ \text{REJECTED} \\ \text{MODIFIED} \end{cases}$$

### Mitigation Rule Matrix

| Trigger Condition | Category | Prescribed Action | Expected Impact |
| :--- | :--- | :--- | :--- |
| Shovel downtime $> 4\text{h}$ & Dumper idle $> 20\%$ | **EQUIPMENT** | Re-route haul dumpers from idle pit to active high-capacity face. | $+110\text{ tonnes/shift}$ recovery; $18\%$ fuel waste reduction. |
| Rainfall $> 50\text{mm}$ & Moisture $> 55\%$ | **BLASTING** | Defer shot-firing on waterlogged bench; switch extraction to fragmented buffer stockpile. | Eliminates misfire hazard; releases $+95\text{ tonnes}$ immediate feed. |
| Grade $< 30\% Mn$ on active bench | **GRADE BLENDING** | Activate auxiliary high-grade extraction face in East Zone. | Restores run-of-mine blend to target $38.5\% Mn$. |
| Sump water level $> 75\%$ | **DEWATERING** | Deploy secondary 150 kW submersible dewatering pumps. | Lowers bench water level by $0.8\text{ m/day}$; protects pit haul roads. |
