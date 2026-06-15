import assert from 'node:assert/strict';
import {
  coupons,
  userCoupons,
  claimCoupon,
  redeemCoupon,
  calculateCouponDiscount,
  createCoupon,
  getAvailableCoupons,
  getUserAvailableCoupons,
} from './api/data/mockData';
import type { CouponType } from './shared/types';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

function resetState() {
  for (let i = coupons.length - 1; i >= 0; i--) {
    if (coupons[i].id.startsWith('test-')) {
      coupons.splice(i, 1);
    }
  }
  for (let i = userCoupons.length - 1; i >= 0; i--) {
    if (userCoupons[i].userId.startsWith('test-user-')) {
      userCoupons.splice(i, 1);
    }
  }
}

function getTestCoupon(id: string) {
  return coupons.find(c => c.id === id)!;
}

console.log('\n=== 平台优惠券模块测试用例 ===\n');

console.log('\n1. calculateCouponDiscount — 满减券计算');
test('金额≥门槛时，正确扣减', () => {
  const c = getTestCoupon('coupon-1');
  assert.equal(calculateCouponDiscount(c, 600), 50);
});
test('金额=门槛时，正确扣减', () => {
  const c = getTestCoupon('coupon-1');
  assert.equal(calculateCouponDiscount(c, 500), 50);
});
test('金额<门槛时，不优惠', () => {
  const c = getTestCoupon('coupon-1');
  assert.equal(calculateCouponDiscount(c, 300), 0);
});

console.log('\n2. calculateCouponDiscount — 折扣券计算');
test('无门槛折扣券，直接按比例计算', () => {
  const c = getTestCoupon('coupon-3');
  assert.equal(calculateCouponDiscount(c, 1000), 100);
});
test('有门槛折扣券，满足门槛时按比例', () => {
  const c = getTestCoupon('coupon-5');
  assert.equal(calculateCouponDiscount(c, 1000), 150);
});
test('有门槛折扣券，不满足门槛时不优惠', () => {
  const c = getTestCoupon('coupon-5');
  assert.equal(calculateCouponDiscount(c, 300), 0);
});

console.log('\n3. claimCoupon — 领取优惠券');
test('领取成功，返回 UserCoupon 且不影响 usedCount', () => {
  resetState();
  const beforeCount = getTestCoupon('coupon-2').usedCount;
  const uc = claimCoupon('coupon-2', 'test-user-claim');
  assert.ok(uc);
  assert.equal(uc.couponId, 'coupon-2');
  assert.equal(uc.userId, 'test-user-claim');
  assert.equal(uc.used, false);
  assert.equal(getTestCoupon('coupon-2').usedCount, beforeCount);
});
test('超过每人限领次数时领取失败', () => {
  resetState();
  claimCoupon('coupon-1', 'test-user-limit');
  const uc2 = claimCoupon('coupon-1', 'test-user-limit');
  assert.equal(uc2, null);
});
test('领取不存在的优惠券失败', () => {
  resetState();
  const uc = claimCoupon('nonexistent', 'test-user-x');
  assert.equal(uc, null);
});

