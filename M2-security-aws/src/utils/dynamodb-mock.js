// src/utils/dynamodb-mock.js
const IS_OFFLINE = process.env.IS_OFFLINE === 'true';

// Mock storage en mémoire pour mode offline
const mockStorage = {
  usedJTI: new Map(),
  audit: []
};

class MockDynamoDB {
  get(params) {
    return {
      promise: async () => {
        if (params.TableName.includes('used-jti')) {
          const item = mockStorage.usedJTI.get(params.Key.jti);
          return item ? { Item: item } : {};
        }
        return {};
      }
    };
  }

  put(params) {
    return {
      promise: async () => {
        if (params.TableName.includes('used-jti')) {
          mockStorage.usedJTI.set(params.Item.jti, params.Item);
        } else if (params.TableName.includes('audit')) {
          mockStorage.audit.push(params.Item);
        }
        return {};
      }
    };
  }

  scan(params) {
    return {
      promise: async () => {
        if (params.TableName.includes('used-jti')) {
          return {
            Items: Array.from(mockStorage.usedJTI.values())
          };
        }
        return { Items: mockStorage.audit };
      }
    };
  }
}

// Export selon l'environnement
module.exports = IS_OFFLINE 
  ? new MockDynamoDB() 
  : new (require('aws-sdk').DynamoDB.DocumentClient)();