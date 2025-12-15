"""FastAPI service to serve the churn prediction model."""
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


PROJECT_ROOT = Path(__file__).resolve().parent
MODEL_PATH_LG = PROJECT_ROOT / "artifacts" / "churn_model_LG.joblib"
MODEL_PATH_GB = PROJECT_ROOT / "artifacts" / "churn_model_GB.joblib"
MODEL_PATH_RF = PROJECT_ROOT / "artifacts" / "churn_model_RF.joblib"
MODEL_PATH_XGB = PROJECT_ROOT / "artifacts" / "churn_model_XGB.joblib"
DATA_PATH = PROJECT_ROOT / "data" / "raw" / "spotify_churn_dataset.csv"


app = FastAPI(title="Spotify Churn Predictor", version="1.0.0")

class ChurnRequest(BaseModel):
    age: int = Field(..., ge=0)
    listening_time: int = Field(..., ge=0)
    songs_played_per_day: int = Field(..., ge=0)
    skip_rate: float = Field(..., ge=0.0, le=1.0)
    gender: Literal["Male", "Female", "Other"]
    country: str
    subscription_type: Literal["Free", "Premium", "Family", "Student"]
    device_type: Literal["Desktop", "Mobile", "Web"]


def load_training_data_for_quantiles():
    """Load training data to compute quantile values for interaction features."""
    if not DATA_PATH.exists():
        raise RuntimeError(f"Data file not found at {DATA_PATH}. Cannot compute quantile values.")
    
    df = pd.read_csv(DATA_PATH)
    if "user_id" in df.columns:
        df.set_index(df.user_id, inplace=True)
        df.drop('user_id', inplace=True, axis=1)
    
    # Return quantile values needed for interaction features
    return {
        'skip_rate_q75': df['skip_rate'].quantile(0.75),
        'listening_time_q25': df['listening_time'].quantile(0.25),
        'age_q70': df['age'].quantile(0.7)
    }


def create_interaction_features(payload: ChurnRequest, quantiles: dict) -> dict:
    """Create interaction features from input payload."""
    features = payload.dict()
    
    # 1. high_skip_low_listening
    high_skip = features['skip_rate'] > quantiles['skip_rate_q75']
    low_listening = features['listening_time'] < quantiles['listening_time_q25']
    features['high_skip_low_listening'] = 1 if (high_skip and low_listening) else 0
    
    # 2. mobile_high_skip
    mobile_high_skip = (features['device_type'] == 'Mobile') and (features['skip_rate'] > quantiles['skip_rate_q75'])
    features['mobile_high_skip'] = 1 if mobile_high_skip else 0
    
    # 3. high_skip_high_age
    high_skip_high_age = (features['skip_rate'] > quantiles['skip_rate_q75']) and (features['age'] > quantiles['age_q70'])
    features['high_skip_high_age'] = 1 if high_skip_high_age else 0
    
    return features


@app.on_event("startup")
def load_model():
    global model_LG, model_GB, model_RF, model_XGB, quantiles
    
    # Load quantile values for interaction features
    quantiles = load_training_data_for_quantiles()
    
    # Load Logistic Regression model
    if not MODEL_PATH_LG.exists():
        raise RuntimeError(f"Model not found at {MODEL_PATH_LG}. Run train_model.py first.")
    model_LG = joblib.load(MODEL_PATH_LG)
    
    # Load Gradient Boosting model
    if not MODEL_PATH_GB.exists():
        raise RuntimeError(f"Model not found at {MODEL_PATH_GB}. Run train_model.py first.")
    model_GB = joblib.load(MODEL_PATH_GB)
    
    # Load Random Forest model
    if not MODEL_PATH_RF.exists():
        raise RuntimeError(f"Model not found at {MODEL_PATH_RF}. Run train_model.py first.")
    model_RF = joblib.load(MODEL_PATH_RF)
    
    # Load XGBoost model (optional)
    if MODEL_PATH_XGB.exists():
        model_XGB = joblib.load(MODEL_PATH_XGB)
    else:
        model_XGB = None


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict_churn")
def predict(payload: ChurnRequest, model_type: str = "lg"):
    models = {"lg": model_LG, "rf": model_RF, "gb": model_GB}
    if model_XGB is not None:
        models["xgb"] = model_XGB
    
    mdl = models.get(model_type.lower())
    if mdl is None:
        available = ", ".join(models.keys())
        raise HTTPException(status_code=400, detail=f"Invalid model type. Use one of: {available}")

    # Create interaction features
    features_dict = create_interaction_features(payload, quantiles)
    
    # Create DataFrame with correct feature order
    # Order: num_features_for_prep + interaction_features + cat_features
    input_df = pd.DataFrame([{
        'age': features_dict['age'],
        'listening_time': features_dict['listening_time'],
        'songs_played_per_day': features_dict['songs_played_per_day'],
        'skip_rate': features_dict['skip_rate'],
        'high_skip_low_listening': features_dict['high_skip_low_listening'],
        'mobile_high_skip': features_dict['mobile_high_skip'],
        'high_skip_high_age': features_dict['high_skip_high_age'],
        'gender': features_dict['gender'],
        'country': features_dict['country'],
        'subscription_type': features_dict['subscription_type'],
        'device_type': features_dict['device_type']
    }])
    
    prob = float(mdl.predict_proba(input_df)[0, 1])
    label = int(prob >= 0.5)
    return {"churn_probability": prob, "churn_label": label}



