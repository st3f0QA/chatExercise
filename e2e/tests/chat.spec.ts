import { expect, test, createMember } from "../fixtures/auth.fixture";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";

test("two members receive text and emoji messages in real time", async ({ page, browser, loginPage, chatPage }) => {
	const firstMember = createMember();
	const secondMember = createMember();
	const secondContext = await browser.newContext();
	const secondPage = await secondContext.newPage();
	const secondLoginPage = new LoginPage(secondPage);
	const secondChatPage = new ChatPage(secondPage);

	try {
		await page.goto("/");
		await loginPage.register(firstMember);
		await chatPage.waitUntilConnected();

		await secondPage.goto("/");
		await secondLoginPage.register(secondMember);
		await secondChatPage.waitUntilConnected();
		await expect(page.getByTestId("people-count")).toHaveText("2");

		const text = `Hello from ${firstMember.nickname}`;
		await chatPage.sendMessage(text);
		await expect(chatPage.message(text)).toBeVisible();
		await expect(secondChatPage.message(text)).toBeVisible();

		const emojiMessage = `Emoji from ${firstMember.nickname} 👋`;
		await page.getByTestId("message-input").fill(`Emoji from ${firstMember.nickname} `);
		await chatPage.addEmoji("wave");
		await page.getByTestId("send-message").click();
		await expect(chatPage.message(emojiMessage)).toBeVisible();
		await expect(secondChatPage.message(emojiMessage)).toBeVisible();
	} finally {
		await secondContext.close();
	}
});
