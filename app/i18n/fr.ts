export const messages = {
    description:"Ça c'est une api",
    User: 'Utilizateur',
    validationExists: (name = 'field') => `Manque le parametre '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' non trouvé dans la base de données`,
    validationDBMissing: (name = 'field') => `'${name}' déjà enregistré dans notre base de données`,

    validationMinLength:(name = 'field', value='value') => `Le champ '${name}' doit avoir au moins ${value} characeters`,
    validationMaxLength: (name = 'field', value='value') => `Le champ '${name}' doit avoir moins de  ${value} characteres`,
    validationPassword: (name = 'field') => `Le champ '${name}' doit avoir au moins une majuscule, une minuscule et un numero et avoir plus de 5 characteres`,
    validationChecked:  (name = 'field') => `Le champ '${name}' doit etre coché`,

    validationEmpty: (name = 'field') => `Le champ '${name}' ne peut pas etre vide`,
    validationUnique: (name = 'field') => `${name} déjà existent dans la base de donnees`,
    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationNotFound: (name = 'field') => `Pas de '${name}' enregistrée dans nos bases de donnees avec les paramètres donnés`,
    validationTerms: "Les conditions d'utilization des données personnelles doivent être accetés",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Functionalité '${name}' pas encore disponible`,

    //auth
    authTokenMissing: 'Authentification necessaire pour acceder',
    authTokenInvalid: "Votre session n'est pas valide, connectez-vous a nouveau",
    authTokenInvalidAdmin: "Droit d'administrateur requis pour cette operation",
    authInvalidCredentials: 'Credentiels invalides',
    authTooManyTrials:  'Trop d\'essais invalides, essaye a nouveau dans quelques minutes',
    authEmailResetPassword: (name = 'field') => `Un courriel avec le nouvea mot de passe à été envoyé à : ${name}`,
    authEmailValidate: (name = 'field') => `Un courriel de validation de compte à été envoyé à : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Validation de votre addresse de courriel`,
    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nouveau mot de passe`,
    authEmailSentError: "Le courriel n'a pas pu etre envoyé, contactez l'administrateur",
    oauth2MissingField : (name = 'field') => `Erreur penant l'authentifition, impossible de recuperer le champ ${name} `,

    apiRouteNotFound: "Le serveur n'a pas trouvé la requete demandé",


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };