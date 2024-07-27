# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Install curl
RUN apt-get update && apt-get install -y curl

# Download and install Hasura CLI
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

# Define the default command
CMD ["hasura"]
