import { expect, test, createMember } from "../fixtures/auth.fixture";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";

test("the admin can clear chat history for everyone", async ({ page, browser, chatPage }) => {
	const loginPage = new LoginPage(page);
	const member = createMember();
	const memberContext = await browser.newContext();
	const memberPage = await memberContext.newPage();
	const memberLoginPage = new LoginPage(memberPage);
	const memberChatPage = new ChatPage(memberPage);

	try {
		await page.goto("/");
		await loginPage.login("admin@localhost.test", "Admin123!");
		await expect(page.getByTestId("account-role")).toHaveText("admin");
		await expect(page.getByTestId("message-input")).toBeEnabled();
		await chatPage.waitUntilConnected();

		await memberPage.goto("/");
		await memberLoginPage.register(member);
		await expect(memberPage.getByTestId("account-role")).toHaveText("regular");
		await memberChatPage.waitUntilConnected();
		await expect(page.getByTestId("people-list").getByText(member.nickname)).toBeVisible();
		await expect(memberPage.getByTestId("people-list").getByText("Avery")).toBeVisible();
		await expect(page.getByTestId("clear-history-button")).toBeVisible();
		await expect(memberPage.getByTestId("clear-history-button")).toHaveCount(0);

		const message = `Admin history check ${Date.now()}`;
		await chatPage.sendMessage(message);
		await expect(chatPage.message(message)).toBeVisible();
		await expect(memberChatPage.message(message)).toBeVisible();

		await page.getByTestId("clear-history-button").click();
		await expect(page.getByTestId("clear-history-dialog")).toBeVisible();
		await page.getByTestId("cancel-clear-history").click();
		await expect(page.getByTestId("clear-history-dialog")).toHaveCount(0);
		await expect(chatPage.message(message)).toBeVisible();

		await page.getByTestId("clear-history-button").click();
		await page.getByTestId("confirm-clear-history").click();
		await expect(page.getByTestId("empty-messages")).toBeVisible();
		await expect(memberPage.getByTestId("empty-messages")).toBeVisible();

		await page.reload();
		await expect(page.getByTestId("empty-messages")).toBeVisible();
		await expect(page.getByTestId("clear-history-button")).toBeVisible();
	} finally {
		await memberContext.close();
	}
});
