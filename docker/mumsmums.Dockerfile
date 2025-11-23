FROM azul/zulu-openjdk:21-jre

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/main.jar
COPY sqlite/recipes.db /app/sqlite/recipes.db

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
