import { chromium } from "playwright";
import fs from "node:fs";

const baseUrl = process.env.QA_URL || "http://127.0.0.1:8090";
const failures = [];
const report = { baseUrl, mobile: {}, desktop: {}, consoleErrors: [] };

const fail = (message) => failures.push(message);
const px = (value) => Number(String(value || "0").replace("px", "")) || 0;

async function expectVisible(locator, label) {
  if (!(await locator.count())) return fail(`${label}: missing`);
  if (!(await locator.first().isVisible())) fail(`${label}: not visible`);
}

async function fontSize(page, selector) {
  return page.locator(selector).first().evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
}

const browser = await chromium.launch({ headless: true });
try {
  // MOBILE QA
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => report.consoleErrors.push(`mobile pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("favicon")) report.consoleErrors.push(`mobile console: ${message.text()}`);
    });

    const response = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!response || response.status() >= 400) fail(`mobile HTTP status: ${response?.status()}`);
    await page.waitForTimeout(1400);

    await expectVisible(page.locator(".site-header"), "mobile header");
    await expectVisible(page.locator(".global-search"), "mobile search");
    await expectVisible(page.locator(".hero-copy h1"), "mobile hero title");
    await expectVisible(page.locator(".mobile-bottom-nav"), "mobile bottom nav");
    await expectVisible(page.locator(".product-card").first(), "mobile product card");

    const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    report.mobile.dimensions = dimensions;
    if (dimensions.scrollWidth > dimensions.width + 2) fail(`mobile horizontal overflow: ${dimensions.scrollWidth} > ${dimensions.width}`);

    const fonts = {
      hero: await fontSize(page, ".hero-copy h1"),
      section: await fontSize(page, ".section-heading h2"),
      product: await fontSize(page, ".product-card-title"),
      search: await fontSize(page, ".global-search input"),
      bottomNav: await fontSize(page, ".mobile-bottom-nav button"),
    };
    report.mobile.fonts = fonts;
    if (fonts.hero < 20) fail(`mobile hero font too small: ${fonts.hero}`);
    if (fonts.section < 16) fail(`mobile section font too small: ${fonts.section}`);
    if (fonts.product < 11) fail(`mobile product font too small: ${fonts.product}`);
    if (fonts.search < 11) fail(`mobile search font too small: ${fonts.search}`);
    if (fonts.bottomNav < 8) fail(`mobile nav font too small: ${fonts.bottomNav}`);

    // Category flow
    const firstCategory = page.locator(".mobile-category-scroll button").first();
    await firstCategory.click();
    await expectVisible(page.locator(".catalog-layer"), "mobile catalog");
    await page.waitForTimeout(500);
    const catalogProducts = await page.locator(".catalog-product-grid .product-card").count();
    report.mobile.catalogProducts = catalogProducts;
    if (catalogProducts < 1) fail("mobile catalog has no products");
    const catalogOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
    if (catalogOverflow) fail("mobile catalog horizontal overflow");
    await page.locator(".catalog-topbar .round-icon-button").click();

    // Product + cart flow
    await page.locator(".product-card-title").first().click();
    await expectVisible(page.locator(".product-sheet"), "mobile product sheet");
    await page.locator(".order-input-block textarea").fill("https://example.com/order-test");
    await page.locator(".add-to-cart-button").click();
    await page.waitForTimeout(250);
    if (await page.locator(".product-sheet").count()) fail("product sheet did not close after add to cart");
    await page.locator(".mobile-cart-button").click();
    await expectVisible(page.locator(".cart-drawer"), "mobile cart drawer");
    const cartItems = await page.locator(".cart-item").count();
    report.mobile.cartItems = cartItems;
    if (cartItems < 1) fail("cart item was not added");
    await page.locator(".drawer-header .round-icon-button").click();

    // Wallet flow
    await page.locator(".mobile-bottom-nav button").filter({ hasText: "کیف پول" }).click();
    await expectVisible(page.locator(".wallet-panel"), "mobile wallet");
    await page.locator(".wallet-amount-field input").fill("500000");
    await page.getByRole("button", { name: "ادامه و انتخاب روش پرداخت" }).click();
    const methods = page.locator(".wallet-method-list > button");
    const methodCount = await methods.count();
    report.mobile.walletMethods = methodCount;
    if (methodCount > 0) {
      await methods.first().click();
      await expectVisible(page.locator(".wallet-payment-card"), "wallet payment details");
      await page.getByRole("button", { name: "پرداخت انجام شد؛ ثبت رسید" }).click();
      await expectVisible(page.locator(".receipt-upload-box"), "wallet receipt step");
    } else {
      await expectVisible(page.locator(".wallet-empty-method"), "wallet empty payment state");
    }
    await page.locator(".wallet-panel .sheet-close").click();

    // Account honesty / no fake auth
    await page.locator(".mobile-bottom-nav button").filter({ hasText: "حساب من" }).click();
    await expectVisible(page.locator(".account-panel"), "mobile account");
    const otpDisabled = await page.locator(".account-login-button").isDisabled();
    report.mobile.otpDisabled = otpDisabled;
    if (!otpDisabled) fail("OTP action should stay disabled until backend exists");
    await page.locator(".account-panel .sheet-close").click();

    await page.screenshot({ path: "/tmp/persian-shop-v4-mobile.png", fullPage: true });
    report.mobile.screenshotBytes = fs.statSync("/tmp/persian-shop-v4-mobile.png").size;
    await page.close();
  }

  // DESKTOP QA
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => report.consoleErrors.push(`desktop pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("favicon")) report.consoleErrors.push(`desktop console: ${message.text()}`);
    });

    const response = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!response || response.status() >= 400) fail(`desktop HTTP status: ${response?.status()}`);
    await page.waitForTimeout(1300);

    await expectVisible(page.locator(".desktop-nav-row"), "desktop nav");
    await expectVisible(page.locator(".global-search"), "desktop search");
    await expectVisible(page.locator(".hero-copy h1"), "desktop hero");
    if (await page.locator(".mobile-bottom-nav").isVisible()) fail("mobile bottom nav visible on desktop");

    const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    report.desktop.dimensions = dimensions;
    if (dimensions.scrollWidth > dimensions.width + 2) fail(`desktop horizontal overflow: ${dimensions.scrollWidth} > ${dimensions.width}`);

    const fonts = {
      hero: await fontSize(page, ".hero-copy h1"),
      section: await fontSize(page, ".section-heading h2"),
      product: await fontSize(page, ".product-card-title"),
      search: await fontSize(page, ".global-search input"),
    };
    report.desktop.fonts = fonts;
    if (fonts.hero < 34) fail(`desktop hero font too small: ${fonts.hero}`);
    if (fonts.section < 19) fail(`desktop section font too small: ${fonts.section}`);
    if (fonts.product < 12) fail(`desktop product font too small: ${fonts.product}`);

    // Search discovery interaction
    const search = page.locator(".global-search input");
    await search.click();
    await expectVisible(page.locator(".search-overlay"), "desktop search overlay");
    await search.fill("تلگرام");
    await page.waitForTimeout(250);
    const searchMatches = (await page.locator(".search-product-results button").count()) + (await page.locator(".search-category-results button").count());
    report.desktop.searchMatches = searchMatches;
    if (searchMatches < 1) fail("desktop search returned no matches for تلگرام");
    await page.keyboard.press("Escape").catch(() => {});
    // backdrop click if still open
    if (await page.locator(".search-overlay-backdrop").count()) await page.locator(".search-overlay-backdrop").click({ position: { x: 4, y: 4 } }).catch(() => {});

    await page.screenshot({ path: "/tmp/persian-shop-v4-desktop.png", fullPage: true });
    report.desktop.screenshotBytes = fs.statSync("/tmp/persian-shop-v4-desktop.png").size;
    await page.close();
  }
} finally {
  await browser.close();
}

if (report.consoleErrors.length) {
  // Browser/runtime errors are critical unless explicitly whitelisted above.
  failures.push(...report.consoleErrors.slice(0, 10));
}

console.log("PERSIAN_SHOP_V4_QA_REPORT=" + JSON.stringify(report));
if (failures.length) {
  console.error("PERSIAN_SHOP_V4_QA_FAILED=" + JSON.stringify(failures));
  process.exit(1);
}
console.log("PERSIAN_SHOP_V4_QA=PASS");
