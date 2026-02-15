<script lang="ts">
export default {}
</script>

<style lang="scss">
@import "uview-plus/index.scss";

page {
  background: #f5f7fb;
  color: #1f2937;
  font-size: 28rpx;
}

.page {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
}

.row {
  display: flex;
  align-items: center;
}

.between {
  justify-content: space-between;
}

.gap {
  gap: 16rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
}

.sub-title {
  font-size: 26rpx;
  color: #6b7280;
}

.required::before {
  content: "*";
  color: #ef4444;
  margin-right: 8rpx;
}

.value-placeholder {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
