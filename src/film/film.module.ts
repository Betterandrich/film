import { AuthModule } from '../security/auth/auth.module.js';
import { Film } from './entity/film.entity.js';
import { FilmGetController } from './rest/film-get.controller.js';
import { FilmMutationResolver } from './graphql/film-mutation.resolver.js';
import { FilmQueryResolver } from './graphql/film-query.resolver.js';
import { FilmReadService } from './service/film-read.service.js';
import { FilmValidationService } from './service/film-validation.service.js';
import { FilmWriteController } from './rest/film-write.controller.js';
import { FilmWriteService } from './service/film-write.service.js';
import { Genre } from './entity/genre.entity.js';
import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Bücher.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit Controller- und Service-Klassen sowie der
 * Funktionalität für TypeORM.
 */
@Module({
    imports: [
        MailModule,
        // siehe auch src\app.module.ts
        TypeOrmModule.forFeature([Film, Genre]),
        AuthModule,
    ],
    controllers: [FilmGetController, FilmWriteController],
    // Provider sind z.B. Service-Klassen fuer DI
    providers: [
        FilmReadService,
        FilmWriteService,
        FilmValidationService,
        FilmQueryResolver,
        FilmMutationResolver,
        QueryBuilder,
    ],
    // Export der Provider fuer DI in anderen Modulen
    exports: [FilmReadService, FilmWriteService, FilmValidationService],
})
export class FilmModule {}
