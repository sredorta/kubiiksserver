export const messages = {
    description: 'This is an api',
    validation: (name = 'field') => `Wrong value for for field '${name}'`,
    sequelize: (name= 'field') => `Wrong database value for for field '${name}'`,
    title: 'Simple i18n implementation with TypeScript',
    greeting: (name = 'John Doe') => `Hello, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };