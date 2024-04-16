# Usar una imagen base con Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar los archivos del frontend al directorio de trabajo
COPY . .

# Instalar dependencias
RUN yarn install

# Construir la aplicación React
RUN yarn build

# Instalar serve para servir la aplicación
RUN yarn global add serve

# Exponer el puerto en el contenedor
EXPOSE 4000

# Comando para iniciar el servidor y servir la aplicación React
CMD ["serve", "-s", "-l", "4000", "dist"]
