export const messages = {
    description: "Esto es una api",
    user: 'Usuario',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: "Correo electronico",
    password: "Contraseña",
    phone: "Telefono fijo",
    mobile: "Mobil",

    validationMinLength:(name = 'field', value='value') => `El ${name} debe tener como minimo ${value} caracteres`,
    validationMaxLength: (name = 'field', value='value') => `El ${name} debe tener menos de ${value} caracteres`,
    validationPassword: (name = 'field') => `La ${name} debe tener como minimo una mayuscula, una minuscula y mas de 5 caracteres`,
    validationEmpty: (name = 'field') => `${name} no puede estar vacio`,

    validationUnique: (name = 'field') => `${name} ya existente en la base de datos`,

    validation: (name = 'field') => `El campo '${name}' est incorrecto`,
    validationParamsSequelize: (name= 'field') => `El campo '${name}' tiene un formato incorrecto para la base de datos`,
    validationUniqueSequelize: 'Un campo tiene que ser unico en la base de datos',
    validationNotNullSequelize: (name= 'field') => `El campo '${name}' no puede estar vacio`,

    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };