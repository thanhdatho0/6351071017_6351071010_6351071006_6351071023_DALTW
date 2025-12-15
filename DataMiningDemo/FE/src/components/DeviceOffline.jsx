function DeviceOffline({ formData, onChange }) {
  return (
    <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-lg font-semibold mb-4 text-spotify-green">Thiết bị & Offline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Loại thiết bị *</label>
          <div className="flex space-x-6">
            {['Desktop', 'Mobile', 'Web'].map((val) => (
              <label key={val} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="device_type"
                  value={val}
                  checked={formData.device_type === val}
                  onChange={onChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
                  required
                />
                <span className="text-sm">{val}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Offline Listening Radio - Required, 0/1 */}
        {/* <div>
          <label className="block text-sm font-medium mb-2">Nghe offline *</label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="offline_listening"
                value="1"  // Đảm bảo string
                checked={formData.offline_listening == "1"}  // Loose == để match number/string
                onChange={onChange}
                className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
                required
              />
              <span className="text-sm">Có</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="offline_listening"
                value="0"  // Đảm bảo string
                checked={formData.offline_listening == "0"}  // Loose == để match number/string
                onChange={onChange}
                className="rounded border-gray-300 dark:border-gray-600 text-spotify-green focus:ring-spotify-green"
                required  // Thêm required cho group validation
              />
              <span className="text-sm">Không</span>
            </label>
          </div>
        </div> */}
      </div>
    </fieldset>
  );
}

export default DeviceOffline;