import type { Page } from "@playwright/test";

export interface MemberDetails {
	name: string;
	email: string;
	nickname: string;
	password: string;
}

export class LoginPage {
	constructor(private readonly page: Page) {}

	async openRegistration() {
		await this.page.getByTestId("guest-register").click();
	}

	async openLogin() {
		await this.page.getByTestId("guest-sign-in").click();
	}

	async register(member: MemberDetails) {
		await this.openRegistration();
		await this.page.getByTestId("auth-name").fill(member.name);
		await this.page.getByTestId("auth-nickname").fill(member.nickname);
		await this.page.getByTestId("auth-email").fill(member.email);
		await this.page.getByTestId("auth-password").fill(member.password);
		await this.page.getByTestId("auth-submit").click();
	}

	async login(email: string, password: string) {
		await this.openLogin();
		await this.page.getByTestId("auth-email").fill(email);
		await this.page.getByTestId("auth-password").fill(password);
		await this.page.getByTestId("auth-submit").click();
	}
}
