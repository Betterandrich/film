import { Injectable } from '@nestjs/common';
import { type SendMailOptions } from 'nodemailer';
import { cloud } from '../config/cloud.js';
import { getLogger } from '../logger/logger.js';
import { mailConfig } from '../config/mail.js';

@Injectable()
export class MailService {
    readonly #logger = getLogger(MailService.name);

    async sendmail(subject: string, body: string) {
        if (cloud !== undefined || mailConfig.host === 'skip') {
            return;
        }

        const from = '"Joe Doe" <Joe.Doe@acme.com>';
        const to = '"Foo Bar" <Foo.Bar@acme.com>';

        const data: SendMailOptions = { from, to, subject, html: body };
        this.#logger.debug('#sendMail: data=%o', data);

        try {
            const nodemailer = await import('nodemailer');
            await nodemailer.createTransport(mailConfig).sendMail(data);
        } catch (err) {
            this.#logger.warn('#sendmail: Fehler %o', err);
        }
    }
}
