"""Train churn model and save artifact for API serving."""

import joblib
from pathlib import Path
import pandas as pd
import numpy as np
from imblearn.over_sampling import BorderlineSMOTE
from imblearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from xgboost import XGBClassifier


DATA_PATH = "data/raw/spotify_churn_dataset.csv"
MODEL_DIR = Path("artifacts")
# PATH to save the trained model
# List of models to train
MODEL_CONFIGS = [
    ("LG", LogisticRegression(class_weight='balanced', max_iter=500, random_state=42, n_jobs=-1)),
    ("RF", RandomForestClassifier(n_estimators=500, class_weight='balanced', n_jobs=-1, random_state=42)),
    ("GB", GradientBoostingClassifier(learning_rate=0.05, n_estimators=500, max_depth=6, random_state=42)),
    ("XGB", XGBClassifier(
        objective='binary:logistic',
        scale_pos_weight=3,
        eval_metric='aucpr',
        n_estimators=500,
        max_depth=6,
        learning_rate=0.01,
        random_state=42,
        tree_method='hist',
        colsample=0.6,
        reg_alpha=0.1,
        reg_lambda=1.0,
        subsample=0.6
    )),
]


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    if "user_id" in df.columns:
        df.set_index(df.user_id, inplace=True)
        df.drop('user_id', inplace=True, axis=1)
    
    # Feature Engineering: Loại bỏ offline_listening và ads_listened_per_week trước khi chuyển đổi kiểu dữ liệu
    df = df.drop('offline_listening', axis=1)
    df = df.drop('ads_listened_per_week', axis=1)
    
    # Chuyển đổi kiểu dữ liệu
    cat_cols = ["gender", "country", "subscription_type", "device_type"]
    for col in cat_cols:
        df[col] = df[col].astype("category")
    df['is_churned'] = df['is_churned'].astype("category")
    
    # Tạo interaction features
    # 1. high_skip_low_listening
    high_skip = df['skip_rate'] > df['skip_rate'].quantile(0.75)
    low_listening = df['listening_time'] < df['listening_time'].quantile(0.25)
    df['high_skip_low_listening'] = np.where(high_skip & low_listening, 1, 0)
    
    # 2. mobile_high_skip
    df['mobile_high_skip'] = np.where(
        (df['device_type'] == 'Mobile') & (df['skip_rate'] > df['skip_rate'].quantile(0.75)), 1, 0
    )
    
    # 3. high_skip_high_age
    df['high_skip_high_age'] = np.where(
        (df['skip_rate'] > df['skip_rate'].quantile(0.75)) & (df['age'] > df['age'].quantile(0.7)), 1, 0
    )
    
    return df


def build_pipeline(num_features_for_prep, cat_features, interaction_features, model):
    """
    Build pipeline with preprocessing, SMOTE, and model.
    
    Args:
        num_features_for_prep: Numerical features to scale (original features only)
        cat_features: Categorical features to encode
        interaction_features: Interaction features to pass through without scaling
        model: The model to use
    """
    preprocess = ColumnTransformer(
        transformers=[
            ("num", MinMaxScaler(), num_features_for_prep),
            ("cat", OneHotEncoder(handle_unknown="ignore",  drop="first"), cat_features),
        ],
        remainder='passthrough'  # Giữ nguyên interaction features
    )
    
    smote = BorderlineSMOTE(random_state=42, sampling_strategy='minority')
    return Pipeline(steps=[("prep", preprocess), ("smote", smote), ("model", model)])


def train_and_save():
    df = load_data()
    
    # Định nghĩa features
    num_features_for_prep = ["age", "listening_time", "songs_played_per_day", "skip_rate"]
    interaction_features = ["high_skip_low_listening", "mobile_high_skip", "high_skip_high_age"]
    cat_features = ["gender", "country", "subscription_type", "device_type"]
    
    # Tất cả features để train
    all_features = num_features_for_prep + interaction_features + cat_features
    
    X = df[all_features]
    y = df["is_churned"].astype(int)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    for name, model in MODEL_CONFIGS:
        print(f"\n{'='*60}")
        print(f"Training {name} model...")
        print(f"{'='*60}")
        pipeline = build_pipeline(num_features_for_prep, cat_features, interaction_features, model)
        pipeline.fit(X_train, y_train)

        y_val_pred = pipeline.predict(X_val)
        y_val_prob = pipeline.predict_proba(X_val)[:, 1]
        
        print(f"\n{name} Validation Results:")
        print(f"ROC-AUC: {roc_auc_score(y_val, y_val_prob):.4f}")
        print("\nClassification Report:")
        print(classification_report(y_val, y_val_pred))

        model_path = MODEL_DIR / f"churn_model_{name}.joblib"
        joblib.dump(pipeline, model_path)
        print(f"\nSaved {name} model to {model_path}")


if __name__ == "__main__":
    train_and_save()

