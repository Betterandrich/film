import { afterAll, beforeAll, describe } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type FilmModel } from '../../src/film/rest/film-get.controller.js';
import { HttpStatus } from '@nestjs/common';
import each from 'jest-each';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
];
const idNichtVorhanden = [
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
describe('GET /:id', () => {
    let client: AxiosInstance;

    // Testserver und DB werden gestartet
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    each(idVorhanden).test('Film zu vorhandener ID %s', async (id: string) => {
        // given
        const url = `/${id}`;

        // when
        const response: AxiosResponse<FilmModel> = await client.get(url);

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);

        // eslint-disable-next-line no-underscore-dangle
        const selfLink = data._links.self.href;

        // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
        expect(selfLink).toMatch(new RegExp(`${url}$`, 'u'));
    });

    each(idNichtVorhanden).test(
        'Kein Film zu nicht-vorhandener ID %s',
        async (id: string) => {
            // given
            const url = `/${id}`;

            // when
            const response: AxiosResponse<string> = await client.get(url);

            // then
            const { status, data } = response;

            expect(status).toBe(HttpStatus.NOT_FOUND);
            expect(data).toMatch(/^not found$/iu);
        },
    );
});
