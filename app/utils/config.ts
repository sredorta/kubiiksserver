import * as dotenv from "dotenv";

    let path;
    console.log(`NODE_ENV -> ${process.env.NODE_ENV}`);

    switch (String(process.env.NODE_ENV).replace(/ /g,'')) {
         case "test":
           path = process.cwd()+'/.env.test';
           break;
         case "production":
           path = process.cwd()+'/.env.production';
           break;
        case "vps":
           path = process.cwd()+'/.env.vps';
           break;           
         default:
           path = process.cwd()+'/.env.development';
    }
    dotenv.config({ path: path });


    export const AppConfig = {
        "api" : {
            "version" : <string>process.env.API_VERSION,
            "defaultLanguage": <string>process.env.API_DEFAULT_LANGUAGE,
            "appName": <string>process.env.API_NAME,
            "kiiserverLocalHost": <string>process.env.API_LOCAL_HOST,
            "kiiserverExtHost" : <string>process.env.API_EXTERNAL_HOST,
            "kiiwebExtHost": <string>process.env.APP_EXTERNAL_HOST,
            "host": <string>process.env.API_HOST,
            "port": <string>process.env.API_PORT,
            "fePort": <string>process.env.API_FE_PORT,
            "ssl": Boolean(JSON.parse(<string>process.env.API_SSL))
        },
        "db" : {
            "username": <string>process.env.DB_USERNAME,
            "password": <string>process.env.DB_PASSWORD,
            "database": <string>process.env.DB_DATABASE,
            "dialect" : <string>process.env.DB_DIALECT,
            "host"    : <string>process.env.DB_HOST
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
            "onPush" : {
                "public"  : <string>process.env.VAPID_PUBLIC,
                "private" : <string>process.env.VAPID_PRIVATE,
            },
            "jwtSecret": <string>process.env.AUTH_JWT_SECRET,
            "accessShort": <string>process.env.AUTH_ACCESS_SHORT,
            "accessLong": <string>process.env.AUTH_ACCESS_LONG,
            "accessAdmin": <string>process.env.AUTH_ACCESS_ADMIN,
            "facebook": {
                "clientId": <string>process.env.AUTH_FACEBOOK_CLIENT_ID,
                "clientSecret": <string>process.env.AUTH_FACEBOOK_CLIENT_SECRET
            },
            "google": {
                "clientId": <string>process.env.AUTH_GOOGLE_CLIENT_ID,
                "clientSecret": <string>process.env.AUTH_GOOGLE_CLIENT_SECRET
            }
        },
        "settings": [
            //Settings that are page independant and always required to load
            {key:'favicon', type:'main',value:<string>process.env.API_EXTERNAL_HOST + "/public/images/defaults/favicon.png"},
            {key:'appicon512', type:'main',value:<string>process.env.API_EXTERNAL_HOST + "/public/images/defaults/icon-512x512.png"},
            {key:'appicon192', type:'main',value:<string>process.env.API_EXTERNAL_HOST + "/public/images/defaults/icon-192x192.png"},
            {key: "popup-show",type: "main",value: "disabled"},
            //Footer part
            {key: "facebook", type:"main",value:"https://www.facebook.com/kubiiks/"},
            {key: "google", type:"main",value:"https://plus.google.com/u/0/118285710646673394875"},
            {key: "youtube", type:"main",value:"https://youtube.com/user/sergiredorta"},
            {key: "instagram", type:"main",value:"https://www.instagram.com/sergiredorta/"},
            {key: "linkedin", type:"main",value:"https://www.linkedin.com/company/kubiiks/"},
            {key: "twitter", type:"main",value:"https://www.twitter.com"},

            //Contact part
            {key: "latitude", type:"main",value:"43.61426"},
            {key: "longitude", type:"main",value:"6.959808"},
            {key: "zoom", type:"main",value:"14"},

            //Seo part
            {key: "description", type:"main",value:null,translations:{fr:{value:"Ma description"},en:{value:"My description"},es:{value:"Mi descripcion"},ca:{value:"La meva descripció"}}},
            {key: "sitename", type:"main",value:"kubiiks"},
            {key: "url", type:"main",value:<string>process.env.APP_EXTERNAL_HOST},
            {key: "addressLocality", type:"main", value: "La Gaude"},
            {key: "addressCountry", type:"main", value: "France"},
            {key: "addressPostal", type:"main", value: "06610"},
            {key: "addressStreet", type:"main", value: "6, rue Roger Avon"},
            {key: "telephone", type:"main", value: "0623133212"},
            {key: "email", type:"main", value: "sales@kubiiks.com"},
            {key: "fb_app_id", type:"main", value: "2088315884799260"},
            {key:"url_image", type:"main",value:<string>process.env.API_EXTERNAL_HOST + "/public/images/defaults/logo.jpg"}
        ]
    }



    console.log("-----  API SETTINGS  ------")
    console.log(AppConfig.api);
    console.log(AppConfig.db);
    console.log('---------------------------');
    console.log("\nPreparing database...\n");
