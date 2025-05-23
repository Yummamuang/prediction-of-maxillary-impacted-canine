"""Add segmentation_path to KeypointDetection

Revision ID: 7f917b8c1e5c
Revises: 677ee1680ec6
Create Date: 2025-03-16 04:34:23.099550

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7f917b8c1e5c'
down_revision = '677ee1680ec6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('keypoint_detections', schema=None) as batch_op:
        batch_op.add_column(sa.Column('segmentation_path', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('keypoint_detections', schema=None) as batch_op:
        batch_op.drop_column('segmentation_path')

    # ### end Alembic commands ###
