/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecimalTransformer } from './decimal-transformer.js';
import { Genre } from './genre.entity.js';
/**
 * Alias-Typ für gültige Strings bei Produzenten.
 * "Enums get compiled in a big monster of JavaScript".
 */
export type Produzent = 'BAR_PRODUZENT' | 'FOO_PRODUZENT';

/**
 * Alias-Typ für gültige Strings bei der Angebotsoption eines Filmes.
 */
export type FilmAngebotsoption = 'KAUFEN' | 'LEIHEN';

/**
 * Entity-Klasse zu einem relationalen Tabelle
 */
@Entity()
export class Film {
    @Column('char')
    @PrimaryColumn('uuid')
    id: string | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Der Titel', type: String })
    readonly titel!: string;

    @Column('int')
    @ApiProperty({ example: 5, type: Number })
    readonly rating: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'KAUFEN', type: String })
    readonly angebotsoption: FilmAngebotsoption | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'FOO_PRODUZENT', type: String })
    readonly produzent!: Produzent;

    @Column({ type: 'decimal', transformer: new DecimalTransformer() })
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: number;

    @Column({ type: 'decimal', transformer: new DecimalTransformer() })
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: number | undefined;

    @Column('boolean')
    @ApiProperty({ example: true, type: Boolean })
    readonly hochaufloesend: boolean | undefined;

    @Column('date')
    @ApiProperty({ example: '2021-01-31' })
    readonly datum: Date | string | undefined;

    @Column('varchar')
    @ApiProperty({ example: '0-0070-0644-6', type: String })
    readonly isan!: string;

    @Column('varchar')
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;

    @OneToMany(() => Genre, (genre) => genre.film, {
        eager: true,
        cascade: ['insert'],
    })
    @ApiProperty({ example: ['HORROR', 'FANTASY'] })
    readonly genres!: Genre[];

    @CreateDateColumn({ type: 'timestamp' })
    readonly erzeugt: Date | undefined = new Date();

    @UpdateDateColumn({ type: 'timestamp' })
    readonly aktualisiert: Date | undefined = new Date();
}

export const removeIsbnDash = (film: Film) => {
    const copy = film as {
        -readonly [K in keyof Film]: Film[K]; // eslint-disable-line no-use-before-define
    };
    copy.isan = film.isan.replaceAll('-', '');
    return copy;
};
