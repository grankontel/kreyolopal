import { Zakari } from '@kreyolopal/zakari';

const auth = new Zakari(window.location.origin);

const authProvider = {
    login: ({ username, password }) => {
        return auth.login(username, password)
            .then(response => {
                localStorage.setItem('token', response.authorization);
                return response.isLoggedIn();
            },
                (reason) => {
                    const code = reason?.code || 500;
                    const msg =
                        code === 500
                            ? 'Erreur inconnue, veuillez essayer ultérieurement'
                            : 'Identifiant inconnu ou mot de passe incorrect';
                    throw new Error(msg);
                })
            .catch(() => {
                throw new Error('Network error')
            });
    },
    logout: async () => {
        auth.signOut().catch(() => {
            console.log('Misterious error')
        })
        return Promise.resolve();
    },    
    checkAuth: () => {
        // Required for the authentication to work
        return auth.isLoggedIn() ? Promise.resolve() : Promise.reject()
    },
    getPermissions: () => {
        // Required for the authentication to work
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error?.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }        return Promise.resolve();
    }
    // ...
};

export default authProvider;