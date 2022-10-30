/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Film } from './film.entity.js';

/**
 * Entity-Klasse zu einer relationalen Tabelle
 */
@Entity()
export class Genre {
    @Column('char')
    @PrimaryColumn('uuid')
    id: string | undefined;

    @ManyToOne(() => Film, (film) => film.genres)
    @JoinColumn({ name: 'film_id' })
    readonly film: Film | null | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Das Genre', type: String })
    readonly genre: string | null | undefined; //NOSONAR
}
