import { test, describe, expect } from 'vitest';
import { IsString } from 'class-validator';
import { httpRequestContext } from '../../../../src/application/contexts/request.context';

describe('requestContext', () => {
  test('Should transform body from plain object into class', async () => {
    class MockClass {}

    let body = {};

    await httpRequestContext<MockClass>(
      {
        body: JSON.stringify(body),
        method: 'POST',
        bodyClass: MockClass,
      },
      async (transformedBody) => {
        body = transformedBody;
      },
    );

    expect(body).to.be.instanceOf(MockClass);
  });

  test('Should validate body', async () => {
    class MockClass {
      @IsString()
      public name!: string;
    }

    const body = { name: 1 };

    const response = await httpRequestContext<MockClass>(
      {
        body: JSON.stringify(body),
        method: 'POST',
        bodyClass: MockClass,
      },
      async () => {},
    );

    expect(response.statusCode).toBe(422);
  });
});
