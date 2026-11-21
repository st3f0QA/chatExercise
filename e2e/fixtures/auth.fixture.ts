import { randomUUID } from "node:crypto";
import { test as base, expect } from "@playwright/test";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage, type MemberDetails } from "../pages/LoginPage";

interface AppFixtures {
	loginPage: LoginPage;
	chatPage: ChatPage;
}

export const test = base.extend<AppFixtures>({
	loginPage: async ({ page }, use) => use(new LoginPage(page)),
	chatPage: async ({ page }, use) => use(new ChatPage(page))
});

export function createMember(): MemberDetails {
	const suffix = randomUUID().replaceAll("-", "").slice(0, 10);
	return {
		name: `Member ${suffix}`,
		email: `member-${suffix}@example.test`,
		nickname: `Room${suffix}`,
		password: "CommonRoom123!"
	};
}

export { expect };
