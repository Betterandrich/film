import { Agent } from 'node:https';
import { AppModule } from '../src/app.module.js';
import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { nodeConfig } from '../src/config/node.js';
import { paths } from '../src/config/paths.js';

export const loginPath = `${paths.auth}/${paths.login}`;

export const { host, port } = nodeConfig;

const { httpsOptions } = nodeConfig;

// -----------------------------------------------------------------------------
// T e s t s e r v e r   m i t   H T T P S
// -----------------------------------------------------------------------------
let server: INestApplication;

export const startServer = async () => {
    if (httpsOptions === undefined) {
        throw new Error('HTTPS wird nicht konfiguriert.');
    }

    server = await NestFactory.create(AppModule, {
        httpsOptions,
        logger: ['log'],
        // logger: ['debug'],
    });
    await server.listen(port);
    return server;
};

export const shutdownServer = async () => {
    try {
        await server.close();
    } catch {
        console.warn('Der Server wurde fehlerhaft beendet.');
    }
};

// Zertifikate
export const httpsAgent = new Agent({
    requestCert: true,
    rejectUnauthorized: false,
    ca: httpsOptions?.cert as Buffer,
});
