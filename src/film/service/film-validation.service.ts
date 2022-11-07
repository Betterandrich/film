/**
 * Das Modul besteht aus der Klasse {@linkcode FilmValidationService}.
 * @packageDocumentation
 */

import Ajv2020 from 'ajv/dist/2020.js';
import { type Film } from '../entity/film.entity.js';
import { type FormatValidator } from 'ajv/dist/types/index.js';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import ajvErrors from 'ajv-errors';
import formatsPlugin from 'ajv-formats';
import { getLogger } from '../../logger/logger.js';
import { jsonSchema } from './jsonSchema.js';

export const ID_PATTERN = new RE2(
    '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
);
@Injectable()
export class FilmValidationService {
    #ajv = new Ajv2020({
        allowUnionTypes: true,
        allErrors: true,
    });

    readonly #logger = getLogger(FilmValidationService.name);

    constructor() {
        formatsPlugin(this.#ajv, ['date', 'email', 'uri']);
        ajvErrors(this.#ajv);
        this.#ajv.addFormat('ISAN', {
            type: 'string',
            validate: this.#validateISBN,
        });
    }

    validateId(id: string) {
        return ID_PATTERN.test(id);
    }

    #validateISBN: FormatValidator<string> = (subject: string) => {
        const regex =
            // eslint-disable-next-line max-len, security/detect-unsafe-regex, unicorn/no-unsafe-regex, require-unicode-regexp
            /^(?:isan )?(?:[\da-f]{4}-){4}[\da-z](?:-(?:[\da-f]{4}-){2}[\da-z])?$/i; //NOSONAR

        if (regex.test(subject)) {
            return true;
        }

        return false;
    };

    /**
     * Funktion zur Validierung, wenn neue Filme angelegt oder vorhandene Filme
     * aktualisiert bzw. überschrieben werden sollen.
     */
    validate(film: Film) {
        this.#logger.debug('validate: film=%o', film);
        const validate = this.#ajv.compile<Film>(jsonSchema);
        validate(film);

        const errors = validate.errors ?? [];
        const messages = errors
            .map((error) => error.message)
            .filter((msg) => msg !== undefined);
        this.#logger.debug(
            'validate: errors=%o, messages=%o',
            errors,
            messages,
        );
        return messages.length > 0 ? (messages as string[]) : undefined;
    }
}
