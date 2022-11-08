CREATE SCHEMA IF NOT EXISTS AUTHORIZATION film;

ALTER ROLE film SET search_path = 'film';

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
CREATE TABLE IF NOT EXISTS film (
                  -- https://www.postgresql.org/docs/current/datatype-uuid.html
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS
                  -- impliziter Index fuer Primary Key
                  -- TypeORM unterstuetzt nicht BINARY(16) fuer UUID
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE filmspace,
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT
    version       integer NOT NULL DEFAULT 0,
                  -- impliziter Index als B-Baum durch UNIQUE
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS
    titel         varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE filmspace,
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#id-1.5.4.6.6
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS
    rating        integer NOT NULL CHECK (rating >= 0 AND rating <= 5),
                  -- https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    angebotsoption           varchar(12) NOT NULL CHECK (angebotsoption ~ 'KAUFEN|LEIHEN'),
    produzent        varchar(16) NOT NULL CHECK (produzent ~ 'FOO_PRODUZENT|BAR_PRODUZENT'),
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
                  -- 10 Stellen, davon 2 Nachkommastellen
    preis         decimal(8,2) NOT NULL,
    rabatt        decimal(4,3) NOT NULL,
                  -- https://www.postgresql.org/docs/current/datatype-boolean.html
    hochaufloesend     boolean NOT NULL DEFAULT FALSE,
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    datum         date,
    homepage      varchar(40),
    isan          varchar(26) NOT NULL UNIQUE USING INDEX TABLESPACE filmspace,
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE filmspace;

CREATE TABLE IF NOT EXISTS genre (
    id         char(36) PRIMARY KEY USING INDEX TABLESPACE filmspace,
    film_id    char(36) NOT NULL REFERENCES film,
    genre varchar(16) NOT NULL CHECK (genre ~ 'HORROR|FANTASY')
) TABLESPACE filmspace;

-- default: btree
CREATE INDEX IF NOT EXISTS genre_film_idx ON genre(film_id) TABLESPACE filmspace;
