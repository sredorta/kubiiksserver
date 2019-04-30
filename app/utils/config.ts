import * as dotenv from "dotenv";

    let path;
    switch (process.env.NODE_ENV) {
         case "test":
           path = `${__dirname}/../../.env.test`;
           break;
         case "production":
           path = `${__dirname}/../../.env.production`;
           break;
         default:
           path = `${__dirname}/../../.env.development`;
    }
    dotenv.config({ path: path });


    export const AppConfig = {
        "api" : {
            "version" : <string>process.env.API_VERSION,
            "defaultLanguage": <string>process.env.API_DEFAULT_LANGUAGE,
            "appName": <string>process.env.API_NAME,
            "host": <string>process.env.API_HOST,
            "port": <string>process.env.API_PORT,
            "fePort": <string>process.env.API_FE_PORT,
            "ssl": Boolean(JSON.parse(<string>process.env.API_SSL))
        },
        "db" : {
            "username": <string>process.env.DB_USERNAME,
            "password": <string>process.env.DB_PASSWORD,
            "database": <string>process.env.DB_DATABASE,
            "options": {
              "host": <string>process.env.DB_HOST,
              "dialect" : <string>process.env.DB_DIALECT
            }
        },
        "emailSmtp" : {
            "host" : <string>process.env.SMTP_HOST,
            "port": Number(JSON.parse(<string>process.env.SMTP_PORT)),
            "secure": Boolean(JSON.parse(<string>process.env.SMTP_SECURE)),
            "sender": <string>process.env.SMTP_SENDER,
            "auth": {
                "user": <string>process.env.SMTP_USER,
                "pass": <string>process.env.SMTP_PASSWORD
            }
        },
        "auth": {
            "jwtSecret": <string>process.env.AUTH_JWT_SECRET,
            "accessShort": <string>process.env.AUTH_ACCESS_SHORT,
            "accessLong": <string>process.env.AUTH_ACCESS_LONG,
            "facebook": {
                "clientId": <string>process.env.AUTH_FACEBOOK_CLIENT_ID,
                "clientSecret": <string>process.env.AUTH_FACEBOOK_CLIENT_SECRET
            },
            "googleplus": {
                "clientId": <string>process.env.AUTH_GOOGLEPLUS_CLIENT_ID,
                "clientSecret": <string>process.env.AUTH_GOOGLEPLUS_CLIENT_SECRET
            }
        },
        "sharedSettings" : [
            {"key": "signup_firstName", "value":"include"},
            {"key": "signup_lastName", "value":"include"},
            {"key": "signup_email", "value":"include"},
            {"key": "signup_phone", "value":"optional"},
            {"key": "signup_mobile", "value":"optional"},
            {"key": "signup_validation_method", "value":"no_validation"},
            {"key": "login_username", "value":"email"},
            {"key": "mode", "value":"demo"}
        ],
    }
