FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy all source files
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# The updated command
CMD ["npm", "run", "start"]