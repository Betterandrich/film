import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { type CreateError, type UpdateError } from '../service/errors.js';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { type Film } from '../entity/film.entity.js';
import { FilmWriteService } from '../service/film-write.service.js';
import { type IdInput } from './film-query.resolver.js';
import { JwtAuthGraphQlGuard } from '../../security/auth/jwt/jwt-auth-graphql.guard.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { Roles } from '../../security/auth/roles/roles.decorator.js';
import { RolesGraphQlGuard } from '../../security/auth/roles/roles-graphql.guard.js';
import { type Genre } from '../entity/genre.entity.js';
import { UserInputError } from 'apollo-server-express';
import { getLogger } from '../../logger/logger.js';

type FilmCreateDTO = Omit<
    Film,
    'aktualisiert' | 'erzeugt' | 'id' | 'genres' | 'version'
> & { genres: string[] };
type FilmUpdateDTO = Omit<Film, 'aktualisiert' | 'erzeugt' | 'genres'>;

@Resolver()
@UseGuards(JwtAuthGraphQlGuard, RolesGraphQlGuard)
@UseInterceptors(ResponseTimeInterceptor)
export class FilmMutationResolver {
    readonly #service: FilmWriteService;

    readonly #logger = getLogger(FilmMutationResolver.name);

    constructor(service: FilmWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async create(@Args('input') filmDTO: FilmCreateDTO) {
        this.#logger.debug('create: filmDTO=%o', filmDTO);

        const result = await this.#service.create(this.#dtoToFilm(filmDTO));
        this.#logger.debug('createFilm: result=%o', result);

        if (Object.prototype.hasOwnProperty.call(result, 'type')) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError(
                this.#errorMsgCreateFilm(result as CreateError),
            );
        }
        return result;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async update(@Args('input') film: FilmUpdateDTO) {
        this.#logger.debug('update: film=%o', film);
        const versionStr = `"${film.version?.toString()}"`;

        const result = await this.#service.update(
            film.id,
            film as Film,
            versionStr,
        );
        if (typeof result === 'object') {
            throw new UserInputError(this.#errorMsgUpdateFilm(result));
        }
        this.#logger.debug('updateFilm: result=%d', result);
        return result;
    }

    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const result = await this.#service.delete(idStr);
        this.#logger.debug('deleteFilm: result=%s', result);
        return result;
    }

    #dtoToFilm(filmDTO: FilmCreateDTO): Film {
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

    #errorMsgCreateFilm(err: CreateError) {
        switch (err.type) {
            case 'ConstraintViolations':
                return err.messages.join(' ');
            case 'TitelExists':
                return `Der Titel "${err.titel}" existiert bereits`;
            case 'IsbnExists':
                return `Die ISAN ${err.isan} existiert bereits`;
            default:
                return 'Unbekannter Fehler';
        }
    }

    #errorMsgUpdateFilm(err: UpdateError) {
        switch (err.type) {
            case 'ConstraintViolations':
                return err.messages.join(' ');
            case 'TitelExists':
                return `Der Titel "${err.titel}" existiert bereits`;
            case 'FilmNotExists':
                return `Es gibt kein Film mit der ID ${err.id}`;
            case 'VersionInvalid':
                return `"${err.version}" ist keine gueltige Versionsnummer`;
            case 'VersionOutdated':
                return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
            default:
                return 'Unbekannter Fehler';
        }
    }
}
