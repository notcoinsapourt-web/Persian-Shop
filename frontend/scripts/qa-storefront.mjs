import { chromium } from "playwright";
import fs from "node:fs";

const baseUrl = process.env.QA_URL || "http://127.0.0.1:8090";
const failures = [];
const report = { baseUrl, mobile: {}, desktop: {}, auth: {}, brand: {}, consoleErrors: [] };

const fail = (message) => failures.push(message);

async function expectVisible(locator, label) {
  if (!(await locator.count())) return fail(`${label}: missing`);
  if (!(await locator.first().isVisible())) fail(`${label}: not visible`);
}

async function fontSize(page, selector) {
  return page.locator(selector).first().evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
}

async function brandFontState(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => ({
    regular: document.fonts.check('14px "IRANYekan"'),
    bold: document.fonts.check('18px "IRANYekanLoginBold"'),
    bodyFamily: getComputedStyle(document.body).fontFamily,
  }));
}

const browser = await chromium.launch({ headless: true });
try {
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
    await expectVisible(page.locator(".brand-logo-image img"), "Persian Shop brand logo");
    await expectVisible(page.locator(".global-search"), "mobile search");
    await expectVisible(page.locator(".hero-copy h1"), "mobile hero title");
    await expectVisible(page.locator(".mobile-bottom-nav"), "mobile bottom nav");
    await expectVisible(page.locator(".product-card").first(), "mobile product card");

    const fontState = await brandFontState(page);
    report.brand.mobile = fontState;
    if (!fontState.regular) fail("RIVA IRANYekan regular font did not load");
    if (!fontState.bold) fail("RIVA IRANYekanLoginBold font did not load");
    if (!fontState.bodyFamily.includes("IRANYekan")) fail(`body is not using RIVA font: ${fontState.bodyFamily}`);

    const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    report.mobile.dimensions = dimensions;
    if (dimensions.scrollWidth > dimensions.width + 2) fail(`mobile horizontal overflow: ${dimensions.scrollWidth} > ${dimensions.width}`);

    const fonts = {
      hero: await fontSize(page, ".hero-copy h1"),
      section: await fontSize(page, ".section-heading h2"),
      product: await fontSize(page, ".product-card-title"),
      search: await fontSize(page, ".global-search input"),
      bottomNav: await fontSize(page, ".mobile-bottom-nav button"),
      metadata: await fontSize(page, ".product-card small"),
    };
    report.mobile.fonts = fonts;
    if (fonts.hero < 24) fail(`mobile hero font too small: ${fonts.hero}`);
    if (fonts.section < 18) fail(`mobile section font too small: ${fonts.section}`);
    if (fonts.product < 13) fail(`mobile product font too small: ${fonts.product}`);
    if (fonts.search < 12) fail(`mobile search font too small: ${fonts.search}`);
    if (fonts.bottomNav < 11) fail(`mobile nav font too small: ${fonts.bottomNav}`);
    if (fonts.metadata < 11) fail(`mobile metadata font too small: ${fonts.metadata}`);

    const visibleWalletTabs = await page.locator(".mobile-bottom-nav button").filter({ hasText: "کیف پول" }).count();
    report.mobile.guestWalletTabs = visibleWalletTabs;
    if (visibleWalletTabs !== 0) fail("guest wallet tab should be hidden");
    if (await page.locator(".wallet-promo").count()) fail("guest wallet promo should be hidden");

    const meResponse = await page.request.get(`${baseUrl}/api/auth/me`);
    const mePayload = await meResponse.json();
    const walletResponse = await page.request.get(`${baseUrl}/api/wallet`);
    report.auth.guestMeStatus = meResponse.status();
    report.auth.guestWalletStatus = walletResponse.status();
    if (meResponse.status() !== 200 || mePayload.user !== null) fail(`guest /api/auth/me should return 200 with user:null`);
    if (walletResponse.status() !== 401) fail(`guest /api/wallet expected 401, got ${walletResponse.status()}`);

    await page.locator(".mobile-bottom-nav button").filter({ hasText: "حساب من" }).click();
    await expectVisible(page.locator(".account-panel"), "mobile account");
    await page.getByRole("button", { name: "ثبت‌نام", exact: true }).click();
    const authInputs = page.locator(".account-auth-form input");
    report.auth.registrationInputs = await authInputs.count();
    if ((await authInputs.count()) !== 4) fail("registration form should have 4 inputs");
    const phoneLabelText = await page.locator(".account-auth-form label").last().innerText();
    if (!phoneLabelText.includes("اختیاری")) fail("phone field should be visibly optional");
    await page.locator(".account-panel .sheet-close").click();

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
    const checkoutLogin = page.locator(".cart-drawer").getByRole("button", { name: "ورود یا ثبت‌نام", exact: true });
    await expectVisible(checkoutLogin, "guest checkout login gate");
    await checkoutLogin.click();
    await expectVisible(page.locator(".account-panel"), "account opened from checkout gate");
    await page.locator(".account-panel .sheet-close").click();

    await page.screenshot({ path: "/tmp/persian-shop-v4-mobile.png", fullPage: true });
    report.mobile.screenshotBytes = fs.statSync("/tmp/persian-shop-v4-mobile.png").size;
    await page.close();
  }

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
    if (await page.locator(".desktop-nav-row .nav-utility").filter({ hasText: "کیف پول" }).count()) fail("desktop guest wallet navigation should be hidden");

    const fontState = await brandFontState(page);
    report.brand.desktop = fontState;
    if (!fontState.regular || !fontState.bold) fail("RIVA fonts are not loaded on desktop");

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
    if (fonts.product < 13) fail(`desktop product font too small: ${fonts.product}`);
    if (fonts.search < 12) fail(`desktop search font too small: ${fonts.search}`);

    const search = page.locator(".global-search input");
    await search.click();
    await expectVisible(page.locator(".search-overlay"), "desktop search overlay");
    await search.fill("تلگرام");
    await page.waitForTimeout(250);
    const searchMatches = (await page.locator(".search-product-results button").count()) + (await page.locator(".search-category-results button").count());
    report.desktop.searchMatches = searchMatches;
    if (searchMatches < 1) fail("desktop search returned no matches for تلگرام");
    if (await page.locator(".search-overlay-backdrop").count()) await page.locator(".search-overlay-backdrop").click({ position: { x: 4, y: 4 } }).catch(() => {});

    await page.locator(".header-account").click();
    await expectVisible(page.locator(".account-panel"), "desktop account panel");
    await page.getByRole("button", { name: "ثبت‌نام", exact: true }).click();
    const panelOverflow = await page.locator(".account-panel").evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    if (panelOverflow) fail("desktop account panel horizontal overflow");
    await page.locator(".account-panel .sheet-close").click();

    await page.screenshot({ path: "/tmp/persian-shop-v4-desktop.png", fullPage: true });
    report.desktop.screenshotBytes = fs.statSync("/tmp/persian-shop-v4-desktop.png").size;
    await page.close();
  }
} finally {
  await browser.close();
}

if (report.consoleErrors.length) failures.push(...report.consoleErrors.slice(0, 10));

console.log("PERSIAN_SHOP_V4_QA_REPORT=" + JSON.stringify(report));
if (failures.length) {
  console.error("PERSIAN_SHOP_V4_QA_FAILED=" + JSON.stringify(failures));
  process.exit(1);
}
console.log("PERSIAN_SHOP_V4_QA=PASS");
