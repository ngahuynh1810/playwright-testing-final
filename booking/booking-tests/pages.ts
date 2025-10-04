import { Page } from "@playwright/test";

export class BookingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("https://example-booking.com"); // thay link web của bạn
  }

  async bookTicket(name: string, email: string, date: string) {
    await this.page.fill("#name", name);
    await this.page.fill("#email", email);
    await this.page.fill("#date", date);
    await this.page.click("#submit");
  }

  async getSuccessMessage() {
    return this.page.textContent(".success-message");
  }
}
