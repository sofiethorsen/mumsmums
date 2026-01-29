# =============================================================================
# Stage 1: Builder - Build the Kotlin backend with Bazel
# =============================================================================
FROM azul/zulu-openjdk:21 AS builder

# Install build tools:
# - curl: Download Bazelisk
# - git: Required by Bazel for repository rules
# - unzip: Extract downloaded dependencies
# - gcc/g++: C/C++ compilers required by Bazel's C++ toolchain
# - build-essential: Meta-package providing make and other build tools
RUN apt-get update && \
    apt-get install -y \
        curl \
        git \
        unzip \
        gcc \
        g++ \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Bazelisk - wrapper that auto-downloads the correct Bazel version from .bazelversion file
RUN curl -Lo /usr/local/bin/bazel https://github.com/bazelbuild/bazelisk/releases/download/v1.19.0/bazelisk-linux-amd64 && \
    chmod +x /usr/local/bin/bazel

# Create non-root user for building (Bazel's Python rules require non-root)
RUN groupadd builder -g 1000 && \
    useradd -u 1000 -g builder -m -d /home/builder builder

# Set up build directory with correct ownership
WORKDIR /build
RUN chown builder:builder /build

# Switch to non-root user for build
USER builder

# Copy source code
COPY --chown=builder:builder . .

# Build the application
# Bazel will cache intermediate results, making rebuilds faster
RUN bazel build //src/server/jvmMain/kotlin/app/mumsmums:mumsmums_deploy.jar

# Copy built JAR to a known location
RUN mkdir -p /build/output && \
    cp bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar /build/output/mumsmums.jar

# =============================================================================
# Stage 2: Runtime - Minimal JRE image with only the JAR
# =============================================================================
FROM azul/zulu-openjdk:21-jre

# Install runtime dependencies:
# - curl: Required for Docker healthcheck endpoint testing
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd appuser -g 1000 && \
    useradd -u 1000 -g appuser appuser

WORKDIR /app

# Copy files with ownership set during copy
COPY --from=builder --chown=appuser:appuser /build/output/mumsmums.jar /app/main.jar
COPY --from=builder --chown=appuser:appuser /build/src/server/jvmMain/resources/recipes.json /app/src/server/jvmMain/resources/recipes.json

# Create sqlite directory for database and set ownership
RUN mkdir -p /app/sqlite && \
    chown appuser:appuser /app/sqlite

# Switch to non-root user
USER appuser

EXPOSE 8080

CMD ["java", "-jar", "/app/main.jar"]
