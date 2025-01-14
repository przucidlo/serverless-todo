import { HttpError, HttpUnprocessableContentError } from "../errors/http.error";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateOrReject, ValidationOptions } from "class-validator";
import { logger } from "../layers/logger.layer";

interface HttpContext<TBody = unknown> {
  method: string;
  body: string | null;
  bodyClass?: ClassConstructor<TBody>;
  validatorOptions?: ValidationOptions;
}

async function parseBody({ body, bodyClass, validatorOptions }: HttpContext) {
  if (!bodyClass || !body) {
    return body;
  }
  // TODO: throw 422 on other content-type or malformated json
  let output = JSON.parse(body);

  output = plainToInstance(bodyClass, output);

  await validateOrReject(output, validatorOptions).catch((err) => {
    throw new HttpUnprocessableContentError(err);
  });

  return output;
}

function mapHandlerOutput(
  output: unknown | unknown[],
  classConstructor?: ClassConstructor<unknown>
): unknown {
  if (!classConstructor) {
    return output;
  }

  return Array.isArray(output)
    ? output.map((o) => new classConstructor(o))
    : new classConstructor(output);
}

function buildHttpResponse(statusCode: number, body: unknown) {
  return { statusCode, body: JSON.stringify(body) };
}

export async function httpRequestContext<TBody extends object>(
  context: HttpContext<TBody>,
  handler: (body: TBody) => Promise<unknown>
): Promise<{ statusCode: number; body: string }> {
  try {
    const response = mapHandlerOutput(
      await handler(await parseBody(context)),
      context.bodyClass
    );

    return buildHttpResponse(
      response ? (["POST", "PUT"].includes(context.method) ? 201 : 200) : 204,
      { data: response }
    );
  } catch (err) {
    if (err instanceof HttpUnprocessableContentError) {
      return buildHttpResponse(err.code, { errors: err.body });
    }

    if (err instanceof HttpError) {
      return buildHttpResponse(err.code, { message: err.message });
    }

    logger.error({ err }, "Request context failure");

    return buildHttpResponse(500, { message: "Internal Server Error" });
  }
}
