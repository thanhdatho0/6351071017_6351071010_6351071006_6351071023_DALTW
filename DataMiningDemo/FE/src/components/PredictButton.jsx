function PredictButton({ onReset, result, loading }) {  
  return (
    <div className="flex flex-col space-y-2">
      <button
        type="submit"
        disabled={loading}
        className={`w-full font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-spotify-green focus:outline-none ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-spotify-green hover:bg-green-600 text-white'
        }`}
      >
        {loading ? 'Đang dự đoán...' : 'Dự đoán'}
      </button>
      {result && (
        <button
          type="button"
          onClick={onReset}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
        >
          Xóa form
        </button>
      )}
    </div>
  );
}

export default PredictButton;