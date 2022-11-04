/**
 * Das Modul enthält die Funktion, um die Test-DB neu zu laden.
 * @packageDocumentation
 */

import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { release, type, userInfo } from 'node:os';
import RE2 from 're2';
import { getLogger } from './logger.js';
import { hash } from 'argon2';
import { k8sConfig } from '../config/kubernetes.js';
import { nodeConfig } from '../config/node.js';
import process from 'node:process';

@Injectable()
export class InfoService implements OnApplicationBootstrap {
    readonly #banner = `
        .     _______  ___   ___      __   __                                       
        .    |       ||   | |   |    |  |_|  |                                      
        .    |    ___||   | |   |    |       |                                      
        .    |   |___ |   | |   |    |       |                                      
        .    |    ___||   | |   |___ |       |                                      
        .    |   |    |   | |       || ||_|| |                                      
        .    |___|    |___| |_______||_|   |_|                                      
        .     _______  ______    __   __  _______  _______  _______         _______ 
        .    |       ||    _ |  |  | |  ||       ||       ||       |       |       |
        .    |    ___||   | ||  |  | |  ||    _  ||    _  ||    ___| ____  |___    |
        .    |   | __ |   |_||_ |  |_|  ||   |_| ||   |_| ||   |___ |____|  ___|   |
        .    |   ||  ||    __  ||       ||    ___||    ___||    ___|       |___    |
        .    |   |_| ||   |  | ||       ||   |    |   |    |   |___         ___|   |
        .    |_______||___|  |_||_______||___|    |___|    |_______|       |_______|                                                                 
    `;

    readonly #logger = getLogger(InfoService.name);

    /**
     * Die Test-DB wird im Development-Modus neu geladen.
     */
    async onApplicationBootstrap() {
        const { host, httpsOptions, nodeEnv, port, serviceHost, servicePort } =
            nodeConfig;
        const isK8s = k8sConfig.detected;
        const plattform = isK8s
            ? `Kubernetes: FILM_SERVICE_HOST=${serviceHost}, FILM_SERVICE_PORT=${servicePort}`
            : 'Kubernetes: N/A';

        this.#logger.info(this.#stripIndent(this.#banner));
        this.#logger.info('Node: %s', process.version);
        this.#logger.info('NODE_ENV: %s', nodeEnv);
        this.#logger.info(plattform);

        const desPods = isK8s ? ' des Pods' : '';
        this.#logger.info('Rechnername%s: %s', desPods, host);
        this.#logger.info('Port%s: %s', desPods, port);
        this.#logger.info(
            '%s',
            httpsOptions === undefined ? 'HTTP (ohne TLS)' : 'HTTPS',
        );
        this.#logger.info('Betriebssystem: %s (%s)', type(), release());
        this.#logger.info('Username: %s', userInfo().username);

        // const options: argon2.Options = {...};
        const hashValue = await hash('p');
        this.#logger.debug('argon2id: p -> %s', hashValue);
    }

    #stripIndent(string: string) {
        // https://github.com/jamiebuilds/min-indent/blob/master/index.js
        // \S = kein Whitespace
        // g = global, m = multiline, u = unicode
        // Array mit den Leerzeichen oder Tabs jeweils am Zeilenanfang
        const leerzeichenArray = string.match(/^[ \t]*(?=\S)/gmu);
        if (leerzeichenArray === null) {
            return string;
        }

        let indent = Number.POSITIVE_INFINITY;
        leerzeichenArray.forEach((leerzeichenStr) => {
            indent = Math.min(indent, leerzeichenStr.length);
        });

        if (indent === 0) {
            return string;
        }

        // https://github.com/sindresorhus/strip-indent/blob/main/index.js
        // g = global, m = multiline, u = unicode
        const regex = new RE2(`^[ \\t]{${indent}}`, 'gmu');
        return string.replace(regex, '');
    }
}
