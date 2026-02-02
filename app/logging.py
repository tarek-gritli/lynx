import logging
import sys
from typing import Literal

from app.config import settings

LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


def setup_logging(level: LogLevel = None) -> logging.Logger:
    """Configure and return the application logger."""

    if level is None:
        level = "DEBUG" if settings.environment == "development" else "INFO"

    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=getattr(logging, level),
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
        force=True,
    )

    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("github").setLevel(logging.WARNING)
    logging.getLogger("gitlab").setLevel(logging.WARNING)

    logger = logging.getLogger("lynx")
    logger.setLevel(getattr(logging, level))

    return logger


def get_logger(name: str = "lynx") -> logging.Logger:
    """Get a logger instance with the given name."""
    return logging.getLogger(name)
