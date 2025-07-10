export class ProviderB {
  constructor() {
    this.name = "ProviderB";
    // this.baseUrl = "https://api.providerA.com/sendEmail";
  }

  async sendEmail(emailData) {
    console.log(`Sending email using ${this.name}...`);
  }

  async send({ to, subject, body }) {
    if (Math.random() < 0.9) {
      console.log(`Email sent successfully using [ProviderB] to ${to}`);
    } else {
      console.log(`Failed to send email using [ProviderB] to ${to}`);
      throw new Error("ProviderA failed to send email");
    }
  }
}
