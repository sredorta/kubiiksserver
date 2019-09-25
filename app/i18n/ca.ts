export const messages = {
    description: "Api kubiiks",
    User: 'Usuari',
    cathegory: "categoria",

    validationExists: (name = 'field') => `Falta el parametre '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' no s'ha trobat a la base de dades`,
    validationDBMissing: (name = 'field') => `'${name}' ja existeix a la base de dades`,

    validationMinLength:(name = 'field', value='value') => `El camp '${name}' ha de tenir com a minim ${value} caracters`,
    validationMaxLength: (name = 'field', value='value') => `El camp '${name}' ha de tenir menys de ${value} caracters`,
    validationPassword: (name = 'field') => `El camp '${name}' ha de tenir com a minim una majuscula, una minuscula, un numero i mes de 5 caracters`,
    validationChecked:  (name = 'field') => `El camp '${name}' ha d'estar seleccionat`,

    validationEmpty: (name = 'field') => `El camp '${name}' no pot estar buit`,
    validationUnique: (name = 'field') => `${name} ja existeix a la base de dades`,
    validation: (name = 'field') => `El camp '${name}' es incorrecte`,
    validationNotFound: (name = 'field') => `No s'ha trobat cap '${name}' a la base de dades amb els parametres donats`,
    validationSelfUser: 'Aquesta operació no es pot fer a la vostra propi compte',
    validationTerms: "Les condicions d'utilització han d'estar acceptades",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Funcionalitat '${name}' no disponible`,

    //Auth
    authKubiiksRole : "Els drets de 'kubiiks' no son modificables",
    authTokenMissing: 'Autentificacio necessaria per accedir',
    authTokenInvalid: "La vostra sessió no es valid, connecta't de nou",
    authTokenInvalidRole: (name = 'field') => `Has de tenir els drets de '${name}' per accedir aqui`,
    authInvalidCredentials: 'Credencials incorrectes',
    authTooManyTrials:  'Massa intents fallats, intenta-ho de nou en uns minuts',
    authAlreadyLoggedIn:  'Vostè ja està connectat',

    oauth2MissingField : (name = 'field') => `Error de autentificació, impossible de recuperar el camp ${name} `,
    authEmailResetPassword: (name = 'field') => `Un correu electronic amb el nou password ha estat enviat a : ${name}`,
    authEmailValidate: (name = 'field') => `Un correu electronic de confirmació ha estat enviat a : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Verificació del compte de correu`,    
    authEmailValidateError: "No s'ha pogut activar el compte, contacta amb l'administrador",
    authEmailValidateSuccess: "S'ha activat el compte",
    authAccountNotActive: "Per accedir s'ha de validar el compte de correu electronic abans",

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nou password`,
    emailSentOk:    (name = 'field') => `Un correu electrònic ha sigut enviat a : ${name}`,
    emailSentOkAll: (count = '0') => `Correu enviat a ${count} recipients`,

    emailSentError: "No s'ha pogut enviar el correu electronic, contacte amb l'administrador",
    emailSiteAccess : 'ANAR A LA WEB',
    emailDeleteProtected: 'Els models de correu del sistema no es poden borrar',
    emailValidationLink: (name = 'field') => `<p>Valida el teu compte clickant al següent <a href='${name}'>link</a></p>`,
    emailResetPassword: (name = 'field') => `<p>El seu nou passowrd : <span>${name}<span></p>`,
    emailResetPasswordSubject: (name = 'field') => `${name} : Nou password`,

    //chat part
    chatWelcome: "Benvingut al chat",
    chatLanguageSwitch: "Ens pots parlar en català s'hi ho prefereixes",
    chatJoinRoom: (name = '') => `${name} : Ha entrat al chat`,
    chatLeaveRoom: (name = '') => `${name} : Ha sortit del chat`,

    //notifications titles
    notificationContactEmail: 'Rebut un nou email de contacte',    
    notificationNewChat: 'Un nou chat acaba de commençar',

    articleContentNotCreate: "Els articles de la categoria 'content' no es poden crear",
    articleContentNotDelete: "Els articles de la categoria 'content' no es poden borrar",
    articleDelete: 'Articule borrat correctament',
    articleNewTitle: 'Nou article',
    articleNewDescription: 'Exemple de descripció',
    articleNewContent:  '<h1>Nou article</h1>',

    apiRouteNotFound: 'El servidor no ha trobat la petició',




    messageSent: 'El missatge ha estat enviat',
    saved : 'Modificacions guardades correctament',


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };