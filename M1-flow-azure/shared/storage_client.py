from azure.data.tables import TableClient
from azure.storage.queue import QueueClient
from azure.storage.blob import BlobClient
from azure.core.exceptions import ResourceExistsError
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class StorageClient:
    def __init__(self):
        self.conn_str = settings.STORAGE_CONNECTION_STRING
        if not self.conn_str:
            logger.warning("STORAGE_CONNECTION_STRING not set. Storage operations will fail.")
        
    def get_table_client(self, table_name: str) -> TableClient:
        client = TableClient.from_connection_string(conn_str=self.conn_str, table_name=table_name)
        try:
            client.create_table()
        except ResourceExistsError:
            pass
        return client

    def get_queue_client(self, queue_name: str) -> QueueClient:
        client = QueueClient.from_connection_string(conn_str=self.conn_str, queue_name=queue_name)
        try:
            client.create_queue()
        except ResourceExistsError:
            pass
        return client
        
    def get_blob_client(self, container_name: str, blob_name: str) -> BlobClient:
        return BlobClient.from_connection_string(
            conn_str=self.conn_str, 
            container_name=container_name, 
            blob_name=blob_name
        )

storage_client = StorageClient()
