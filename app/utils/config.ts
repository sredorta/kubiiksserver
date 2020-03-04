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
        ],
        //CATHEGORIES
        //  role: Required role to edit
        //  hasPage: If it has a dedicated page
        //  initialCount: Count that is download on initial load before full load
        cathegories: [
            {name: "kubiiks", role:"kubiiks", hasPage:false}, //Default articles cathegory
            {name: "content", role:"content", hasPage:false}, //For things like dialog...
            {name: "home-features", role:"kubiiks", hasPage:false},
            {name: "blog-item", role:"blog", hasPage:true, initialCount:10},
            {name: "realisations", role:"content",hasPage:false,initialCount:7},
            {name: "testimonials", role:"content",hasPage:false,initialCount:5},
            {name: "demo-features", role:"content",hasPage:false,initialCount:5},

        ],
        pages: [
            {page:"legal",image:"none", translations: {
                fr:{title:"Titre legal", description:"Description legal"}, 
                en:{title:"Legal title", description:"Legal description"},
                es:{title:"Titulo legal", description:"Descripcion legal"},
                ca:{title:"Titol legal", description:"Descripcio legal"}
                },
                cathegories:[]
            },
            {page:"home",image:"none", translations: {
                fr: {title:"Titre accueil", description:"Description accueil"},
                en: {title:"Home title", description:"Home description"},
                es: {title:"Titulo inicio", description:"Descripcion inicio"},
                ca: {title:"Titol inici", description:"Descripcio inici"}
                },
                cathegories:["home-features", "realisations"]
            },
            {page:"blog",image:"none", translations: {
                fr: {title:"Titre blog", description:"Description blog"},
                en: {title:"Blog title", description:"Blog description"},
                es: {title:"Titulo blog", description:"Descripcion blog"},
                ca: {title:"Titol blog", description:"Descripcio blog"}
                },
                cathegories:["blog-item"]
            },
            {page:"blog-item-page",image:"none", translations: {
                fr: {title:"Titre blog page", description:"Description blog page"},
                en: {title:"Blog title page", description:"Blog description page"},
                es: {title:"Titulo blog page", description:"Descripcion blog page"},
                ca: {title:"Titol blog page", description:"Descripcio blog page"}
                },
                cathegories:["testimonials"]
            },            
            {page:"contact",image:"none", translations: {
                fr: {title:"Titre contact", description:"Description contact"},
                en: {title:"Contact title", description:"Contact description"},
                es: {title:"Titulo contact", description:"Descripcion contact"},
                ca: {title:"Titol contact", description:"Descripcio contacte"}
                },
                cathegories:["testimonials"]
            },
            {page:"demo",image:"none", translations: {
                fr: {title:"Titre demo", description:"Description demo"},
                en: {title:"Demo title", description:"Demo description"},
                es: {title:"Titulo demo", description:"Descripcion demo"},
                ca: {title:"Titol demo", description:"Descripcio demo"}
                },
                cathegories:["demo-features"]
            },           
        ],
        articles: [
            //Initial dialog required in all pages
            {page:"all", key:"dialog-initial",cathegory:"content", translations: {
                fr: {title:"Dialogue initiale", description:"Dialogue initial qui apparait apres 5s", content:"<p>Mon dialogue</p>"},
                en: {title:"Initial dialog", description:"Initial dialog that appears after 5s", content:"<p>My dialog</p>"},
                es: {title:"Dialogo inicial", description:"Dialogo inicial que aparece after 5s", content:"<p>Mi dialogo</p>"},
                ca: {title:"Diàleg inicial", description:"Diàleg inicial que apareix despres de 5s", content:"<p>El meu diàleg</p>"},
            }},
            //Initial dialog required in all pages
            {page:"all", key:"newsletter",cathegory:"kubiiks", translations: {
                fr: {title:"Buletins d'information", description:"Description buletins d'information", content:"<p>Buletins d'information</p>"},
                en: {title:"Newsletter", description:"Newsletter description", content:"<p>Newsletter</p>"},
                es: {title:"Boletines informativos", description:"Descripcion boletines informativos", content:"<p>Boletines informativos</p>"},
                ca: {title:"Butlletins d'informació", description:"Descripció butlletins informatius", content:"<p>Butlletins d'informació</p>"},
            }},
            //Legal
            {page:"legal", key:"legal-cookies",cathegory:"kubiiks", translations: {
                fr: {title:"Information cookies", description:"Information utilisation cookies", content:"<p>Information sur l'utilisation des cookies</p>"},
                en: {title:"Cookies information", description:"Cookies usage information", content:"<p>Here cookies information usage</p>"},
                es: {title:"Informacion cookies", description:"Informacion utilizacion cookies", content:"<p>Informacion sobre la utilizacion de cookies</p>"},
                ca: {title:"Informacio cookies", description:"Informacio sobre l'utilitzacio de cookies", content:"<p>Informacio de l'utilitzacio de cookies</p>"},
            }},
            {page:"legal", key:"legal-user-data",cathegory:"kubiiks", translations: {
                fr: {title:"Information user data", description:"Information utilisation données personnelles", content:"<p>Information sur l'utilisation des données personnelles</p>"},
                en: {title:"User data information", description:"Cookies usage information", content:"<p>Here user data information usage</p>"},
                es: {title:"Informacion datos personales", description:"Informacion utilizacion datos personales", content:"<p>Informacion sobre la utilizacion de datos personales</p>"},
                ca: {title:"Informacio dades personals", description:"Informacio sobre l'utilitzacio de dades personals", content:"<p>Informacio de l'utilitzacio de dades personals</p>"},
            }},
            //Home
            {page:"home", key:"home-header",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"home", key:"home-footer",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:1,cathegory:"home-features", translations: {
                fr: {title:"Titre home-features 1", description:"Voila une description bien plus longue pour voir tout ce qui se passe quand la description est bien longue", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},         
            {order:2,cathegory:"home-features", translations: {
                fr: {title:"Titre home-features 2", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},  
            {order:3,cathegory:"home-features", translations: {
                fr: {title:"Titre home-features 3", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},  
            {order:4,cathegory:"home-features", translations: {
                fr: {title:"Titre home-features 4", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},  
            {order:5,cathegory:"home-features", translations: {
                fr: {title:"Titre home-features 5", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},                                      
            //Blog
            {page:"blog", key:"blog-header",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"blog", key:"blog-footer",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:1,cathegory:"blog-item", translations: {
                fr: {title:"Titre blog-item 1", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},         
            {order:2,cathegory:"blog-item", translations: {
                fr: {title:"Titre blog-item 2", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:3,cathegory:"blog-item", translations: {
                fr: {title:"Titre blog-item 3", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:4,cathegory:"blog-item", translations: {
                fr: {title:"Titre blog-item 4", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},                        
            //CONTACT
            {page:"contact", key:"contact-header",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"contact", key:"contact-form",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"contact", key:"contact-address",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"contact", key:"contact-footer",cathegory:"kubiiks", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            //REALISTATIONS
            {order:1,cathegory:"realisations", translations: {
                fr: {title:"Titre realisations 1", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},         
            {order:2,cathegory:"realisations", translations: {
                fr: {title:"Titre realisations 2", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:3,cathegory:"realisations", translations: {
                fr: {title:"Titre realisations 3", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:4,cathegory:"realisations", translations: {
                fr: {title:"Titre realisations 4", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            //TESTIMONIALS
            {order:1,cathegory:"testimonials", translations: {
                fr: {title:"Titre testimonials 1", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},         
            {order:2,cathegory:"testimonials", translations: {
                fr: {title:"Titre testimonials 2", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            //DEMO
            {page:"demo", key:"demo-header",cathegory:"content", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {page:"demo", key:"demo-footer",cathegory:"content", translations: {
                fr: {title:"Titre", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},
            {order:1,cathegory:"demo-features", translations: {
                fr: {title:"Titre demo-features 1", description:"Voila une description ", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},         
            {order:2,cathegory:"demo-features", translations: {
                fr: {title:"Titre demo-features 2", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},  
            {order:3,cathegory:"demo-features", translations: {
                fr: {title:"Titre demo-features 3", description:"Description", content:"<p>Contenu</p>"},
                en: {title:"Title", description:"Description", content:"<p>Content</p>"},
                es: {title:"Titulo", description:"Descripcion", content:"<p>Contenido</p>"},
                ca: {title:"Titol", description:"Descripció", content:"<p>Contingut</p>"},
            }},  
        ]
    }

    console.log("-----  API SETTINGS  ------")
    console.log(AppConfig.api);
    console.log(AppConfig.db);
    console.log('---------------------------');
    console.log("\nPreparing database...\n");
