from cryptography.fernet import Fernet
from app.config import settings

def get_cipher():
    """
    Get Fernet cipher
    """
    return Fernet(settings.encryption_key.encode())

def encrypt_api_key(plain_key: str) -> str:
    """Encrypt API key for storage"""
    cipher = get_cipher()
    encrypted = cipher.encrypt(plain_key.encode())
    return encrypted.decode()

def decrypt_key(encrypted_key: str) -> str:
    """Decrypt API key for use"""
    cipher = get_cipher()
    decrypted = cipher.decrypt(encrypted_key.encode())
    return decrypted.decode()