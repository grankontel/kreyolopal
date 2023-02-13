import { fetchUtils, Admin, Resource, ListGuesser, EditGuesser } from "react-admin";
import simpleRestProvider from 'ra-data-simple-rest'
import authProvider from "./authProvider";
// import { UserList, SpellcheckedList, RatingList } from '@kreyolopal/web-ui'
// import { ThemeOptions } from '@mui/material/styles';

const themeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#422b8f',
        },
        secondary: {
            main: '#9c27b0',
        },
    },
    typography: {
        fontFamily: 'Titillium Web',
        h1: {
            fontWeight: 600,
            fontSize: '3rem',
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.8rem',
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
        fontSize: 14,
    },
};

const fetchJson = (url, options = {}) => {
    options.user = {
        authenticated: true,
        // use the token from local storage
        token: `Bearer ${localStorage.getItem('token')}`
    };
    return fetchUtils.fetchJson(url, options);
};

// const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");
const dataProvider = simpleRestProvider('/api', fetchJson)

const MyAdmin = () => (
    <Admin theme={themeOptions}
    authProvider={authProvider}
    dataProvider={dataProvider}>
    <Resource name="users" list={ListGuesser} edit={EditGuesser} />
    <Resource name="spellcheckeds" list={ListGuesser} edit={EditGuesser} />
    <Resource name="ratings" list={ListGuesser} edit={EditGuesser} />
    <Resource name="words" list={ListGuesser} edit={EditGuesser} />
    </Admin>
);

export default MyAdmin;