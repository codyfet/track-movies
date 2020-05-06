/**
 * Возвращает пустую запись.
 */
export function createEmptyRecord (type) {
    return {
        id: "0",
        viewdate: null,
        posterpath: null,
        title: null,
        releaseYear: null,
        originalTitle: null,
        director: null,
        flag: null,
        rating: null,
        type
    };
}