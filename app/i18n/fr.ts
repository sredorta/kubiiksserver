export const messages = {
    description:"Ça c'est une api",
    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationParamsSequelize: (name= 'field') => `Le champ '${name}' n'a pas le bon format pour la base de donnees`,
    validationUniqueSequelize: 'Violation de contrainte unique dans la base de donnees',
    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };