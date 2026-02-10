from cryptography.fernet import Fernet

from app.core.config import settings


def get_cipher():
    """Get Fernet cipher instance"""
    return Fernet(settings.encryption_key.encode())


def encrypt_key(plain_key: str) -> str:
    """Encrypt key for storage"""
    cipher = get_cipher()
    encrypted = cipher.encrypt(plain_key.encode())
    return encrypted.decode()


def decrypt_key(encrypted_key: str) -> str:
    """Decrypt key for use"""
    cipher = get_cipher()
    decrypted = cipher.decrypt(encrypted_key.encode())
    return decrypted.decode()
