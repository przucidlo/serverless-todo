import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Table } from 'dynamodb-toolbox';

const dynamoDBClient = new DynamoDBClient({});

const documentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

export const table = new Table({
  documentClient,
  name: 'dev_todo',
  partitionKey: { name: 'pk', type: 'string' },
  sortKey: { name: 'sk', type: 'string' },
  indexes: {
    GSI1: {
      type: 'global',
      partitionKey: {
        name: 'GSI1PK',
        type: 'string',
      },
      sortKey: {
        name: 'GSI1SK',
        type: 'string',
      },
    },
  },
});
