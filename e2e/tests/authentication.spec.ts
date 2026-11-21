import { expect, test, createMember } from "../fixtures/auth.fixture";

test("members can register, keep a session, reveal a password, and sign out", async ({ page, loginPage, chatPage }) => {
	const member = createMember();
	await page.goto("/");
	await expect(page.getByTestId("guest-prompt")).toBeVisible();
	await expect(page.getByTestId("message-input")).toHaveCount(0);

	await loginPage.openRegistration();
	const password = page.getByTestId("auth-password");
	await expect(password).toHaveAttribute("type", "password");
	await page.getByTestId("auth-name").fill(member.name);
	await page.getByTestId("auth-nickname").fill(member.nickname);
	await page.getByTestId("auth-email").fill("not-an-email");
	await expect(page.getByTestId("auth-email")).toHaveJSProperty("validity.valid", false);
	await page.getByTestId("auth-email").fill(member.email);
	await password.fill(member.password);
	await page.getByTestId("auth-password-toggle").click();
	await expect(password).toHaveAttribute("type", "text");
	await page.getByTestId("auth-password-toggle").click();
	await expect(password).toHaveAttribute("type", "password");
	await page.getByTestId("auth-submit").click();

	await expect(page.getByTestId("account-nickname")).toHaveText(member.nickname);
	await expect(page.getByTestId("account-role")).toHaveText("regular");
	await expect(page.getByTestId("message-input")).toBeVisible();
	await chatPage.waitUntilConnected();

	await page.reload();
	await expect(page.getByTestId("account-nickname")).toHaveText(member.nickname);
	await chatPage.waitUntilConnected();
	await chatPage.signOut();
	await expect(page.getByTestId("guest-prompt")).toBeVisible();
	await expect(page.getByTestId("message-input")).toHaveCount(0);
});

test("members can return with their email and password", async ({ page, loginPage, chatPage }) => {
	const member = createMember();
	await page.goto("/");
	await loginPage.register(member);
	await expect(page.getByTestId("account-nickname")).toHaveText(member.nickname);
	await chatPage.signOut();
	await loginPage.login(member.email, member.password);
	await expect(page.getByTestId("account-nickname")).toHaveText(member.nickname);
});
