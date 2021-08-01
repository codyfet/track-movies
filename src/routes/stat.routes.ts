import {ICastItem} from "./../interfaces/CastItem";
import {IGenre} from "./../interfaces/Genre";
import express, {Request, Response, Router} from "express";
import _ from "lodash";
import Record from "../models/Record";
import {FilterQuery} from "mongoose";
import {COUNTRIES_MAP} from "../consts";
import {IRecord} from "../interfaces/Record";
import {ICrewItem} from "../interfaces/CrewItem";

const router: Router = express.Router();

/**
 * Класс для вычисления статистики по фильмам пользовтеля.
 */
class StatCalculator {
    /**
     * Вычисляем статистику по количеству оценок.
     */
    static getMarksData(movies: IRecord[]) {
        const marksData = [];
        const markGroupedMovies = _.groupBy(movies, (item: IRecord) => item.rating);

        for (let i = 1; i < 11; i++) {
            const mark = "" + i;

            marksData.push({
                mark,
                markCount: markGroupedMovies[mark] ? markGroupedMovies[mark].length : 0,
            });
        }

        return marksData;
    }

    /**
     * Вычисляем статистику по жанрам.
     */
    static genresData(movies: IRecord[]): {name: string; value: number}[] {
        const genresData: {name: string; value: number}[] = [];
        const genres: IGenre[] = movies.reduce(
            (acc: IGenre[], item: IRecord) => acc.concat(item.genres),
            []
        );
        const genresGrouped = _.groupBy(genres, "name");
        const genresKeys = Object.keys(genresGrouped);

        _.forEach(genresKeys, (genreName: string) => {
            genresData.push({
                name: genreName,
                value: genresGrouped[genreName].length,
            });
        });
        // Сортируем и забираем только первые 10.
        const genresFilteredResult = genresData.sort((a, b) => b.value - a.value).slice(0, 10);
        // Остальные складываем в "Другое".
        genresFilteredResult.push({
            name: "другое",
            value: genresData
                .slice(10, genresData.length - 1)
                .reduce((acc, item) => item.value + acc, 0),
        });

        return genresFilteredResult;
    }

    /**
     * Вычисляем статистику по странам.
     */
    static getCountriesData(
        movies: IRecord[]
    ): {country: string; countryCount: number; countryName: string}[] {
        const countriesData: {country: string; countryCount: number; countryName: string}[] = [];
        const countryResult: {[country: string]: number} = {};
        const countries: string[] = movies.reduce(
            (acc: string[], item: IRecord) => acc.concat(item.production_countries),
            []
        );

        _.forEach(countries, (country: string) => {
            if (countryResult[country]) {
                countryResult[country] = ++countryResult[country];
            } else {
                countryResult[country] = 1;
            }
        });

        const countryKeys: string[] = Object.keys(countryResult);

        _.forEach(countryKeys, (key: string) => {
            countriesData.push({
                country: key,
                countryCount: countryResult[key],
                countryName: COUNTRIES_MAP[key.toLowerCase()],
            });
        });

        const countriesFilteredResult = countriesData
            .sort((a, b) => b.countryCount - a.countryCount)
            .slice(0, 10);

        /**
         * Остальные складываем в "Другое".
         */
        countriesFilteredResult.push({
            country: "другое",
            countryCount: countriesData
                .slice(10, countriesData.length - 1)
                .reduce((acc, item) => item.countryCount + acc, 0),
            countryName: "другое",
        });

        return countriesFilteredResult;
    }

    /**
     * Вычисляем статистику по годам.
     */
    static getYearsData(movies: IRecord[]): {year: string; yearCount: number}[] {
        const yearsData: {year: string; yearCount: number}[] = [];
        const yearsGroupedMovies = _.groupBy(movies, "releaseYear");

        for (let i = 1950; i < 2021; i++) {
            const year = i + "";

            yearsData.push({
                year,
                yearCount: yearsGroupedMovies[year] ? yearsGroupedMovies[year].length : 0,
            });
        }

        return yearsData;
    }

    /**
     * Вычисляем статистику по персонам.
     */
    static getDirectorsData(movies: IRecord[]): {director: string; directorCount: number}[] {
        const directorsData: {director: string; directorCount: number}[] = [];
        const directorsResult: {[country: string]: number} = {};
        const directors: string[] = movies.reduce((acc: string[], movie: IRecord) => {
            const foundPersons = movie.crew.filter(
                (crewItem: ICrewItem) => crewItem.job === "Director"
            );
            return acc.concat(foundPersons.map((p) => p.name));
        }, []);

        _.forEach(directors, (country: string) => {
            if (directorsResult[country]) {
                directorsResult[country] = ++directorsResult[country];
            } else {
                directorsResult[country] = 1;
            }
        });

        const directorsKeys: string[] = Object.keys(directorsResult);

        _.forEach(directorsKeys, (key: string) => {
            directorsData.push({
                director: key,
                directorCount: directorsResult[key],
            });
        });

        const directorsFilteredResult = directorsData
            .sort((a, b) => b.directorCount - a.directorCount)
            .slice(0, 10);

        return directorsFilteredResult;
    }

