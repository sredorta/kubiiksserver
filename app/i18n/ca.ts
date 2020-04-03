export const messages = {
    description: "Api kubiiks",
    User: 'Usuari',
    cathegory: "categoria",

    validationExists: (name = 'field') => `Falta el paràmetre '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' no s'ha trobat a la base de dades`,
    validationDBMissing: (name = 'field') => `'${name}' ja existeix a la base de dades`,

    validationMinLength:(name = 'field', value='value') => `El camp '${name}' ha de tenir com a mínim ${value} caràcters`,
    validationMaxLength: (name = 'field', value='value') => `El camp '${name}' ha de tenir menys de ${value} caràcters`,
    validationPassword: (name = 'field') => `El camp '${name}' ha de tenir com a mínim una majúscula, una minúscula, un numero i mes de 5 caràcters`,
    validationChecked:  (name = 'field') => `El camp '${name}' ha d'estar seleccionat`,

    validationEmpty: (name = 'field') => `El camp '${name}' no pot estar buit`,
    validationUnique: (name = 'field') => `${name} ja existeix a la base de dades`,
    validation: (name = 'field') => `El camp '${name}' es incorrecte`,
    validationNotFound: (name = 'field') => `No s'ha trobat cap '${name}' a la base de dades amb els paràmetres donats`,
    validationSelfUser: 'Aquesta operació no es pot fer al vostre propi compte',
    validationTerms: "Les condicions d'utilització han d'estar acceptades",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Funcionalitat '${name}' no disponible`,

    //Auth
    authKubiiksRole : "Els drets de 'kubiiks' no son modificables",
    authTokenMissing: 'Autentificació necessària per accedir',
    authTokenInvalid: "La vostra sessió no es vàlid, connecta't de nou",
    authTokenInvalidRole: (name = 'field') => `Has de tenir els drets de '${name}' per accedir aquí`,
    authInvalidCredentials: 'Credencials incorrectes',
    authTooManyTrials:  'Massa intents fallats, intenta-ho de nou en uns minuts',
    authAlreadyLoggedIn:  'Vostè ja està connectat',

    oauth2MissingField : (name = 'field') => `Error de autentificació, impossible de recuperar el camp ${name} `,
    authEmailResetPassword: (name = 'field') => `Un correu electrònic ha estat enviat a : ${name}`,
    authEmailValidate: (name = 'field') => `Un correu electrònic de confirmació ha estat enviat a : ${name}`,
    authEmailValidateSubject: 'Verificació del compte de correu',    
    authEmailValidateError: "No s'ha pogut activar el compte, contacta amb l'administrador",
    authEmailValidateSuccess: "S'ha activat el compte",
    authAccountNotActive: "Per accedir s'ha de validar el compte de correu electrònic abans",
    authEstablisPasswordError: "No s'ha pogut reinicialitzar la contrasenya, contacteu amb l'administrador",

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nova contrasenya`,
    emailSentOk:    (name = 'field') => `Un correu electrònic ha sigut enviat a : ${name}`,
    emailSentOkAll: (count = '0') => `Correu enviat a ${count} adreces`,

    emailSentError: "No s'ha pogut enviar el correu electrònic, contacte amb l'administrador",
    emailSiteAccess : 'ANAR A LA WEB',
    emailDeleteProtected: 'Els models de correu del sistema no es poden esborrar',
    emailValidationLink: (name = 'field') => `<p>Valida el teu compte clicant al següent <a href='${name}'>enllaç</a></p>`,
    emailResetPassword: (name = 'field') => `<p>La nova contrasenya és : <span>${name}<span></p>`,
    emailResetPasswordSubject: 'Recuperar el meu compte',
    emailResetPasswordNoUser: "Hi ha hagut una demanda de reinicialitzar la contrasenya en aquest compte de correu electronic, en canvi aquest compte no està enregistrat en les nostres bases de dades",

    //chat part
    chatWelcome: "Benvingut al xat",
    chatLanguageSwitch: "Ens pots parlar en català s'hi ho prefereixes",
    chatJoinRoom: (name = '') => `${name} : Ha entrat al xat`,
    chatLeaveRoom: (name = '') => `${name} : Ha sortit del xat`,

    //notifications titles
    notificationContactEmail: 'Rebut un nou correu electrònic de contacte',    
    notificationNewChat: 'Un nou xat acaba de començar',

    articleContentNotCreate: "Els articles de la categoria 'content' no es poden crear",
    articleContentNotDelete: "Els articles de la categoria 'content' no es poden esborrar",
    articleDelete: 'Article esborrat correctament',
    articleNewTitle: 'El meu títol',
    articleNewDescription: 'La meva descripció',
    articleNewContent:  '<p>El meu contingut</p>',

    notificationNewTitle: 'El meu títol',
    notificationNewBody: 'Em meu contingut',
    notificationSendOk: 'Notificació enviada correctament',

    apiRouteNotFound: 'El servidor no ha trobat la petició',

    newsletterSubscribed: "A partir d'ara rebreu els butlletins informatius",
    newsletterUnsubscribed: "L'adreça de correu electrònic s'ha donat de baixa als butlletins informatius",
    newsletterMissing: "No s'ha pogut trobar cap compte de correu electrònic donat d'alta als butlletins informatius",

    fileTooLarge: "Fitxer massa gran",

    messageSent: 'El missatge ha estat enviat',
    saved : 'Modificacions guardades correctament',

    unreadNotification: (unread: number) => `Teniu ${unread === 0 ? 'no' : unread} notificacions no llegides`
    };