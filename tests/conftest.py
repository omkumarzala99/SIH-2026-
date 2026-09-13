"""
Pytest configuration and global fixtures for MOIL Mining Platform tests.
"""
import pytest
from database.connection import init_db
from database.seed_data import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initializes and seeds database before test suite begins."""
    init_db()
    seed_database()
