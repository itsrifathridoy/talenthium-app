# Stage 1: Build the Spring Boot application
FROM maven:3.9.2-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and source code
COPY pom.xml ./
COPY src ./src

# Build the jar
RUN mvn clean package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar /app/discovery-service.jar

# Expose default Eureka port
EXPOSE 8761

# Set default environment variables (can be overridden)
ENV SERVER_PORT=8761
ENV SPRING_APPLICATION_NAME=discovery-service
ENV EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
ENV EUREKA_CLIENT_FETCH_REGISTRY=false
#ENV EUREKA_USERNAME=talenthium_discovery
#ENV EUREKA_PASSWORD=talenthium_discovery

# Pass env vars to Spring Boot
ENTRYPOINT ["sh", "-c", "java -jar /app/discovery-service.jar --server.port=${SERVER_PORT} --spring.application.name=${SPRING_APPLICATION_NAME} --eureka.client.register-with-eureka=${EUREKA_CLIENT_REGISTER_WITH_EUREKA} --eureka.client.fetch-registry=${EUREKA_CLIENT_FETCH_REGISTRY}"]
