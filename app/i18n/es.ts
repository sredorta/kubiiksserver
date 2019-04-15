export const messages = {
    description: "Esto es una api",
    user: 'Usuario',
    firstName: 'Nombre',
    lastName: 'Apellido',
    validationMinLength:(name = 'field', value='value') => `El '${name}' debe tener como minimo ${value} caracteres`,

    validationUnique: (name = 'field') => `${name} ya existente en la base de datos`,

    validation: (name = 'field') => `El campo '${name}' est incorrecto`,
    validationParamsSequelize: (name= 'field') => `El campo '${name}' tiene un formato incorrecto para la base de datos`,
    validationUniqueSequelize: 'Un campo tiene que ser unico en la base de datos',
    validationNotNullSequelize: (name= 'field') => `El campo '${name}' no puede estar vacio`,

    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };