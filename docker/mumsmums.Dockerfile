FROM azul/zulu-openjdk:21-jre

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -r appuser -g 1000 && \
    useradd -r -u 1000 -g appuser appuser

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/main.jar

# Copy the raw recipes.json - we use this to seed the database if it doesn't already exist on the host
COPY src/server/jvmMain/resources/recipes.json /app/src/server/jvmMain/resources/recipes.json

# Create sqlite directory for database and set ownership
RUN mkdir -p /app/sqlite && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
