import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type FilmUpdateDTO } from '../../src/film/rest/film-write.controller.js';
import { HttpStatus } from '@nestjs/common';
import { MAX_RATING } from '../../src/film/service/jsonSchema.js';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const geaendertesFilm: FilmUpdateDTO = {
    titel: 'Geaendert',
    rating: 1,
    angebotsoption: 'KAUFEN',
    produzent: 'BAR_PRODUZENT',
    preis: 44.4,
    rabatt: 0.044,
    hochaufloesend: true,
    datum: '2022-02-03',
    isan: '3232-4001-0000-0123-Z-1050-8010-D',
    homepage: 'https://test.te',
};
const idVorhanden = '00000000-0000-0000-0000-000000000040';

const geaendertesFilmIdNichtVorhanden: FilmUpdateDTO = {
    titel: 'Nichtvorhanden',
    rating: 1,
    angebotsoption: 'KAUFEN',
    produzent: 'BAR_PRODUZENT',
    preis: 44.4,
    rabatt: 0.044,
    hochaufloesend: true,
    datum: '2022-02-04',
    isan: '3232-4001-0000-0123-Z-1050-8010-D',
    homepage: 'https://test.te',
};
const idNichtVorhanden = '99999999-9999-9999-9999-999999999999';

const geaendertesFilmInvalid: Record<string, unknown> = {
    titel: '?!$',
    rating: -1,
    angebotsoption: 'UNSICHTBAR',
    produzent: 'NO_PRODUZENT',
    preis: 0.01,
    rabatt: 2,
    hochaufloesend: true,
    datum: '12345-123-123',
    isan: 'falsche-ISAN',
};

const veraltesFilm: FilmUpdateDTO = {
    titel: 'Veraltet',
    rating: 1,
    angebotsoption: 'KAUFEN',
    produzent: 'BAR_PRODUZENT',
    preis: 44.4,
    rabatt: 0.044,
    hochaufloesend: true,
    datum: '2022-02-03',
    isan: '3232-4001-0000-0123-Z-1050-8010-D',
    homepage: 'https://test.te',
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// eslint-disable-next-line max-lines-per-function
describe('PUT /:id', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver und DB werden gestartet
    beforeAll(async () => {
        await startServer();

        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            headers,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenes Film aendern', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBe('');
    });

    test('Nicht-vorhandenes Film aendern', async () => {
        // given
        const url = `/${idNichtVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesFilmIdNichtVorhanden,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);
        expect(data).toBe(
            `Es gibt kein Film mit der ID "${idNichtVorhanden}".`,
        );
    });

    test('Vorhandenes Film aendern, aber mit ungueltigen Daten', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesFilmInvalid,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(
            expect.arrayContaining([
                'Ein Filmtitel muss mit einem Filmstaben, einer Ziffer oder _ beginnen.',
                `Eine Bewertung muss zwischen 0 und ${MAX_RATING} liegen.`,
                'Die Angebotsoption eines Filmes muss LEIHEN oder KAUFEN sein.',
                'Der Produzent eines Filmes muss FOO_PRODUZENT oder BAR_PRODUZENT sein.',
                'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
                'Das Datum muss im Format yyyy-MM-dd sein.',
                'Die ISAN-Nummer ist nicht korrekt.',
            ]),
        );
    });

    test('Vorhandenes Film aendern, aber ohne Versionsnummer', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        delete headers['If-Match'];

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_REQUIRED);
        expect(data).toBe('Header "If-Match" fehlt');
    });

    test('Vorhandenes Film aendern, aber mit alter Versionsnummer', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"-1"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            veraltesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);
        expect(data).toEqual(expect.stringContaining('Die Versionsnummer'));
    });

    test('Vorhandenes Film aendern, aber ohne Token', async () => {
        // given
        const url = `/${idVorhanden}`;
        delete headers.Authorization;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Vorhandenes Film aendern, aber mit falschem Token', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesFilm,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
});
