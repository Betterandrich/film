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

    #checkChars(chars: string[]) {
        /* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-for-loop, security/detect-object-injection */
        let sum = 0;
        let check: number | string;

        if (chars.length === 9) {
            chars.reverse();
            for (let i = 0; i < chars.length; i++) {
                sum += (i + 2) * Number.parseInt(chars[i] ?? '', 10);
            }
            check = 11 - (sum % 11); // eslint-disable-line @typescript-eslint/no-extra-parens
            if (check === 10) {
                check = 'X';
            } else if (check === 11) {
                check = '0';
            }
        } else {
            for (let i = 0; i < chars.length; i++) {
                sum += ((i % 2) * 2 + 1) * Number.parseInt(chars[i] ?? '', 10); // eslint-disable-line @typescript-eslint/no-extra-parens
            }
            check = 10 - (sum % 10); // eslint-disable-line @typescript-eslint/no-extra-parens
            if (check === 10) {
                check = '0';
            }
        }
        return check;
        /* eslint-enable @typescript-eslint/no-magic-numbers, unicorn/no-for-loop, security/detect-object-injection */
    }

    #validateISBN: FormatValidator<string> = (subject: string) => {
        /* eslint-disable max-len, unicorn/no-unsafe-regex, security/detect-unsafe-regex, regexp/no-super-linear-backtracking */
        const regex =
            /^(?:ISAN(?:-1[03])?:? )?(?=[\dX]{10}$|(?=(?:\d+[- ]){3})[- \dX]{13}$|97[89]\d{10}$|(?=(?:\d+[- ]){4})[- \d]{17}$)(?:97[89][- ]?)?\d{1,5}[- ]?\d+[- ]?\d+[- ]?[\dX]$/u; //NOSONAR
        /* eslint-enable max-len, unicorn/no-unsafe-regex, security/detect-unsafe-regex, regexp/no-super-linear-backtracking */

        if (regex.test(subject)) {
            const chars = subject
                .replace(/[ -]|^ISAN(?:-1[03])?:?/gu, '')
                .split(''); // eslint-disable-line unicorn/prefer-spread
            const last = chars.pop();

            const check = this.#checkChars(chars);

            // eslint-disable-next-line eqeqeq
            if (check == last) {
                return true;
            }
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
