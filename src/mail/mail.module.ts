import { MailService } from './mail.service.js';
import { Module } from '@nestjs/common';

/**
 * Das Modul besteht aus Services für Mail.
 * @packageDocumentation
 */

@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
