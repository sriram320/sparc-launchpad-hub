"""
Alembic configuration.
"""
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

from app.models import Base
from app.core.config import settings

# This is the Alembic Config object, which provides access to the values within the .ini file
config = context.config

# Set the SQLAlchemy URL from settings
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URI).replace("+asyncpg", ""))

# Interpret the config file for Python logging (optional)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here
# This is used for autogeneration support
target_metadata = Base.metadata

# Other values from the config, defined by the needs of env.py, can be acquired:
# ... etc.


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()