-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

CREATE TABLE IF NOT EXISTS genre (
    id         CHAR(36) NOT NULL PRIMARY KEY,
    film_id    CHAR(36) NOT NULL REFERENCES film,
    genre VARCHAR(16) NOT NULL CHECK (genre = 'HORROR' OR genre = 'FANTASY'),

    INDEX genre_film_idx(film_id)
) TABLESPACE filmspace ROW_FORMAT=COMPACT;
