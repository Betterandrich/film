/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { type Film } from '../../film/entity/film.entity.js';
import { type Genre } from './../../film/entity/genre.entity.js';

// TypeORM kann keine SQL-Skripte ausfuehren

export const filme: Film[] = [
    // -------------------------------------------------------------------------
    // L e s e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000001',
        version: 0,
        titel: 'Alpha',
        rating: 4,
        angebotsoption: 'KAUFEN',
        produzent: 'FOO_PRODUZENT',
        preis: 11.1,
        rabatt: 0.011,
        hochaufloesend: true,
        datum: new Date('2022-02-01'),
        // "Konzeption und Realisierung eines aktiven Datenbanksystems"
        isan: '9783897225831',
        homepage: 'https://acme.at/',
        genres: [],
        erzeugt: new Date('2022-02-01'),
        aktualisiert: new Date('2022-02-01'),
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        version: 0,
        titel: 'Beta',
        rating: 2,
        angebotsoption: 'LEIHEN',
        produzent: 'BAR_PRODUZENT',
        preis: 22.2,
        rabatt: 0.022,
        hochaufloesend: true,
        datum: new Date('2022-02-02'),
        // "Verteilte Komponenten und Datenbankanbindung"
        isan: '9783827315526',
        homepage: 'https://acme.biz/',
        genres: [],
        erzeugt: new Date('2022-02-02'),
        aktualisiert: new Date('2022-02-02'),
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        version: 0,
        titel: 'Gamma',
        rating: 1,
        angebotsoption: 'KAUFEN',
        produzent: 'FOO_PRODUZENT',
        preis: 33.3,
        rabatt: 0.033,
        hochaufloesend: true,
        datum: new Date('2022-02-03'),
        // "Design Patterns"
        isan: '9780201633610',
        homepage: 'https://acme.com/',
        genres: [],
        erzeugt: new Date('2022-02-03'),
        aktualisiert: new Date('2022-02-03'),
    },
    // -------------------------------------------------------------------------
    // A e n d e r n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000040',
        version: 0,
        titel: 'Delta',
        rating: 3,
        angebotsoption: 'KAUFEN',
        produzent: 'BAR_PRODUZENT',
        preis: 44.4,
        rabatt: 0.044,
        hochaufloesend: true,
        datum: new Date('2022-02-04'),
        // "Freiburger Chorfilm"
        isan: '0007097328',
        homepage: 'https://acme.de/',
        genres: [],
        erzeugt: new Date('2022-02-04'),
        aktualisiert: new Date('2022-02-04'),
    },
    // -------------------------------------------------------------------------
    // L o e s c h e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000050',
        version: 0,
        titel: 'Epsilon',
        rating: 2,
        angebotsoption: 'LEIHEN',
        produzent: 'FOO_PRODUZENT',
        preis: 55.5,
        rabatt: 0.055,
        hochaufloesend: true,
        datum: new Date('2022-02-05'),
        // "Maschinelle Lernverfahren zur Behandlung von Bonitätsrisiken im Mobilfunkgeschäft"
        isan: '9783824404810',
        homepage: 'https://acme.es/',
        genres: [],
        erzeugt: new Date('2022-02-05'),
        aktualisiert: new Date('2022-02-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000060',
        version: 0,
        titel: 'Phi',
        rating: 2,
        angebotsoption: 'LEIHEN',
        produzent: 'FOO_PRODUZENT',
        preis: 66.6,
        rabatt: 0.066,
        hochaufloesend: true,
        datum: new Date('2022-02-06'),
        // "Software pioneers",
        isan: '9783540430810',
        homepage: 'https://acme.it/',
        genres: [],
        erzeugt: new Date('2022-02-06'),
        aktualisiert: new Date('2022-02-06'),
    },
];

export const genres: Genre[] = [
    {
        id: '00000000-0000-0000-0000-010000000001',
        film: filme[0],
        genre: 'JAVASCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-020000000001',
        film: filme[1],
        genre: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-030000000001',
        film: filme[2],
        genre: 'JAVASCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-030000000002',
        film: filme[2],
        genre: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-500000000001',
        film: filme[4],
        genre: 'TYPESCRIPT',
    },
    {
        id: '00000000-0000-0000-0000-600000000001',
        film: filme[5],
        genre: 'TYPESCRIPT',
    },
];

filme[0]!.genres.push(genres[0]!);
filme[1]!.genres.push(genres[1]!);
filme[2]!.genres.push(genres[2]!, genres[3]!);
filme[4]!.genres.push(genres[4]!);
filme[5]!.genres.push(genres[5]!);

/* eslint-enable @typescript-eslint/no-non-null-assertion */