console.log('\n4. redeemCoupon — 核销优惠券（核心：usedCount 递增）');
test('核销成功，usedCount +1，用户优惠券标记为已用', () => {
  resetState();
  const before = getTestCoupon('coupon-2').usedCount;
  const result = redeemCoupon('coupon-2', 'test-user-redeem-1', 'booking-test-1', 1500);
  assert.equal(result.success, true);
  assert.equal(result.discountAmount, 120);
  assert.equal(getTestCoupon('coupon-2').usedCount, before + 1);
  const uc = userCoupons.find(u => u.userId === 'test-user-redeem-1' && u.couponId === 'coupon-2');
  assert.ok(uc);
  assert.equal(uc.used, true);
  assert.equal(uc.bookingId, 'booking-test-1');
});
test('先领取再核销，usedCount 只在核销时 +1（不重复）', () => {
  resetState();
  const before = getTestCoupon('coupon-2').usedCount;
  claimCoupon('coupon-2', 'test-user-redeem-2');
  assert.equal(getTestCoupon('coupon-2').usedCount, before);
  const result = redeemCoupon('coupon-2', 'test-user-redeem-2', 'booking-test-2', 1500);
  assert.equal(result.success, true);
  assert.equal(getTestCoupon('coupon-2').usedCount, before + 1);
});
test('同一用户连续核销两张（perUserLimit=2），两次都成功', () => {
  resetState();
  const before = getTestCoupon('coupon-2').usedCount;
  const r1 = redeemCoupon('coupon-2', 'test-user-redeem-3', 'booking-test-3a', 1500);
  const r2 = redeemCoupon('coupon-2', 'test-user-redeem-3', 'booking-test-3b', 1500);
  assert.equal(r1.success, true);
  assert.equal(r2.success, true);
  assert.equal(getTestCoupon('coupon-2').usedCount, before + 2);
});
test('超过每人使用上限（perUserLimit=1），第三次核销失败', () => {
  resetState();
  redeemCoupon('coupon-1', 'test-user-redeem-4', 'booking-test-4a', 600);
  const r2 = redeemCoupon('coupon-1', 'test-user-redeem-4', 'booking-test-4b', 600);
  assert.equal(r2.success, false);
  assert.equal(r2.error, '已达该优惠券每人使用上限');
});
test('金额不满足门槛，核销失败，usedCount 不变', () => {
  resetState();
  const before = getTestCoupon('coupon-4').usedCount;
  const r = redeemCoupon('coupon-4', 'test-user-redeem-5', 'booking-test-5', 500);
  assert.equal(r.success, false);
  assert.equal(r.error, '不满足优惠券使用门槛');
  assert.equal(getTestCoupon('coupon-4').usedCount, before);
});
test('优惠券达到 totalCount，核销失败', () => {
  resetState();
  const testC = createCoupon({
    name: '限量测试券',
    type: 'full_reduction' as CouponType,
    threshold: 100,
    value: 10,
    totalCount: 2,
    perUserLimit: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: true,
  });
  const id = testC.id;
  redeemCoupon(id, 'test-user-a', 'b1', 500);
  redeemCoupon(id, 'test-user-b', 'b2', 500);
  const before = getTestCoupon(id).usedCount;
  assert.equal(before, 2);
  const r = redeemCoupon(id, 'test-user-c', 'b3', 500);
  assert.equal(r.success, false);
  assert.equal(r.error, '优惠券已被领完');
});
test('已失效优惠券，核销失败', () => {
  resetState();
  const testC = createCoupon({
    name: '已失效券',
    type: 'full_reduction' as CouponType,
    threshold: 100,
    value: 10,
    totalCount: 100,
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: false,
  });
  const r = redeemCoupon(testC.id, 'test-user-x', 'bx', 500);
  assert.equal(r.success, false);
  assert.equal(r.error, '优惠券已失效');
});
test('不存在的优惠券，核销失败', () => {
  resetState();
  const r = redeemCoupon('does-not-exist', 'test-user-x', 'bx', 500);
  assert.equal(r.success, false);
  assert.equal(r.error, '优惠券不存在');
});

console.log('\n5. getAvailableCoupons — 可用性筛选');
test('可用优惠券不包含已用完的券', () => {
  resetState();
  const testC = createCoupon({
    name: '已用完券',
    type: 'full_reduction' as CouponType,
    threshold: 100,
    value: 10,
    totalCount: 1,
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: true,
  });
  redeemCoupon(testC.id, 'test-user-exhaust', 'b-exhaust', 500);
  const available = getAvailableCoupons();
  assert.equal(available.some(c => c.id === testC.id), false);
});

console.log('\n6. 核销后用户优惠券状态追踪');
test('getUserAvailableCoupons 不包含已核销的券', () => {
  resetState();
  redeemCoupon('coupon-2', 'test-user-avail', 'booking-avail', 1500);
  const list = getUserAvailableCoupons('test-user-avail');
  assert.equal(list.length, 0);
});
test('未核销的已领取券出现在用户可用列表', () => {
  resetState();
  claimCoupon('coupon-2', 'test-user-avail2');
  const list = getUserAvailableCoupons('test-user-avail2');
  assert.equal(list.length, 1);
  assert.equal(list[0].couponId, 'coupon-2');
});

console.log('\n7. 端到端：预约创建流程触发核销');
test('多次预约使用同一张优惠券，usedCount 正确累加', () => {
  resetState();
  const before = getTestCoupon('coupon-2').usedCount;
  for (let i = 0; i < 3; i++) {
    redeemCoupon('coupon-2', `test-user-e2e-${i}`, `booking-e2e-${i}`, 1200);
  }
  assert.equal(getTestCoupon('coupon-2').usedCount, before + 3);
});

console.log('\n8. createCoupon — 后台创建优惠券');
test('创建满减券成功', () => {
  resetState();
  const c = createCoupon({
    name: '测试满减券',
    type: 'full_reduction' as CouponType,
    threshold: 300,
    value: 30,
    totalCount: 50,
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: true,
  });
  assert.equal(c.name, '测试满减券');
  assert.equal(c.type, 'full_reduction');
  assert.equal(c.usedCount, 0);
});
test('创建折扣券成功', () => {
  resetState();
  const c = createCoupon({
    name: '测试折扣券',
    type: 'discount' as CouponType,
    threshold: 0,
    value: 9.5,
    totalCount: 100,
    perUserLimit: 2,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: true,
  });
  assert.equal(c.name, '测试折扣券');
  assert.equal(c.type, 'discount');
  assert.equal(calculateCouponDiscount(c, 1000), 50);
});

console.log(`\n=== 结果：${passed} 通过，${failed} 失败 ===\n`);
resetState();
process.exit(failed > 0 ? 1 : 0);
