"""
Test runner script for MOIL Mining Platform.
Safely configures the test environment and runs pytest.
"""
import os
import sys

# Disable external plugins that might fail under Windows Application Control policy
os.environ["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

if __name__ == "__main__":
    args = sys.argv[1:] if len(sys.argv) > 1 else ["tests/", "-v"]
    ret = pytest.main(args)
    sys.exit(ret)
