import { type GenericJsonSchema } from './GenericJsonSchema.js';

export const MAX_RATING = 5;

export const jsonSchema: GenericJsonSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://acme.com/film.json#',
    title: 'Film',
    description: 'Eigenschaften eines Filmes: Typen und Constraints',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            pattern:
                '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
        },
        version: {
            type: 'number',
            minimum: 0,
        },
        titel: {
            type: 'string',
            pattern: '^\\w.*',
        },
        rating: {
            type: 'number',
            minimum: 0,
            maximum: MAX_RATING,
        },
        angebotsoption: {
            type: 'string',
            enum: ['KAUFEN', 'LEIHEN', ''],
        },
        produzent: {
            type: 'string',
            enum: ['BAR_PRODUZENT', 'FOO_PRODUZENT', ''],
        },
        preis: {
            type: 'number',
            minimum: 0,
        },
        rabatt: {
            type: 'number',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1,
        },
        hochaufloesend: { type: 'boolean' },
        datum: { type: 'string', format: 'date' },
        isan: { type: 'string', format: 'ISAN' },
        homepage: { type: 'string', format: 'uri' },
        genres: {
            type: 'array',
            items: { type: 'object' },
        },
        erzeugt: { type: ['string', 'null'] },
        aktualisiert: { type: ['string', 'null'] },
    },
    required: ['titel', 'produzent', 'preis', 'isan'],
    additionalProperties: false,
    errorMessage: {
        properties: {
            version: 'Die Versionsnummer muss mindestens 0 sein.',
            titel: 'Ein Filmtitel muss mit einem Filmstaben, einer Ziffer oder _ beginnen.',
            rating: 'Eine Bewertung muss zwischen 0 und 5 liegen.',
            angebotsoption: 'Die Angebotsoption eines Filmes muss LEIHEN oder KAUFEN sein.',
            produzent: 'Der Produzent eines Filmes muss FOO_PRODUZENT oder BAR_PRODUZENT sein.',
            preis: 'Der Preis darf nicht negativ sein.',
            rabatt: 'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
            hochaufloesend: '"hochaufloesend" muss auf true oder false gesetzt sein.',
            datum: 'Das Datum muss im Format yyyy-MM-dd sein.',
            isan: 'Die ISAN-Nummer ist nicht korrekt.',
            homepage: 'Die Homepage ist nicht korrekt.',
        },
    },
};
