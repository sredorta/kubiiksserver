export const messages = {
    description:"Ça c'est une api",
    user: 'Utilizateur',
    validationMinLength:(name = 'field', value='value') => `Le champ '${name}' doit avoir au moins ${value} characeters`,
    validationMaxLength: (name = 'field', value='value') => `Le champ '${name}' doit avoir moins de  ${value} characteres`,
    validationPassword: (name = 'field') => `Le champ '${name}' doit avoir au moins une majuscule, une minuscule et un numero et avoir plus de 5 characteres`,
    validationEmpty: (name = 'field') => `Le champ '${name}' ne peut pas etre vide`,
    validationUnique: (name = 'field') => `${name} déjà existent dans la base de donnees`,
    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationNotFound: (name = 'field') => `Impossible de trouver un '${name}' avec les paramètres donnés`,

    //Other system messages
    featureNotAvailable: (name = 'field') => `Functionalité '${name}' pas encore disponible`,

    //auth
    authTokenMissing: 'Authentification necessaire pour acceder',
    authTokenInvalid: 'Le token fourni est invalide',
    authEmailValidateSubject: (name = 'field') => `${name} : Validation de votre addresse de courriel`,
    authEmailSentError: "Le courriel de validation de compte email n'a pas pu etre envoyé, contactez l'administrateur",

    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };