export class ProviderA {
  constructor() {
    this.name = "ProviderA";
    // this.baseUrl = "https://api.providerA.com/sendEmail";
  }

  async sendEmail(emailData) {
    console.log(`Sending email using ${this.name}...`);
  }

  async send({ to, subject, body }) {
    if (math.random() < 0.7) {
      console.log(`Email sent successfully using [ProviderA] to ${to}`);
    } else {
      console.log(`Failed to send email using [ProviderA] to ${to}`);
      throw new Error("ProviderA failed to send email");
    }
  }
}
