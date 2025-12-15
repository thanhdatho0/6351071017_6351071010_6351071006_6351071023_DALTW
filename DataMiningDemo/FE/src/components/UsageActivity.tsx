interface UsageActivityFormData {
  listening_time: number;
  songs_played_per_day: number;
  skip_rate: number;
  ads_listened_per_week: number;
  subscription_type: string; // Để check
}

function UsageActivity({
  formData,
  onChange,
}: {
  formData: UsageActivityFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const isFreePlan = formData.subscription_type === "Free";

  return (
    <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-lg font-semibold mb-4 text-spotify-green">
        Hoạt động sử dụng
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Listening Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Thời gian nghe (10p-299p) *
          </label>
          <input
            type="number"
            name="listening_time"
            value={formData.listening_time}
            onChange={onChange}
            min={10}
            max={299}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
            required
          />
        </div>
        {/* Songs Played Per Day */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Số bài hát/ngày (1-99) *
          </label>
          <input
            type="number"
            name="songs_played_per_day"
            value={formData.songs_played_per_day}
            onChange={onChange}
            min={1}
            max={99}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
            required
          />
        </div>
        {/* Skip Rate */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tỷ lệ skip (0-0.6) *
          </label>
          <input
            type="number"
            name="skip_rate"
            value={formData.skip_rate}
            onChange={onChange}
            min={0}
            max={0.6}
            step={0.01}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
            required
          />
        </div>
      </div>
      {/* Ads Listened Per Week - Chỉ nhập khi Free, mặc định 0
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Quảng cáo nghe/tuần (0-49) {isFreePlan ? "*" : ""}
        </label>
        <input
          type="number"
          name="ads_listened_per_week"
          value={isFreePlan ? formData.ads_listened_per_week : 0} // Mặc định 0 nếu không Free
          onChange={isFreePlan ? onChange : undefined}
          min={0}
          max={49}
          disabled={!isFreePlan}
          className={`w-full p-3 border rounded-lg transition-all ${
            isFreePlan
              ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
              : "border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60"
          }`}
          placeholder={!isFreePlan ? "Mặc định 0 (không quảng cáo)" : ""}
          required={isFreePlan}
        />
      </div> */}
    </fieldset>
  );
}

export default UsageActivity;
