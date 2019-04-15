export const messages = {
    description:"Ça c'est une api",
    user: 'Utilizateur',
    firstName: "Prénom",
    lastName: "Nom de famille",
    email: "Adresse email",
    password: "Mot de passe",
    validationMinLength:(name = 'field', value='value') => `Le ${name} doit avoir au moins ${value} characeters`,
    validationMaxLength: (name = 'field', value='value') => `Le ${name} doit avoir moins de  ${value} characteres`,
    validationPassword: (name = 'field') => `Le ${name} doit avoir au moins une majuscule, une minuscule et un numero et avoir plus de 5 characteres`,
    validationUnique: (name = 'field') => `${name} déjà existent dans la base de donnees`,

    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationParamsSequelize: (name= 'field') => `Le champ '${name}' n'a pas le bon format pour la base de donnees`,
    validationUniqueSequelize: 'Violation de contrainte unique dans la base de donnees',
    validationNotNullSequelize: (name= 'field') => `Le champ '${name}' ne peut pas etre vide`,

    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };