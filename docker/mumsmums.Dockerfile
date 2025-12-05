FROM azul/zulu-openjdk:21-jre

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/main.jar

# Copy the raw recipes.json - we use this to seed the database if it doesn't already exist on the host
COPY src/server/jvmMain/resources/recipes.json /app/src/server/jvmMain/resources/recipes.json

# Create sqlite directory for database
RUN mkdir -p /app/sqlite

# Set database path via environment variable
ENV MUMSMUMS_DB_PATH=/app/sqlite/mumsmums.db

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
