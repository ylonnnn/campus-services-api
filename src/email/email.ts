import email from "@sendgrid/mail";

email.setApiKey(process.env.SENDGRID_API_KEY!);

export { email };
