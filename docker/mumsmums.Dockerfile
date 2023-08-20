FROM adoptopenjdk:11-jre-hotspot

WORKDIR /app

COPY build/mumsmums_deploy.jar /app/mumsmums_deploy.jar
COPY build/index.html /app/index.html
COPY build/index_bundle.js /app/index_bundle.js

EXPOSE 8080

CMD ["java", "-jar", "/app/mumsmums_deploy.jar"]
