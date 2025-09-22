import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private getTemplate(templateName: string, variables: Record<string, string>) {
    const filePath = path.join(__dirname, 'templates', templateName);
    let html = fs.readFileSync(filePath, 'utf8');

    // Replace semua {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });

    return html;
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;

    const html = this.getTemplate('verify-email.html', {
      name,
      verifyUrl,
      year: String(new Date().getFullYear()),
    });

    try {
      await this.transporter.sendMail({
        from: `"No Reply" <${process.env.MAIL_USER}>`,
        to,
        subject: 'Verifikasi Email Anda',
        html,
      });
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
    const html = this.getTemplate('reset-password.html', {
      name,
      resetUrl,
      year: String(new Date().getFullYear()),
    });

    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Reset Password',
      html,
    });
  }
}
