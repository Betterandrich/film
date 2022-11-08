import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type FilmDTO } from '../../src/film/rest/film-write.controller.js';
import { HttpStatus } from '@nestjs/common';
import { ID_PATTERN } from '../../src/film/service/film-validation.service.js';
import { MAX_RATING } from '../../src/film/service/jsonSchema.js';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const neuesFilm: FilmDTO = {
    titel: 'Testrest',
    rating: 1,
    angebotsoption: 'KAUFEN',
    produzent: 'FOO_PRODUZENT',
    preis: 99.99,
    rabatt: 0.099,
    hochaufloesend: true,
    datum: '2022-02-28',
    isan: '1234-4201-0000-0123-R-1020-9010-C',
    homepage: 'https://test.de/',
    genres: ['HORROR', 'FANTASY'],
};
const neuesFilmInvalid: Record<string, unknown> = {
    titel: '!?$',
    rating: -1,
    angebotsoption: 'UNSICHTBAR',
    produzent: 'NO_PRODUZENT',
    preis: 0,
    rabatt: 2,
    hochaufloesend: true,
    datum: '12345123123',
    isan: 'falsche-ISAN',
    genres: [],
};
const neuesFilmTitelExistiert: FilmDTO = {
    titel: 'Alpha',
    rating: 1,
    angebotsoption: 'KAUFEN',
    produzent: 'FOO_PRODUZENT',
    preis: 99.99,
    rabatt: 0.099,
    hochaufloesend: true,
    datum: '2022-02-28',
    isan: '1234-4201-0000-0123-R-1020-9010-C',
    homepage: 'https://test.de/',
    genres: ['HORROR', 'FANTASY'],
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// eslint-disable-next-line max-lines-per-function
describe('POST /', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    // (done?: DoneFn) => Promise<void | undefined | unknown> | void | undefined
    // close(callback?: (err?: Error) => void): this
    afterAll(async () => {
        await shutdownServer();
    });

    test('Neues Film', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.CREATED);

        const { location } = response.headers as { location: string };

        expect(location).toBeDefined();

        const indexLastSlash: number = location.lastIndexOf('/');

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(ID_PATTERN.test(idStr)).toBe(true);

        expect(data).toBe('');
    });

    test('Neues Film mit ungueltigen Daten', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesFilmInvalid,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(
            expect.arrayContaining([
                'Ein Filmtitel muss mit einem Buchstaben, einer Ziffer oder _ beginnen.',
                `Eine Bewertung muss zwischen 0 und ${MAX_RATING} liegen.`,
                'Die Angebotsoption eines Filmes muss LEIHEN oder KAUFEN sein.',
                'Der Produzent eines Filmes muss FOO_PRODUZENT oder BAR_PRODUZENT sein.',
                'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
                'Das Datum muss im Format yyyy-MM-dd sein.',
                'Die ISAN-Nummer ist nicht korrekt.',
            ]),
        );
    });

    test('Neues Film, aber der Titel existiert bereits', async () => {
        // given
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<string> = await client.post(
            '/',
            neuesFilmTitelExistiert,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(expect.stringContaining('Titel'));
    });
});
