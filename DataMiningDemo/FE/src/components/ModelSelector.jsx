function ModelSelector({ modelType, onChange }) {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Chọn mô hình dự đoán </label>
      <div className="flex space-x-6">
        {[
          { value: 'lg', label: 'Logistic Regression (LG)' },
          { value: 'rf', label: 'Random Forest (RF)' },
          { value: 'xgb', label: 'XGBoost (XGB)' },
          { value: 'gb', label: 'Gradient Boosting (GB)' },
        ].map(({ value, label }) => (
          <label key={value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="model_type"
              value={value}
              checked={modelType === value}
              onChange={onChange}
              className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
            />
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ModelSelector;