FROM adoptopenjdk:11-jre-hotspot

WORKDIR /app

COPY bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar /app/main.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
