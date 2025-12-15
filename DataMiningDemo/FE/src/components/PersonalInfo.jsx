function PersonalInfo({ formData, onChange }) {
  const countries = ['AU', 'CA', 'DE', 'FR', 'GB', 'IN', 'MX', 'US'];  

  return (
    <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-lg font-semibold mb-4 text-spotify-green">Thông tin cá nhân</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Radio - Required */}
        <div>
          <label className="block text-sm font-medium mb-2">Giới tính *</label>
          <div className="flex space-x-6">
            {[
              { value: 'Male', label: 'Nam' },
              { value: 'Female', label: 'Nữ' },
              { value: 'Other', label: 'Khác' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={formData.gender === value}
                  onChange={onChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
                  required
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Age Number - Required, range 16-59 */}
        <div>
          <label className="block text-sm font-medium mb-2">Tuổi (16-59) *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={onChange}
            min={16}
            max={59}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
            required
          />
        </div>
      </div>
      {/* Country Dropdown - Required (str, nhưng dùng dropdown cho dễ) */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Quốc gia *</label>
        <select
          name="country"
          value={formData.country}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          required
        >
          {countries.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>
      {/* Subscription Type Radio - Required */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Loại đăng ký *</label>
        <div className="flex flex-wrap space-x-6">
          {['Free', 'Premium', 'Family', 'Student'].map((val) => (
            <label key={val} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="subscription_type"
                value={val}
                checked={formData.subscription_type === val}
                onChange={onChange}
                className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
                required
              />
              <span className="text-sm">{val}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

export default PersonalInfo;