    /**
     * Вычисляем статистику по актёрам и актрисам.
     */
    static getActorsActressesData(movies: IRecord[]) {
        const actorsData: {actor: string; actorCount: number}[] = [];
        const actressesData: {actress: string; actressCount: number}[] = [];
        const actorsResult: {[actor: string]: number} = {};
        const actressesResult: {[actress: string]: number} = {};

        const actors: string[] = movies.reduce((acc: string[], movie: IRecord) => {
            const men: ICastItem[] = movie.cast.filter(
                (castItem: ICastItem) => castItem.gender === 1
            );
            return acc.concat(men.map((p: ICastItem) => p.name));
        }, []);

        const actresses: string[] = movies.reduce((acc: string[], movie: IRecord) => {
            const women: ICastItem[] = movie.cast.filter(
                (castItem: ICastItem) => castItem.gender === 0
            );
            return acc.concat(women.map((p: ICastItem) => p.name));
        }, []);

        _.forEach(actors, (item: string) => {
            if (actorsResult[item]) {
                actorsResult[item] = ++actorsResult[item];
            } else {
                actorsResult[item] = 1;
            }
        });

        _.forEach(actresses, (item: string) => {
            if (actressesResult[item]) {
                actressesResult[item] = ++actressesResult[item];
            } else {
                actressesResult[item] = 1;
            }
        });

        const actorsKeys = Object.keys(actorsResult);
        const actressesKeys = Object.keys(actressesResult);

        _.forEach(actorsKeys, (key: string) => {
            actorsData.push({
                actor: key,
                actorCount: actorsResult[key],
            });
        });

        _.forEach(actressesKeys, (key: string) => {
            actressesData.push({
                actress: key,
                actressCount: actressesResult[key],
            });
        });

        const actorsFilteredResult = actorsData
            .sort((a, b) => b.actorCount - a.actorCount)
            .slice(0, 10);
        const actressesFilteredResult = actressesData
            .sort((a, b) => b.actressCount - a.actressCount)
            .slice(0, 10);

        return {
            actorsData: actorsFilteredResult,
            actressesData: actressesFilteredResult,
        };
    }

    /**
     * Возвращает количество просмотренных фильмов в текущем году.
     */
    static getRecordsCurrentYearCount(records: IRecord[]) {
        const [moviesRecords, tvseriesRecords] = _.partition(
            records,
            (record: IRecord) => record.type === "movie"
        );
        const groupedMoviesByYears = _.groupBy(moviesRecords, (record: IRecord) =>
            new Date(record.viewdate).getFullYear()
        );
        const groupedTvseriesByYears = _.groupBy(tvseriesRecords, (record: IRecord) =>
            new Date(record.viewdate).getFullYear()
        );
        const currentYear = new Date().getFullYear();
        const movies = groupedMoviesByYears[currentYear]
            ? groupedMoviesByYears[currentYear].length
            : 0;
        const tvseries = groupedTvseriesByYears[currentYear]
            ? groupedTvseriesByYears[currentYear].length
            : 0;

        return {
            movies,
            tvseries,
        };
    }

    /**
     * Возвращает количество просмотренных фильмов за все года.
     */
    static getRecordsTotalCount(records: IRecord[]) {
        const [moviesRecords, tvseriesRecords] = _.partition(
            records,
            (record: IRecord) => record.type === "movie"
        );

        return {
            movies: moviesRecords.length,
            tvseries: tvseriesRecords.length,
        };
    }
}

// /api/stat
router.get("/", async (req: Request, res: Response) => {
    try {
        const filter: FilterQuery<IRecord> = {
            userId: req.query.userId as string,
        };

        /**
         * Если пользователь выбрал "За все года", то фильтр по году не добавляем.
         */
        if (req.query.year !== "0") {
            filter.viewdate = {
                $gte: new Date(req.query.year ? +req.query.year : 0, 0, 1),
                $lt: new Date(req.query.year ? +req.query.year : 0, 11, 31),
            };
        }

        const records: IRecord[] = await Record.find(filter).exec();
        const movies: IRecord[] = _.filter(records, (item: IRecord) => item.type === "movie");
        const actStat = StatCalculator.getActorsActressesData(movies);

        /**
         * Отправляем клиенту статистику.
         */
        res.status(201).json({
            marksData: StatCalculator.getMarksData(movies),
            genresData: StatCalculator.genresData(movies),
            countriesData: StatCalculator.getCountriesData(movies),
            yearsData: StatCalculator.getYearsData(movies),
            directorsData: StatCalculator.getDirectorsData(movies),
            actorsData: actStat.actorsData,
            actressesData: actStat.actressesData,
            recordsCurrentYearCount: StatCalculator.getRecordsCurrentYearCount(records),
            recordsTotalCount: StatCalculator.getRecordsTotalCount(records),
        });
    } catch (error) {
        console.log("Error:", error.message);

        res.status(500).json({message: "Что-то пошло не так, попробуйте снова"});
    }
});

module.exports = router;
