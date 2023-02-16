import deparam from "deparam";

interface INetworkRequestResponse {
  body?: any; // POJO or a JSON stringify equalivant
  method: string;
  headers: object;
}

export default class fuzzySearch {
  public static setup(fields: string[], isSubStringMatch?: boolean) {
    const instance = new fuzzySearch(fields, isSubStringMatch);

    return {
      requestSanitizer: instance.requestSanitizer.bind(instance),
      responseSanitizer: instance.responseSanitizer.bind(instance),
    };
  }

  public fields: string[] = [];
  public isSubStringMatch?: boolean = false;

  constructor(privateFields: string[], isSubStringMatch?: boolean) {
    this.fields = privateFields;
    this.isSubStringMatch = isSubStringMatch;
  }

  public requestSanitizer(request: INetworkRequestResponse): object | any {
    // avoid parsing GET requests as there will be no body
    if (request.method === "GET") {
      return request;
    }

    return this._networkHandler(request);
  }

  public responseSanitizer(reponse: INetworkRequestResponse): object | any {
    return this._networkHandler(reponse);
  }

  private _networkHandler(networkRequestReponse: INetworkRequestResponse) {
    const { body, headers } = networkRequestReponse;
    const requestContentType: string =
      headers && (headers["Content-Type"] || "");
    const isUrlEncodedRequest: boolean =
      requestContentType.includes("form-urlencoded");
    let parsedBody: object;

    try {
      parsedBody = isUrlEncodedRequest ? deparam(body) : JSON.parse(body);

      this._searchBody(parsedBody);
    } catch (error) {
      return networkRequestReponse;
    }

    networkRequestReponse.body = parsedBody;

    return networkRequestReponse;
  }

  private _searchBody(body: any = {}) {
    // iterate over collection of objects ex. [{}, ...]
    if (body && body.constructor === Array) {
      body.forEach((item) => this._searchBody(item));
    } else {
      for (const key in body) {
        if (body.hasOwnProperty(key)) {
          const keyName = body[key];

          /*
            Objects with the following shape:
              {
                type: 'email',
                value: 'secret@ex.com'
              }
            where type/value keynames are generic and instead
            the value matching the type keyname should be masked.
          */
          const isTypeValuePair = key === "type" && "value" in body;

          if (typeof keyName === "object") {
            if (!isTypeValuePair) {
              this._searchBody(keyName);
            }
          }

          if (isTypeValuePair) {
            this._mask(body, body.type, "value");
          } else {
            this._mask(body, key);
          }
        }
      }
    }
  }

  private _mask(body: object, searchKeyName: string, maskKeyName?: string) {
    maskKeyName = maskKeyName || searchKeyName;

    const isSensitiveFieldName = this._match(searchKeyName);

    if (isSensitiveFieldName) {
      body[maskKeyName] = "*";
    }
  }

  private _match(keyName: string = ""): boolean {
    const { fields } = this;
    const normalizedKeyName = keyName.toLowerCase();

    if (this.isSubStringMatch) {
      return fields.some(
        (field) => normalizedKeyName.indexOf(field.toLowerCase()) > -1
      );
    } else {
      const fieldsLowerCase = fields.map((x) => x.toLowerCase());
      return fieldsLowerCase.includes(normalizedKeyName);
    }
  }
}
