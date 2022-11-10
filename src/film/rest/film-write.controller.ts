/* eslint-disable max-lines */

/**
 * Das Modul besteht aus der Controller-Klasse für Schreiben an der REST-Schnittstelle.
 * @packageDocumentation
 */

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Headers,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { type CreateError, type UpdateError } from '../service/errors.js';
import { Request, Response } from 'express';
import { type Film } from '../entity/film.entity.js';
import { FilmWriteService } from '../service/film-write.service.js';
import { JwtAuthGuard } from '../../security/auth/jwt/jwt-auth.guard.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { Roles } from '../../security/auth/roles/roles.decorator.js';
import { RolesGuard } from '../../security/auth/roles/roles.guard.js';
// eslint-disable-next-line sort-imports
import { type Genre } from '../entity/genre.entity.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';

export type FilmDTO = Omit<
    Film,
    'aktualisiert' | 'erzeugt' | 'genres' | 'id' | 'version'
> & {
    genres: string[];
};

export type FilmUpdateDTO = Omit<
    Film,
    'aktualisiert' | 'erzeugt' | 'genres' | 'id' | 'version'
>;

/**
 * Die Controller-Klasse für die Verwaltung von Bücher.
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Film API')
@ApiBearerAuth()
export class FilmWriteController {
    readonly #service: FilmWriteService;

    readonly #logger = getLogger(FilmWriteController.name);

    constructor(service: FilmWriteService) {
        this.#service = service;
    }

    /**
     * @param film JSON-Daten für ein Film im Request-Body.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Post()
    @Roles('admin', 'mitarbeiter')
    @ApiOperation({ summary: 'Ein neuer Film anlegen' })
    @ApiCreatedResponse({ description: 'Erfolgreich neu angelegt' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Filmdaten' })
    async create(
        @Body() filmDTO: FilmDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug('create: filmDTO=%o', filmDTO);

        const result = await this.#service.create(this.#dtoToFilm(filmDTO));
        if (Object.prototype.hasOwnProperty.call(result, 'type')) {
            return this.#handleCreateError(result as CreateError, res);
        }

        const location = `${getBaseUri(req)}/${result as string}`;
        this.#logger.debug('create: location=%s', location);
        return res.location(location).send();
    }

    /**
     * @param film Filmdaten im Body des Request-Objekts.
     * @param id Pfad-Paramater für die ID.
     * @param version Versionsnummer aus dem Header _If-Match_.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Put(':id')
    @Roles('admin', 'mitarbeiter')
    @ApiOperation({
        summary: 'Ein vorhandenes Film aktualisieren',
        tags: ['Aktualisieren'],
    })
    @ApiHeader({
        name: 'If-Match',
        description: 'Header für optimistische Synchronisation',
        required: false,
    })
    @ApiHeader({
        name: 'Authorization',
        description: 'Header für JWT',
        required: true,
    })
    @ApiNoContentResponse({ description: 'Erfolgreich aktualisiert' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Filmdaten' })
    @ApiPreconditionFailedResponse({
        description: 'Falsche Version im Header "If-Match"',
    })
    @ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        description: 'Header "If-Match" fehlt',
    })
    async update(
        @Body() filmDTO: FilmUpdateDTO,
        @Param('id') id: string,
        @Headers('If-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug(
            'update: id=%s, filmDTO=%o, version=%s',
            id,
            filmDTO,
            version,
        );

        if (version === undefined) {
            const msg = 'Header "If-Match" fehlt';
            this.#logger.debug('#handleUpdateError: msg=%s', msg);
            return res
                .status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'text/plain')
                .send(msg);
        }

        const result = await this.#service.update(
            id,
            this.#updateDtoToFilm(filmDTO),
            version,
        );
        if (typeof result === 'object') {
            return this.#handleUpdateError(result, res);
        }

        this.#logger.debug('update: version=%d', result);
        return res.set('ETag', `"${result}"`).sendStatus(HttpStatus.NO_CONTENT);
    }

    /**
     * @param id Pfad-Paramater für die ID.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Film mit der ID löschen', tags: ['Loeschen'] })
    @ApiHeader({
        name: 'Authorization',
        description: 'Header für JWT',
        required: true,
    })
    @ApiNoContentResponse({
        description: 'Das Film wurde gelöscht oder war nicht vorhanden',
    })
    async delete(
        @Param('id') id: string,
        @Res() res: Response,
    ): Promise<Response<undefined>> {
        this.#logger.debug('delete: id=%s', id);

        try {
            await this.#service.delete(id);
        } catch (err) {
            this.#logger.error('delete: error=%o', err);
            return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return res.sendStatus(HttpStatus.NO_CONTENT);
    }

    #dtoToFilm(filmDTO: FilmDTO): Film {
        const film: Film = {
            id: undefined,
            version: undefined,
            titel: filmDTO.titel,
            rating: filmDTO.rating,
            angebotsoption: filmDTO.angebotsoption,
            produzent: filmDTO.produzent,
            preis: filmDTO.preis,
            rabatt: filmDTO.rabatt,
            hochaufloesend: filmDTO.hochaufloesend,
            datum: filmDTO.datum,
            isan: filmDTO.isan,
            homepage: filmDTO.homepage,
            genres: [],
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        filmDTO.genres.forEach((s) => {
            const genre: Genre = {
                id: undefined,
                genre: s,
                film,
            };
            film.genres.push(genre);
        });

        return film;
    }

    #handleCreateError(err: CreateError, res: Response) {
        switch (err.type) {
            case 'ConstraintViolations': {
                return this.#handleValidationError(err.messages, res);
            }

            case 'TitelExists': {
                return this.#handleTitelExists(err.titel, res);
            }

            case 'IsbnExists': {
                return this.#handleIsbnExists(err.isan, res);
            }

            default: {
                return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    #handleValidationError(
        messages: readonly string[],
        res: Response,
    ): Response {
        this.#logger.debug('#handleValidationError: messages=%o', messages);
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(messages);
    }

    #handleTitelExists(
        titel: string | null | undefined,
        res: Response,
    ): Response {
        const msg = `Der Titel "${titel}" existiert bereits.`;
        this.#logger.debug('#handleTitelExists(): msg=%s', msg);
        return res
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .set('Content-Type', 'text/plain')
            .send(msg);
    }

    #handleIsbnExists(
        isan: string | null | undefined,
        res: Response,
    ): Response {
        const msg = `Die ISAN-Nummer "${isan}" existiert bereits.`;
        this.#logger.debug('#handleIsbnExists(): msg=%s', msg);
        return res
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .set('Content-Type', 'text/plain')
            .send(msg);
    }

    #updateDtoToFilm(filmDTO: FilmUpdateDTO): Film {
        const film: Film = {
            id: undefined,
            version: undefined,
            titel: filmDTO.titel,
            rating: filmDTO.rating,
            angebotsoption: filmDTO.angebotsoption,
            produzent: filmDTO.produzent,
            preis: filmDTO.preis,
            rabatt: filmDTO.rabatt,
            hochaufloesend: filmDTO.hochaufloesend,
            datum: filmDTO.datum,
            isan: filmDTO.isan,
            homepage: filmDTO.homepage,
            genres: [],
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        return film;
    }

    #handleUpdateError(err: UpdateError, res: Response): Response {
        switch (err.type) {
            case 'ConstraintViolations': {
                return this.#handleValidationError(err.messages, res);
            }

            case 'FilmNotExists': {
                const { id } = err;
                const msg = `Es gibt kein Film mit der ID "${id}".`;
                this.#logger.debug('#handleUpdateError: msg=%s', msg);
                return res
                    .status(HttpStatus.PRECONDITION_FAILED)
                    .set('Content-Type', 'text/plain')
                    .send(msg);
            }

            case 'TitelExists': {
                return this.#handleTitelExists(err.titel, res);
            }

            case 'VersionInvalid': {
                const { version } = err;
                const msg = `Die Versionsnummer "${version}" ist ungueltig.`;
                this.#logger.debug('#handleUpdateError: msg=%s', msg);
                return res
                    .status(HttpStatus.PRECONDITION_FAILED)
                    .set('Content-Type', 'text/plain')
                    .send(msg);
            }

            case 'VersionOutdated': {
                const { version } = err;
                const msg = `Die Versionsnummer "${version}" ist nicht aktuell.`;
                this.#logger.debug('#handleUpdateError: msg=%s', msg);
                return res
                    .status(HttpStatus.PRECONDITION_FAILED)
                    .set('Content-Type', 'text/plain')
                    .send(msg);
            }

            default: {
                return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
/* eslint-enable max-lines */
