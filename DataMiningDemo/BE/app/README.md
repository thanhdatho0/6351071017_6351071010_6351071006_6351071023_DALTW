# Spotify Churn API

Serve churn prediction model via FastAPI.

## Cấu trúc

- `train_model.py`: train LogisticRegression + SMOTE pipeline, lưu `artifacts/churn_model.joblib`.
- `main.py`: FastAPI load model, endpoints `/health`, `/predict`.
- `requirements.txt`: dependencies.

## Chuẩn bị môi trường

```ps1
cd app
python -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
```

## Train và lưu model

```ps1
python train_model.py
```

Kết quả: file `artifacts/churn_model.joblib`.

## Chạy API

```ps1
uvicorn main:app --reload --port 8000
```

Kiểm tra: mở http://localhost:8000/docs.

## Gọi thử

```Example
{
  "age": 25,
  "listening_time": 100,
  "songs_played_per_day": 23,
  "skip_rate": 0.2,
  "gender": "Female",
  "country": "CA",
  "subscription_type": "Free",
  "device_type": "Desktop"
}
{
  "churn_probability": 0.48497140531413563,
  "churn_label": 0
}


{
  "age": 25,
  "listening_time": 100,
  "songs_played_per_day": 23,
  "skip_rate": 0.2,
  "gender": "Female",
  "country": "CA",
  "subscription_type": "Free",
  "device_type": "Desktop"
}
{

  "churn_probability": 0.48497140531413563,
  "churn_label": 0
}


{
  "age": 25,
  "listening_time": 120,
  "songs_played_per_day": 33,
  "skip_rate": 0.1,
  "gender": "Male",
  "country": "US",
  "subscription_type": "Premium",
  "device_type": "Mobile"
}

{
  "churn_probability": 0.46654173522841036,
  "churn_label": 0
}


```

Trả về: `{"churn_probability":..., "churn_label":0/1}`.

## Ghi chú

- Nếu thiếu file model, chạy lại `train_model.py`.
- Có thể thay mô hình/siêu tham số trong `train_model.py` và train lại.
