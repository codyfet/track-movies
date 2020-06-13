import React, {Fragment} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Container, Image, Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {logout} from "../Actions/Actions";
/**
 * Компонент шапка-приложения.
 */
export const Header = () => {
    const {user} = useSelector(state => state);
    const dispatch = useDispatch();
    const isAutheticated = user?.data;

    /**
     * Формирует доступные пункты меню.
     */
    const getMenuItems = () => {
        if (isAutheticated) {
            return (
                <Fragment>
                    <Menu.Item as={Link} to='/' key="main" className="logo">
                        <Image size='tiny' src='src/Assets/logo.png' />
                    </Menu.Item>
                    <div className="right menu">
                        <Menu.Item as={Link} to='/diary' key="diary" position="right">
                            дневник
                        </Menu.Item>
                        <Menu.Item as="a" name="results" key="results" position="right">
                            итоги
                        </Menu.Item>
                        <Menu.Item as="a" name="avatar" key="avatar" position="right">
                            <div className="avatar-block">
                                <Image size="mini" src='src/Assets/matthew.png' avatar />
                                <span>Alexander Volkov</span>
                            </div>
                        </Menu.Item>
                        <Menu.Item as="a" name="logout" key="logout" onClick={() => dispatch(logout())} position="right">
                            выйти
                        </Menu.Item>
                    </div>
                </Fragment>
            );
        }

        return (
            <Menu.Item as={Link} to="/login" key="login">
                войти
            </Menu.Item>
        );
    };

    return (
        <Menu borderless>
            <Container>
                {getMenuItems()}
            </Container>
        </Menu>
    );
};