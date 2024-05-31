# Use the official Python image
FROM python:3.8-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set the default Python file to run
ARG PYTHON_FILE=app.py
ENV PYTHON_FILE=${PYTHON_FILE}

# Command to run the Python app
CMD ["sh", "-c", "python ${PYTHON_FILE}"]
