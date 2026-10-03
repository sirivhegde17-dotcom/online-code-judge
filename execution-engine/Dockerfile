FROM ubuntu:22.04

# Avoid interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and runtimes for Python 3, C++ (g++), and Java (OpenJDK 17)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    g++ \
    openjdk-17-jdk-headless \
    coreutils \
    time \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root sandbox user
RUN useradd -m -s /bin/bash sandboxuser

WORKDIR /sandbox
RUN chown sandboxuser:sandboxuser /sandbox

USER sandboxuser

CMD ["/bin/bash"]
