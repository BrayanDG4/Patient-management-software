# Usar una imagen base (puede ser otra imagen según la necesidad)
FROM node:18-alpine

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar los archivos del backend al directorio de trabajo
COPY . .

# Instalar dependencias
RUN yarn install

# Comando para iniciar el servidor backend
CMD ["yarn", "start"]
