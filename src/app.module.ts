/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthModule } from './security/auth/auth.module.js';
import { FilmGetController } from './film/rest/film-get.controller.js';
import { FilmModule } from './film/film.module.js';
import { FilmWriteController } from './film/rest/film-write.controller.js';
import { DevModule } from './config/dev/dev.module.js';
import { GraphQLModule } from '@nestjs/graphql';
import { HealthModule } from './health/health.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { graphQlConfig } from './config/graphql.js';
import { typeOrmModuleOptions } from './config/db.js';

@Module({
    imports: [
        AuthModule,
        FilmModule,
        DevModule,
        GraphQLModule.forRoot({
            typePaths: ['./**/*.graphql'],
            // alternativ: Mercurius (statt Apollo) fuer Fastify (statt Express)
            driver: ApolloDriver,
            debug: graphQlConfig.debug,
        }),
        LoggerModule,
        HealthModule,
        TypeOrmModule.forRoot(typeOrmModuleOptions),
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes(
                FilmGetController,
                FilmWriteController,
                'auth',
                'graphql',
            );
    }
}
