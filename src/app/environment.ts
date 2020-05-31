const host = 'http://localhost:3000';
export const environment = {
    mock: false,
    production: false,
    endpoints: {
        users: `${host}/api/users`,
        pokemon: `${host}/api/pokemon`,
        items: `${host}/api/items`,
        natures: `${host}/api/natures`,
        userItems: `${host}/api/userItems`, 
        mongoUsers: `${host}/api/mongoUsers`,
        mongoItems: `${host}/api/mongoItems`,
    },
};