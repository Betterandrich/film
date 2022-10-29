/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Filmen, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Klasse für fehlerhafte Filmdaten. Die Meldungstexte sind in der Property
 * `msg` gekapselt.
 */
 export interface ConstraintViolations {
    readonly type: 'ConstraintViolations';
    readonly messages: string[];
}

/**
 * Klasse für einen bereits existierenden Titel.
 */
export interface TitelExists {
    readonly type: 'TitelExists';
    readonly titel: string | null | undefined;
    readonly id?: string;
}

/**
 * Klasse für eine bereits existierende ISAN-Nummer.
 */
export interface IsbnExists {
    readonly type: 'IsbnExists';
    readonly isan: string | null | undefined;
    readonly id?: string;
}

/**
 * Union-Type für Fehler beim Neuanlegen eines Filmes:
 * - {@linkcode ConstraintViolations}
 * - {@linkcode IsbnExists}
 * - {@linkcode TitelExists}
 */
export type CreateError = ConstraintViolations | IsbnExists | TitelExists;

/**
 * Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export interface VersionInvalid {
    readonly type: 'VersionInvalid';
    readonly version: string | undefined;
}

/**
 * Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export interface VersionOutdated {
    readonly type: 'VersionOutdated';
    readonly id: string;
    readonly version: number;
}

/**
 * Klasse für ein nicht-vorhandenes Film beim Ändern.
 */
export interface FilmNotExists {
    readonly type: 'FilmNotExists';
    readonly id: string | undefined;
}

/**
 * Union-Type für Fehler beim Ändern eines Filmes:
 * - {@linkcode FilmNotExists}
 * - {@linkcode ConstraintViolations}
 * - {@linkcode TitelExists}
 * - {@linkcode VersionInvalid}
 * - {@linkcode VersionOutdated}
 */
export type UpdateError =
    | FilmNotExists
    | ConstraintViolations
    | TitelExists
    | VersionInvalid
    | VersionOutdated;

/**
 * Klasse für eine nicht-vorhandene Binärdatei.
 */
export interface FileNotFound {
    readonly type: 'FileNotFound';
    readonly filename: string;
}

/**
 * Klasse, falls es mehrere Binärdateien zu einem Film gibt.
 */
export interface MultipleFiles {
    readonly type: 'MultipleFiles';
    readonly filename: string;
}

/**
 * Klasse, falls der ContentType nicht korrekt ist.
 */
export interface InvalidContentType {
    readonly type: 'InvalidContentType';
}

/**
 * Union-Type für Fehler beim Lesen einer Binärdatei zu einem Film:
 * - {@linkcode FilmNotExists}
 * - {@linkcode FileNotFound}
 * - {@linkcode InvalidContentType}
 * - {@linkcode MultipleFiles}
 */
export type FileFindError =
    | FilmNotExists
    | FileNotFound
    | InvalidContentType
    | MultipleFiles;
