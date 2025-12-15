function Result({ result, modelType = 'LG' }) {
  if (!result) return null;

  const { prob, label } = result;  

  return (
    <div className="mt-8 p-6 bg-green-100 dark:bg-green-900/20 rounded-lg text-center transition-all duration-500 animate-fade-in">
      <h3 className="text-2xl font-bold text-spotify-green mb-2">
        Churn Probability: {prob}%
      </h3>
      <p className="text-lg mt-2">
        Churn Label: {label}  
      </p>
      <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-spotify-green h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${prob}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Kết quả từ mô hình {modelType.toUpperCase()}.</p>
    </div>
  );
}

export default Result;