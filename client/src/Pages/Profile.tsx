import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Container, DropdownProps, Grid, Header, Image, List, Segment} from "semantic-ui-react";
import {Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {getStat, getUsers, updateUser} from "../Actions/Actions";
import {CustomizedAxisTick} from "../Components/Charts/CustomizedAxisTick";
import {FavouriteMovie} from "../Components/FavouriteMovie";
import {CLEAR_USERS} from "../Actions/ActionTypes";
import {Link, RouteComponentProps} from "react-router-dom";
import {Page} from "../Components/Common/Page";
import {YearsSelect} from "../Components/YearsSelect";
import {IApplicationReduxState} from "../Reducers";
import {IDirectorsDataItem} from "../../../server/src/interfaces/Stat";
import {NameType, Payload, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {map} from "lodash";
import {IClientFavouriteMovie} from "../Interfaces/ClientFavouriteMovie";
import {convertToBase64} from "../Utils/Utils";
import {Plus} from "../Components/Icons/Plus";

interface ITooltipProps {
    active: boolean;
    payload: Payload<ValueType, NameType>[];
    label: string;
}

/**
 * Всплывающий тултип, при наведении на график "Жанры".
 */
const CustomGenreTooltip = ({active, payload, label}: ITooltipProps) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Фильмов в жанре ${label}: ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

/**
 * Всплывающий тултип, при наведении на график "Страны".
 */
const CustomCountryTooltip = ({active, payload, label}: ITooltipProps) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Фильмов производства ${label}: ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

type TParams = {id: string};

/**
 * Страница профиль пользователя.
 */
export const Profile = ({match}: RouteComponentProps<TParams>) => {
    const dispatch = useDispatch();
    const profileUserId = match.params.id;
    const {
        users: {data: usersData, isLoading: isUsersLoading, error: usersError},
        stat: {data: statData, isLoading: isStatLoading, error: statError},
        user: {data: loggedInUser},
    } = useSelector((state: IApplicationReduxState) => state);
    const profileUser = usersData ? usersData.items[0] : null;
    const marksData = statData?.marksData || [];
    const [year, setYear] = useState(0);
    const isReadOnly = profileUserId !== loggedInUser?.userId;

    useEffect(() => {
        dispatch(getUsers({userId: profileUserId}));

        return () => {
            dispatch({type: CLEAR_USERS});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch(getStat(profileUserId, year));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    const favs: JSX.Element[] = [];

    let positionDictionary: {[position: number]: IClientFavouriteMovie};
    const positionMapped: {[position: number]: IClientFavouriteMovie}[] = map(
        profileUser?.favouriteMovies,
        (item) => ({
            [item.position]: item,
        })
    );

    if (positionMapped) {
        positionDictionary = Object.assign({}, ...positionMapped);
    }

    for (let i = 0; i < 10; i++) {
        favs.push(
            <FavouriteMovie
                movie={positionDictionary?.[i]}
                index={i}
                onRemove={() => {
                    const filtered = profileUser?.favouriteMovies.filter(
                        (item) => item.position !== i
                    );
                    dispatch(
                        updateUser({
                            favouriteMovies: filtered,
                        })
                    );
                }}
                disabled={profileUserId !== loggedInUser?.userId}
            />
        );
    }

    /**
     * Ссылка на инпут для загрузки аватара.
     */
    const inputFileAvatar = useRef<HTMLInputElement>(null);

    /**
     * Обработчик загрузки фотографии.
     */
    const handleUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file: File = (event.target as HTMLInputElement).files[0];

        if (file.size > 100000) {
            alert("Размер фото не должен превышать 100кб");
            return;
        }

        convertToBase64(file, (base64file: string) => {
            dispatch(
                updateUser({
                    image: base64file,
                })
            );
        });
    };

    /**
     * Рисуте аватар.
     */
    const renderAvatar = () => {
        if (!isReadOnly) {
            return (
                <>
                    {loggedInUser.image ? (
                        <div className={"profile-data-image-wrapper editable"}>
                            <Image
                                className="profile-data-image"
                                src={loggedInUser.image}
                                circular
                                onClick={() => inputFileAvatar.current.click()}
                            />
                        </div>
                    ) : (
                        <div
                            className="profile-data-image avatar-placeholder"
                            onClick={() => inputFileAvatar.current.click()}
                        >
                            <Plus />
                        </div>
                    )}

                    <input
                        id="avatar"
                        type="file"
                        onChange={handleUploadFile}
                        hidden
                        ref={inputFileAvatar}
                    />
                </>
            );
        } else {
            return profileUser.image ? (
                <div className={"profile-data-image-wrapper"}>
                    <Image className="profile-data-image" src={profileUser.image} circular />
                </div>
            ) : (
                <div className="profile-data-image avatar-placeholder">
                    <Plus />
                </div>
            );
        }
    };

    return (
        <Page
            isLoading={isUsersLoading || isStatLoading}
            errorMessage={usersError?.message || statError?.message}
        >
            {() => (
                <Container className="profile">
                    <Header as="h2" size="large">
                        Профиль пользователя
                    </Header>
                    <Segment>
                        <Grid className="profile-data">
                            <Grid.Column width={4}>
                                {renderAvatar()}
                                <div className="title">{`${profileUser?.username}`}</div>
                                <div className="additional">Russia, Tver</div>
                                <div className="label">В этом году</div>
                                <div className="counter">
                                    <div className="total">
                                        {statData?.recordsCurrentYearCount.movies +
                                            statData?.recordsCurrentYearCount.tvseries}
                                    </div>
                                    <div className="divided">
                                        <div>
                                            {statData?.recordsCurrentYearCount.movies} фильмов
                                        </div>
                                        <div>
                                            {statData?.recordsCurrentYearCount.tvseries} сериалов
                                        </div>
                                    </div>
                                </div>
                                <div className="label">За всё время</div>
                                <div className="counter">
                                    <div className="total">
                                        {statData?.recordsTotalCount.movies +
                                            statData?.recordsTotalCount.tvseries}
                                    </div>
                                    <div className="divided">
                                        <div>{statData?.recordsTotalCount.movies} фильмов</div>
                                        <div>{statData?.recordsTotalCount.tvseries} сериалов</div>
                                    </div>
                                </div>
                                <div className="label">
                                    <Link to={`/diary/${profileUserId}`}>Смотреть журнал</Link>
                                </div>
                                <div className="label">
                                    <Link to={`/results/${profileUserId}`}>Смотреть итоги</Link>
                                </div>
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <div>Любимые фильмы</div>
                                <div className="grid-panel">{favs}</div>
                            </Grid.Column>
                        </Grid>
                    </Segment>

                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={4}></Grid.Column>
                            <Grid.Column width={8} textAlign="center">
                                <h1>
                                    <YearsSelect
                                        showAllOption
                                        selectedYear={year}
                                        onSelect={(
                                            event: React.SyntheticEvent<HTMLElement>,
                                            data: DropdownProps
                                        ) => setYear(Number(data.value))}
                                    />
                                </h1>
                                <h3>
                                    {`${marksData.reduce((acc, cur) => (acc += cur.markCount), 0)}`}{" "}
                                    оценок
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart margin={{top: 30}} data={marksData}>
                                        <Bar dataKey="markCount" fill="#5CE0E6">
                                            <LabelList dataKey="markCount" position="top" />
                                        </Bar>
                                        <XAxis dataKey="mark" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid.Column>
                            <Grid.Column width={4}></Grid.Column>
                        </Grid.Row>

                        <Grid.Row>
                            <Grid.Column width={8}>
                                <h3>Жанры</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        width={600}
                                        height={300}
                                        data={statData?.genresData}
                                        layout="vertical"
                                        margin={{top: 5, bottom: 5}}
                                    >
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            interval={0}
                                            width={150}
                                        />
                                        <Tooltip
                                            content={({active, payload, label}) => (
                                                <CustomGenreTooltip
                                                    active={active}
                                                    payload={payload}
                                                    label={label}
                                                />
                                            )}
                                        />
                                        <Bar dataKey="value" fill="#19C2FA" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid.Column>
                            <Grid.Column width={8} textAlign="center">
                                <h3>Страны</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        width={600}
                                        height={300}
                                        data={statData?.countriesData}
                                        layout="vertical"
                                        margin={{top: 5, bottom: 5}}
                                    >
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey="countryName"
                                            interval={0}
                                            width={150}
                                        />
                                        <Tooltip
                                            content={({active, payload, label}) => (
                                                <CustomCountryTooltip
                                                    active={active}
                                                    payload={payload}
                                                    label={label}
                                                />
                                            )}
                                        />
                                        <Bar dataKey="countryCount" fill="#FA1955" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row columns={3}>
                            <Grid.Column>
                                <h3>Режиссёры</h3>
                                <List ordered>
                                    {statData?.directorsData.map((item: IDirectorsDataItem) => {
                                        return (
                                            <List.Item
                                                key={`${item.director}${item.directorCount}`}
                                            >{`${item.director} (${item.directorCount})`}</List.Item>
                                        );
                                    })}
                                </List>
                            </Grid.Column>
                            <Grid.Column>
                                <h3>Актёры</h3>
                                <List ordered>
                                    {statData?.actorsData.map((item, index) => {
                                        return (
                                            <List.Item
                                                key={index}
                                            >{`${item.actor} (${item.actorCount})`}</List.Item>
                                        );
                                    })}
                                </List>
                            </Grid.Column>
                            <Grid.Column>
                                <h3>Актрисы</h3>
                                <List ordered>
                                    {statData?.actressesData.map((item, index) => {
                                        return (
                                            <List.Item
                                                key={index}
                                            >{`${item.actress} (${item.actressCount})`}</List.Item>
                                        );
                                    })}
                                </List>
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row>
                            <Grid.Column>
                                <h3>Год выпуска</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart margin={{top: 30}} data={statData?.yearsData}>
                                        <Bar dataKey="yearCount" fill="#5CE0E6">
                                            <LabelList dataKey="yearCount" position="top" />
                                        </Bar>
                                        <XAxis
                                            dataKey="year"
                                            interval={0}
                                            height={100}
                                            tick={({x, y, payload}) => (
                                                <CustomizedAxisTick x={x} y={y} payload={payload} />
                                            )}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>
            )}
        </Page>
    );
};
