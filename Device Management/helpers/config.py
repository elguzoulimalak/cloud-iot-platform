
from typing import Final
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker
import logging

#environement variables
USER_DB:Final[str]=os.getenv('USER_DB','admin')
PASSWORD_DB:Final[str]=os.getenv('PASSWORD_DB','1234')
NAME_DB:Final[str]=os.getenv('NAME_DB','db_device_management')
SERVER_DB:Final[str]=os.getenv('SERVER_DB','localhost')
DB_PORT:Final[str]=os.getenv('DB_PORT','5432')
URL_DB:Final[str]=f'postgresql+psycopg2://{USER_DB}:{PASSWORD_DB}@{SERVER_DB}:{DB_PORT}/{NAME_DB}'

#RabbitMQ
RABBITMQ_HOST:Final[str]=os.getenv('RABBITMQ_HOST','localhost')
RABBITMQ_PORT:Final[int]=int(os.getenv('RABBITMQ_PORT','5672'))
RABBITMQ_USER:Final[str]=os.getenv('RABBITMQ_USER','guest')
RABBITMQ_PASS:Final[str]=os.getenv('RABBITMQ_PASS','guest')

#sqlalchemy
engine=create_engine(URL_DB,pool_size=10)
LocalSession=sessionmaker(bind=engine)
Base=declarative_base()

def session_factory():
    session=LocalSession()
    try:
        yield session
    finally:
        session.close()

#logs
if not os.path.exists('./logs'):
    os.makedirs('./logs')

formater=logging.Formatter(fmt='%(asctime)s-%(levelname)s-%(message)s')
handler=logging.FileHandler('./logs/device_management.log')
handler.setFormatter(formater)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formater)

logger=logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(handler)
logger.addHandler(console_handler)
