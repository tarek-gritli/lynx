FROM python:3.12-slim

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root --only main

# Copy application
COPY app/ ./app/
COPY alembic.ini ./

# Expose port
EXPOSE 80

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Running database migrations..."\n\
alembic upgrade head\n\
echo "Starting application..."\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 80' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Run
CMD ["/entrypoint.sh"]