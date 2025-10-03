"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2023-09-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tables based on your models
    pass


def downgrade():
    # Drop tables in reverse order
    pass