```
PROD_POSTGRES_USERNAME,
PROD_POSTGRES_PASSWORD,
PROD_POSTGRES_DB,
PROD_POSTGRES_HOST,

LOCAL_DICO  config.dico.useLocal LOCAL_DICO


AWS_ACCESS_KEY_ID config.aws.keyId,
AWS_SECRET_ACCESS_KEY config.aws.keySecret,
AWS_BUCKET_REGION config.aws.region,
AWS_BUCKET_NAME config.aws.bucketName

PORT config.app.port


SESSION_SECRET config.auth.secret

config.slack.noSend
SLACK_WEBHOOK_URL config.slack.webhook

API_SALT config.security.salt
ARGON_MEMORYCOST || 24 config.security.memoryCost,
ARGON_LENGTH || 24 config.security.hashLength,
ARGON_ITERATIONS || 2 config.security.iterations,

MAILGUN_FROM config.mail.from

MAILGUN_API_KEY config.mail.apiKey
MAILGUN_HOST config.mail.host
MAILGUN_DOMAIN config.mail.domain
```
