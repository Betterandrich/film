// Modul (in JS) = Datei
// Pfad innerhalb von Packages in node_modules ("nicht-relative Imports")
import {
    DocumentBuilder,
    type SwaggerCustomOptions,
    SwaggerModule,
} from '@nestjs/swagger';
// relativer Import
import { AppModule } from './app.module.js';
import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { corsOptions } from './security/http/cors.options.js';
import { helmetHandlers } from './security/http/helmet.handler.js';
import { nodeConfig } from './config/node.js';
import { paths } from './config/paths.js';

const { httpsOptions, port } = nodeConfig;

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Film')
        .setDescription('Beispiel für Software Engineering')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const options: SwaggerCustomOptions = {
        customSiteTitle: 'Software Engineering 2021/22',
    };
    SwaggerModule.setup(paths.swagger, app, document, options);
};

interface Layer {
    route:
        | {
              path: string;
              stack: [{ method: string }];
          }
        | undefined;
}

interface Route {
    path: string;
    method: string;
}

const bootstrap = async () => {
    const app =
        httpsOptions === undefined
            ? await NestFactory.create(AppModule)
            : await NestFactory.create(AppModule, { httpsOptions });

    app.use(helmetHandlers);

    setupSwagger(app);
    // compression von Express fuer GZip-Komprimierung
    // Default "Chunk Size" ist 16 KB: https://github.com/expressjs/compression#chunksize
    app.use(compression());
    // cors von Express fuer CORS (= cross origin resource sharing)
    app.enableCors(corsOptions);

    await app.listen(port);

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, no-underscore-dangle */
    const availableRoutes: Route[] = app
        .getHttpServer()
        // type-coverage:ignore-next-line
        ._events.request._router.stack.filter(
            (layer: Layer) => layer.route !== undefined,
        )
        // type-coverage:ignore-next-line
        .map((layer: Layer) => {
            const { route } = layer;
            return {
                path: route?.path,
                method: route?.stack[0].method,
            };
        })
        // type-coverage:ignore-next-line
        .sort((a: Route, b: Route) => a.path.localeCompare(b.path));
    console.info('Endpoints:', availableRoutes);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, no-underscore-dangle */
};

// Top-level await ab ES 2020
await bootstrap();

// IIFE  = Immediately Invoked Function Expression
// IIAFE = Immediately Invoked Asynchronous Function Expression
// (async () => {
//     await bootstrap(); // ab ES 2017
// })();

// Promise mit then() ab ES 2015
// bootstrap()
//     .then(() => console.log(`Server gestartet auf Port ${port}`)) // eslint-disable-line security-node/detect-crlf
//     .catch((err) => console.error('Fehler bei bootstrap():', err));
