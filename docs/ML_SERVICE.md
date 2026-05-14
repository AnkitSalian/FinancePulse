# ML_SERVICE.md — FinancePulse

## Overview
Python FastAPI microservice hosting three ML capabilities: NLP transaction categorizer, Prophet cash flow forecaster, and investment recommendation enhancer (Phase 4).

**Base URL:** `http://localhost:8001` (internal only — never exposed to client)

---

## Setup
```
ml/
├── main.py                  # FastAPI app entry point
├── requirements.txt
├── models/                  # Serialized trained models
│   ├── categorizer.joblib
│   └── forecaster/          # Prophet model files
├── categorizer/
│   ├── model.py             # Training + inference
│   ├── preprocessor.py      # Text cleaning
│   └── training_data.csv    # Seed training data
├── forecaster/
│   ├── model.py             # Prophet wrapper
│   └── data_prep.py         # Time series prep
└── recommender/
    └── engine.py            # ML-enhanced allocation (Phase 4)
```

```
# requirements.txt
fastapi==0.110.0
uvicorn==0.29.0
scikit-learn==1.4.1
pandas==2.2.1
prophet==1.1.5
joblib==1.3.2
pydantic==2.6.4
numpy==1.26.4
```

---

## Endpoint 1 — Categorize Transaction

### POST /categorize
```python
# Request
class CategorizeRequest(BaseModel):
    merchant: str
    description: Optional[str] = None
    amount: float

# Response
class CategorizeResponse(BaseModel):
    category_name: str
    confidence: float          # 0.0 to 1.0
    top_3: list[dict]          # [{ category, confidence }]
```

### Model: TF-IDF + Logistic Regression
```python
# categorizer/model.py
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

def build_pipeline():
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            analyzer='word'
        )),
        ('clf', LogisticRegression(
            max_iter=1000,
            C=1.0,
            multi_class='multinomial'
        ))
    ])

def train(X_train, y_train):
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    joblib.dump(pipeline, 'models/categorizer.joblib')
    return pipeline

def predict(text: str) -> dict:
    pipeline = joblib.load('models/categorizer.joblib')
    proba = pipeline.predict_proba([text])[0]
    classes = pipeline.classes_
    top_idx = proba.argsort()[::-1][:3]
    return {
        'category_name': classes[top_idx[0]],
        'confidence': float(proba[top_idx[0]]),
        'top_3': [{ 'category': classes[i], 'confidence': float(proba[i]) } for i in top_idx]
    }
```

### Seed Training Data Categories
```
Food & Dining: swiggy, zomato, restaurant, cafe, bakery, kfc, mcdonald
Transport: uber, ola, rapido, metro, irctc, petrol, fuel
Shopping: amazon, flipkart, myntra, mall, store
Health: pharmacy, hospital, doctor, apollo, medplus
Utilities: electricity, water, gas, broadband, jio, airtel
Entertainment: netflix, amazon prime, hotstar, movie, pvr
Education: udemy, coursera, iiit, educative
EMI: emi, loan, hdfc home
Investment: sip, mutual fund, zerodha, groww, ppf
```

### Retraining on User Overrides
```python
# Called nightly via cron
async def retrain_with_overrides(user_overrides: list[dict]):
    # Load existing training data
    df = pd.read_csv('categorizer/training_data.csv')
    # Append user overrides
    new_rows = pd.DataFrame(user_overrides)
    df = pd.concat([df, new_rows], ignore_index=True)
    # Retrain
    X = df['text'].values
    y = df['category'].values
    train(X, y)
```

---

## Endpoint 2 — Forecast Month-End Balance

### POST /forecast
```python
class ForecastRequest(BaseModel):
    daily_transactions: list[dict]   # [{ date: str, amount: float }]
    income: float
    fixed_commitments: float         # remaining EMIs + SIPs this month
    days_in_month: int
    today_day: int                   # current day of month

class ForecastResponse(BaseModel):
    projected_surplus: float
    projected_total_spend: float
    confidence: str                  # low | medium | high
    daily_spend_rate: float
```

### Model: Prophet (Phase 4)
```python
# forecaster/model.py
from prophet import Prophet
import pandas as pd

def forecast_spend(daily_transactions: list[dict], days_remaining: int):
    df = pd.DataFrame(daily_transactions)
    df.columns = ['ds', 'y']
    df['ds'] = pd.to_datetime(df['ds'])

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=days_remaining)
    forecast = model.predict(future)

    remaining_spend = forecast.tail(days_remaining)['yhat'].clip(lower=0).sum()
    return float(remaining_spend)
```

**Note:** In Phase 2, use simple linear extrapolation in Node API (see BUDGET_ENGINE.md). Prophet is Phase 4.

---

## Endpoint 3 — Batch Categorize (for CSV import)

### POST /categorize/batch
```python
class BatchRequest(BaseModel):
    transactions: list[CategorizeRequest]

class BatchResponse(BaseModel):
    results: list[CategorizeResponse]
```

Processes up to 500 transactions in one call. Returns in same order as input.

---

## Running the ML Service
```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
