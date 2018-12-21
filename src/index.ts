export default class LogrocketFuzzySearch {
  fields: string[] = []

  constructor(privateFields: string[]) {
    this.fields = privateFields;
  }

  public requestSanitizer(request: Object): Object | any {
    return request;
  }

  public reponseSanitizer(reponse: Object): Object | any {
    return reponse;
  }

  private _searchBody(body: any = {}) {
    // iterate over collection of objects ex. [{}, ...]
    if (body.constructor === Array) {
      body.forEach((item) => this._searchBody(item));
    } else {
      for (const key in body) {
        if (body.hasOwnProperty(key)) {
          const keyName = body[key];

          /*
            Determines if the passed in object is a type-value pair,
            resembling the following shape:

              {
                type: 'email',
                value: 'foo@ex.com'
              }
          */
          const _isTypeValuePair = key === 'type' && 'value' in body;

          if (typeof keyName === 'object') {
            if (!_isTypeValuePair) {
              this._searchBody(keyName);
            }
          }

          if (_isTypeValuePair) {
            this._mask(body, body.type, 'value');
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
      body[searchKeyName] = '*';
    }
  }

  private _match(keyName: string = ''): Boolean {
    const { fields } = this;
    const normalizedKeyName = keyName.toLowerCase();

    return fields.some((field) => normalizedKeyName.indexOf(field.toLowerCase()) > -1);
  }
}
