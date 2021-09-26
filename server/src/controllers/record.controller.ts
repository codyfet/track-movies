import {ERecordType} from "./../../../client/src/Enums";
import {IClientRecord} from "./../../../client/src/Interfaces/ClientRecord";
import {RecordModel} from "../models/Record";
import {Request, Response} from "express";
import {FilterQuery} from "mongoose";
import {IRecordDocument} from "../interfaces/Record";
import asyncHandler from "express-async-handler";
import User from "../models/User";

/**
 * Query параметры запроса для сервиса getRecords.
 *
 * @prop {string} [year] Год, за который запрашиваются записи.
 * @prop {string} [userId] Идентификатор пользователя.
 * @prop {ERecordType[]} [types] Массив типов записей (movie, tvseries).
 * @prop {string} [sortBy] Параметр сортировать по (-viewdate).
 */
export interface IGetRecordsQueryParams {
    year?: number;
    userId?: string;
    types?: ERecordType[];
    sortBy?: string;
}

/**
 * Body ответа для сервиса getUsers.
 *
 * @prop {string} [email] Электронная почта.
 * @prop {string} [password] Пароль.
 * @prop {string} [username] Имя пользователя.
 * @prop {IFavouriteMovieDocument[]} [favouriteMovies] Массив любимых фильмов.
 */
export interface IGetRecordsResponseBody extends IRecordDocument {}

/**
 * @desc    Возвращает список записей.
 * @route   GET /api/record.
 * @access  Public
 */
const getRecords = asyncHandler(
    async (
        req: Request<{}, {}, {}, IGetRecordsQueryParams>,
        res: Response<IGetRecordsResponseBody[]>
    ) => {
        const filter: FilterQuery<IRecordDocument> = {
            userId: req.query.userId as string,
            viewdate: {
                $gte: new Date(req.query.year ? +req.query.year : 0, 0, 1),
                $lt: new Date(req.query.year ? +req.query.year : 0, 11, 31),
            },
        };

        if (req.query.types) {
            filter.type = {$in: req.query.types as string[]};
        }

        const records = await RecordModel.find(filter).sort(req.query.sortBy).exec();

        if (records) {
            // res.status(401);
            // throw new Error("Not Authorized");
            res.status(201).json(records);
        } else {
            /**
             * Достаточно просто выкинуть ошибку и asyncHandler прокинет ее в кастомную middleware (см. errorMiddleware),
             * которая отправит ошибку на ui в формате json. По дефолту отправится 500 ошибка, если нужно переопределить номер,
             * то достаточно добавить перед выкидыванием ошибки
             * res.status(404).
             */
            throw new Error("Что-то пошло не так...");
        }
    }
);

/**
 * Body запроса для сервиса createRecord.
 */
export interface ICreateRecordRequestBody extends IClientRecord {}

/**
 * Body ответа для сервиса createRecord.
 */
export interface ICreateRecordResponseBody extends IRecordDocument {}

/**
 * @desc    Создает запись.
 * @route   POST /api/record.
 * @access  Private
 */
const createRecord = asyncHandler(
    async (
        req: Request<{}, {}, ICreateRecordRequestBody>,
        res: Response<ICreateRecordResponseBody>
    ) => {
        const record = new RecordModel(req.body);
        const result = await record.save();

        /**
         * Сохраняем record и в модели User.
         */
        const user = await User.findOne({_id: record.userId});

        if (user) {
            user?.records.push(record);
            await user?.save();
            res.status(201).json(result);
        } else {
            throw new Error("Не найден пользователь.");
        }
    }
);

export {getRecords, createRecord};
