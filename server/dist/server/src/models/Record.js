"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordModel = void 0;
const mongoose_1 = require("mongoose");
/**
 * Модель участника Cast.
 */
const CastItemSchema = new mongoose_1.Schema({
    cast_id: { type: Number },
    character: { type: String },
    credit_id: { type: String },
    gender: { type: Number },
    id: { type: Number },
    name: { type: String },
    order: { type: Number },
    profile_path: { type: String },
});
/**
 * Модель участника Crew.
 */
const CrewItemSchema = new mongoose_1.Schema({
    credit_id: { type: String },
    department: { type: String },
    gender: { type: Number },
    id: { type: Number },
    job: { type: String },
    name: { type: String },
    profile_path: { type: String },
});
/**
 * Модель Жанр.
 */
const GenreSchema = new mongoose_1.Schema({
    id: { type: Number },
    name: { type: String },
});
/**
 * Модель Запись (Фильм/Сериал).
 */
const RecordSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    id: { type: Number, required: true },
    viewdate: { type: Date },
    posterpath: { type: String },
    title: { type: String, required: true },
    releaseYear: { type: String, required: true },
    originalTitle: { type: String },
    rating: { type: Number, default: 0 },
    type: { type: String, required: true },
    backdrop_path: { type: String },
    genres: [GenreSchema],
    overview: { type: String },
    production_countries: [String],
    director: [String],
    reViewed: { type: Boolean },
    notFinished: { type: Boolean },
    cast: [CastItemSchema],
    crew: [CrewItemSchema],
    position: { type: String },
    season: { type: String },
    inProduction: { type: Boolean },
    numberOfSeasons: { type: Number },
}, {
    timestamps: true,
});
exports.RecordModel = (0, mongoose_1.model)("Record", RecordSchema);
