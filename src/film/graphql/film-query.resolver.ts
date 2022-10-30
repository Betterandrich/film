import { Args, Query, Resolver } from '@nestjs/graphql';
import { type Film } from '../entity/film.entity.js';
import { FilmReadService } from '../service/film-read.service.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';
import { getLogger } from '../../logger/logger.js';

export type FilmDTO = Omit<
    Film,
    'aktualisiert' | 'erzeugt' | 'genres'
> & { genres: string[] };
export interface IdInput {
    id: string;
}

@Resolver()
@UseInterceptors(ResponseTimeInterceptor)
export class FilmQueryResolver {
    readonly #service: FilmReadService;

    readonly #logger = getLogger(FilmQueryResolver.name);

    constructor(service: FilmReadService) {
        this.#service = service;
    }

    @Query('film')
    async findById(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('findById: id=%s', idStr);

        const film = await this.#service.findById(idStr);
        if (film === undefined) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError(
                `Es wurde kein Film mit der ID ${idStr} gefunden.`,
            );
        }
        const filmDTO = this.#toFilmDTO(film);
        this.#logger.debug('findById: filmDTO=%o', filmDTO);
        return filmDTO;
    }

    @Query('filme')
    async find(@Args() titel: { titel: string } | undefined) {
        const titelStr = titel?.titel;
        this.#logger.debug('find: titel=%s', titelStr);
        const suchkriterium = titelStr === undefined ? {} : { titel: titelStr };
        const filme = await this.#service.find(suchkriterium);
        if (filme.length === 0) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError('Es wurden keine Filme gefunden.');
        }

        const filmeDTO = filme.map((film) => this.#toFilmDTO(film));
        this.#logger.debug('find: filmeDTO=%o', filmeDTO);
        return filmeDTO;
    }

    #toFilmDTO(film: Film) {
        const genres = film.genres.map(
            (genre) => genre.genre!,
        );
        const filmDTO: FilmDTO = {
            id: film.id,
            version: film.version,
            titel: film.titel,
            rating: film.rating,
            angebotsoption: film.angebotsoption,
            produzent: film.produzent,
            preis: film.preis,
            rabatt: film.rabatt,
            hochaufloesend: film.hochaufloesend,
            datum: film.datum,
            isan: film.isan,
            homepage: film.homepage,
            genres,
        };
        return filmDTO;
    }
}
