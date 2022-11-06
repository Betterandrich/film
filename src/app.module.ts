import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthModule } from './security/auth/auth.module.js';
import { DevModule } from './config/dev/dev.module.js';
import { FilmGetController } from './film/rest/film-get.controller.js';
import { FilmModule } from './film/film.module.js';
import { FilmWriteController } from './film/rest/film-write.controller.js';
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
