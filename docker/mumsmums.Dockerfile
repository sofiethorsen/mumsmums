FROM azul/zulu-openjdk:21-jre

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/main.jar
COPY sqlite/recipes.db /app/sqlite/recipes.db

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
