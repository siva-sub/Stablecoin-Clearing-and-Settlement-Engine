from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.database_models import Base

DATABASE_URL = "sqlite+aiosqlite:///./scse.db"

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}, # Needed for SQLite
    echo=False
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
