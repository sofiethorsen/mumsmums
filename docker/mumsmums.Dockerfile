FROM azul/zulu-openjdk:21-jre

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/main.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
