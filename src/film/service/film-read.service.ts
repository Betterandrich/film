import {
    Film,
    type FilmAngebotsoption,
    type Produzent,
} from './../entity/film.entity.js';
import { FilmValidationService } from './film-validation.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import { Repository } from 'typeorm';
import { getLogger } from '../../logger/logger.js';

export interface Suchkriterien {
    readonly titel?: string;
    readonly rating?: number;
    readonly angebotsoption?: FilmAngebotsoption;
    readonly produzent?: Produzent;
    readonly preis?: number;
    readonly rabatt?: number;
    readonly hochaufloesend?: boolean;
    readonly datum?: string;
    readonly isan?: string;
    readonly homepage?: string;
    readonly javascript?: boolean;
    readonly typescript?: boolean;
}

/**
 * Die Klasse `FilmReadService` implementiert das Lesen für Filme und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class FilmReadService {
    readonly #repo: Repository<Film>;

    readonly #filmProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #validationService: FilmValidationService;

    readonly #logger = getLogger(FilmReadService.name);

    constructor(
        @InjectRepository(Film) repo: Repository<Film>,
        queryBuilder: QueryBuilder,
        validationService: FilmValidationService,
    ) {
        this.#repo = repo;
        const filmDummy = new Film();
        this.#filmProps = Object.getOwnPropertyNames(filmDummy);
        this.#queryBuilder = queryBuilder;
        this.#validationService = validationService;
    }

    /**
     * Ein Film asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Filmes
     * @returns Das gefundene Film vom Typ [Film](film_entity_film_entity.Film.html) oder undefined
     *          in einem Promise aus ES2015 (vgl.: Mono aus Project Reactor oder
     *          Future aus Java)
     */
    async findById(id: string) {
        this.#logger.debug('findById: id=%s', id);

        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('findById: Ungueltige ID');
            return;
        }

        const film = await this.#queryBuilder.buildId(id).getOne();
        if (film === null) {
            this.#logger.debug('findById: Kein Film gefunden');
            return;
        }

        this.#logger.debug('findById: film=%o', film);
        return film;
    }

    /**
     * Filme asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit den gefundenen Filmen. Ggf. ist das Array leer.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#findAll();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#findAll();
        }

        if (!this.#checkKeys(keys)) {
            return [];
        }

        const filme = await this.#queryBuilder.build(suchkriterien).getMany();
        this.#logger.debug('find: filme=%o', filme);

        return filme;
    }

    async #findAll() {
        const filme = await this.#repo.find();
        this.#logger.debug('#findAll: alle filme=%o', filme);
        return filme;
    }

    #checkKeys(keys: string[]) {
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#filmProps.includes(key) &&
                key !== 'javascript' &&
                key !== 'typescript'
            ) {
                this.#logger.debug(
                    '#find: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
