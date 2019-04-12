export const messages = {
    description: "Esto es una api",
    validation: (name = 'field') => `El campo '${name}' est incorrecto`,
    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };