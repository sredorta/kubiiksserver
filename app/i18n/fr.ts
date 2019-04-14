export const messages = {
    description:"Ça c'est une api",
    user: 'Utilizateur',
    firstName: "Prénom",
    validationMinLength:(name = 'field', value='value') => `Le ${name} doit avoir au moins ${value} characeters`,

    validationUnique: (name = 'field') => `${name} déjà existent dans la base de donnees`,

    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationParamsSequelize: (name= 'field') => `Le champ '${name}' n'a pas le bon format pour la base de donnees`,
    validationUniqueSequelize: 'Violation de contrainte unique dans la base de donnees',
    validationNotNullSequelize: (name= 'field') => `Le champ '${name}' ne peut pas etre vide`,

    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };