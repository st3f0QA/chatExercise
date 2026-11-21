import type { Page } from "@playwright/test";

export class ChatPage {
	constructor(private readonly page: Page) {}

	async waitUntilConnected() {
		await this.page.getByTestId("connection-label").getByText("Live").waitFor();
	}

	async sendMessage(content: string) {
		await this.page.getByTestId("message-input").fill(content);
		await this.page.getByTestId("send-message").click();
	}

	async addEmoji(id: string) {
		await this.page.getByTestId(`emoji-${id}`).click();
	}

	async signOut() {
		await this.page.getByTestId("logout-button").click();
	}

	message(content: string) {
		return this.page.locator('[data-testid^="message-content-"]').filter({ hasText: content });
	}
}
