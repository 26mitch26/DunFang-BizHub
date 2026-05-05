FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml settings-temp.xml ./
RUN mvn dependency:go-offline -s settings-temp.xml -B
COPY src ./src
RUN mvn package -s settings-temp.xml -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
