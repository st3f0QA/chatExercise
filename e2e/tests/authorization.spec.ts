import { expect, test, createMember } from "../fixtures/auth.fixture";

test("guests can read the room but cannot compose a message or choose a sender name", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByTestId("message-scroll")).toBeVisible();
	await expect(page.getByTestId("guest-prompt")).toBeVisible();
	await expect(page.getByTestId("message-input")).toHaveCount(0);
	await expect(page.getByTestId("auth-name")).toHaveCount(0);
	await expect(page.getByTestId("guest-sign-in")).toBeVisible();
	await expect(page.getByTestId("guest-register")).toBeVisible();
	await expect(page.getByTestId("clear-history-button")).toHaveCount(0);
	const clearStatus = await page.evaluate(async () => {
		const response = await fetch("/api/messages", { method: "DELETE" });
		return response.status;
	});
	expect(clearStatus).toBe(403);
});

test("regular members can compose messages", async ({ page, loginPage }) => {
	const member = createMember();
	await page.goto("/");
	await loginPage.register(member);
	await expect(page.getByTestId("account-role")).toHaveText("regular");
	await expect(page.getByTestId("message-input")).toBeEnabled();
	await expect(page.getByTestId("clear-history-button")).toHaveCount(0);
	const clearStatus = await page.evaluate(async () => {
		const response = await fetch("/api/messages", { method: "DELETE" });
		return response.status;
	});
	expect(clearStatus).toBe(403);
});
