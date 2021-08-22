import React, {ReactElement} from "react";
import {useSelector} from "react-redux";
import {IApplicationReduxState} from "../../Reducers";
import {IRecordsReduxState} from "../../Reducers/records.types";
import {IStatReduxState} from "../../Reducers/stat.types";
import {IUsersReduxState} from "../../Reducers/users.types";
import {LoadingOverlay} from "./LoadingOverlay";

/**
 * Тип, описывающий ветки редакс дереваа, которые являются асинхронными контейнерами для хранения данных.
 */
type IAsyncDataReduxKey = IUsersReduxState | IRecordsReduxState | IStatReduxState;

interface IProps {
    asyncDataKeys: ("users" | "records" | "stat")[];
    children: ReactElement;
}

/**
 * Компонент-обёртка для страниц приложения.
 * Содержит реализацию спиннера для предзагрузок страницы.
 *
 * @prop {Array<string>} asyncDataKeys Массив ключей контейнеров данных из редакс дерева, для которых нужно проверить статус загрузки.
 */
export const Page: React.FunctionComponent<IProps> = (props: IProps) => {
    const state = useSelector((state: IApplicationReduxState) => state);
    const keys = props.asyncDataKeys;

    for (const key of keys) {
        const {data, isLoading} = state[key as keyof IApplicationReduxState] as IAsyncDataReduxKey;

        if (!data && isLoading) {
            return <LoadingOverlay />;
        }
    }

    return React.cloneElement(props.children, {...props});
};
