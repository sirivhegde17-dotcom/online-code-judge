FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including g++, openjdk-17, and docker CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    default-jdk \
    curl \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
