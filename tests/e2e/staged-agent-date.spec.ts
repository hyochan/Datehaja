import { expect, test } from "@playwright/test";

test.skip(
  process.env.DATEHAJA_STAGED_E2E !== "1",
  "Set DATEHAJA_STAGED_E2E=1 after staging a development Agent date.",
);

test("staged Korean agent date reads naturally from dashboard to debrief", async ({
  page,
}, testInfo) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("hyo+test1@hyo.dev");
  await page.getByRole("button", { name: "Use development code" }).click();
  await expect(page.getByLabel("Verification code")).toHaveValue("68686868");
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(page).toHaveURL(/\/(dashboard|legal\/accept)/, {
    timeout: 20_000,
  });
  expect(page.url()).not.toContain("/legal/accept");

  await page.evaluate(() => {
    window.localStorage.setItem("datehaja-locale", "ko-KR");
  });
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { name: "Sol", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("나만의 데이트 에이전트")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sol의 데이트 리포트가 도착했어요." }),
  ).toBeVisible();
  await expect(page.getByText(/I'm Sol, your dating agent/i)).toHaveCount(0);
  await expect(
    page.getByText(/안녕하세요, Sol예요\. 당신이 사람과 가까워지는 방식을 배우고/),
  ).toBeVisible();

  const debrief = page.getByRole("link", { name: /Sol × Juno/ }).first();
  await expect(debrief).toBeVisible();
  await debrief.click();

  await expect(page.getByText("실시간 대화 · 6/6 장면")).toBeVisible();
  await expect(page.getByText("마지막 상영이 끝난 뒤")).toBeVisible();
  await expect(page.getByText("두 사람의 관계 기대가 함께 갈 수 있어요")).toBeVisible();
  await expect(page.getByText(/I'm (Sol|Juno)/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "우리 소개해줘 →" })).toBeVisible();

  await testInfo.attach("staged-korean-agent-debrief", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByText("실시간 대화 · 6/6 장면")).toBeVisible();
});
