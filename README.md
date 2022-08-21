# Kreyolopal

Utiliser les technologies d'aujourd'hui pour encourager,
améliorer et diffuser l'écriture du créole.

## Description

L'application se compose d'un server Express et d'un frontend en React.

This project was generated using [Nx](https://nx.dev).
Visit the [Nx Documentation](https://nx.dev) to learn more.

## Getting Started

### Dependencies

L'application utilise des fichiers de dictionnaires au format Hunspell :

* Un fichier dictionnaire (.dic) qui contient un mot par ligne
* Un fichier affix (.aff) qui definit les informations d'aide à la suggestion

Ces deux fichiers sont a mettre dans le répertoire ```server/dico```

### Installing

Pour démarrer, il faut installer les dépendances en faisant :

```npm install```

Puis construire l'appli avec

```npm run build```

### Executing program

Les variables d'environnement nécessaires sont les suivantes: 

```
API_SALT
TOKEN_SALT
ARGON_ITERATIONS
ARGON_LENGTH
ARGON_MEMORYCOST

LOCAL_DICO

AWS_ACCESS_KEY_ID
AWS_BUCKET_NAME
AWS_BUCKET_REGION
AWS_SECRET_ACCESS_KEY

MAILGUN_API_KEY
MAILGUN_DOMAIN
MAILGUN_FROM
MAILGUN_HOST
MAINTAINTER_EMAIL

DEV_POSTGRES_HOST
DEV_POSTGRES_DB
DEV_POSTGRES_USERNAME
DEV_POSTGRES_PASSWORD

PROD_POSTGRES_DB
PROD_POSTGRES_HOST
PROD_POSTGRES_PASSWORD
PROD_POSTGRES_USERNAME

REDIS_URL
REDIS_DB

SESSION_DURATION
SESSION_SECRET
SLACK_WEBHOOK_URL
```

La version de developpement se lance avec

```npm run dev```

La version de production (dans le repertoire ```dist/apps/web/server```) se lance avec 

```npm run start```

## Authors

* TiMalo [@timalo_officiel](https://twitter.com/timalo_officiel)

## Version History

Voir [le Changelog](./CHANGELOG.md)

## License

This project is licensed under the [NAME HERE] License - see the LICENSE.md file for details

## Acknowledgments

Une version de l'application est accessible ici [kreyol.herokuapp.com](https://kreyol.herokuapp.com).
