# 🚀 LogRocket Fuzzy Search Sanitizer

[![Build Status](https://travis-ci.com/jbailey4/logrocket-fuzzy-search-sanitizer.svg?branch=master)](https://travis-ci.com/jbailey4/logrocket-fuzzy-search-sanitizer)

Optional LogRocket plugin to help sanitize data from network requests and responses.

[Blog post](https://medium.com/@josh_bailey4/sanitizing-data-with-logrocket-2af1bbbe46a1)

---

When initializing LogRocket's SDK you can optionally provide a `requestSanitizer` and `responseSanitizer` method within the [network option](https://docs.logrocket.com/reference#network), which are called on each network request within your app. This is useful when you need to prevent some requests/responses or sensitive data within headers, payloads, etc. being sent to LogRocket's servers and replays.

This plugin provides pre-configured `requestSanitizer`/`responseSanitizer` methods which sanitize network payloads by the field names within each payload. This allows you to still capture every network request within in your app, getting the monitoring benefits provided by LogRocket, while allowing an easy way to mask the sensitive data in your app.

## Usage

Note: You must have LogRocket installed and an app ID ready to use. See the [quickstart](https://docs.logrocket.com/docs/quickstart) docs.

### Steps

1. Import this plugin along with LogRocket
2. Call the setup method on this plugin, passing an array of the private field names
    - the setup method returns a hash with the 2 sanitizer methods
3. Init LogRocket
4. Specify a configuration with the `network` option and pass in the sanitizer methods

#### Example

```es6
import LogRocket from 'logrocket';
import LogrocketFuzzySanitizer from 'logrocket-fuzzy-search-sanitizer';

const { requestSanitizer, responseSanitizer } = LogrocketFuzzySanitizer.setup([...privateFieldNames]);

LogRocket.init('app/id', {
  network: {
    requestSanitizer,
    responseSanitizer
  }
});
```

#### Private Field Names

This is the first argument passed to the `setup` method, and should be an array of strings that represent the private field names that could potentially be found in any request/response within your app.

For example, if your app obtains user sensitive data such as social security numbers, first name, date of birth, etc.:

```es6
import LogRocket from 'logrocket';
import LogrocketFuzzySanitizer from 'logrocket-fuzzy-search-sanitizer';

const privateFieldNames = [
  'ssn',
  'firstName',
  'birthDate'
];

const { requestSanitizer, responseSanitizer } = LogrocketFuzzySanitizer.setup(privateFieldNames);
LogRocket.init('app/id', {
  network: {
    requestSanitizer,
    responseSanitizer
  }
});
```

Now when requests and responses get passed through the sanitizer methods, any field name containing "ssn", "firstName", or "birthDate" will be masked and hidden from LogRocket.

## Running / Development

- `npm install`
- Make any changes, bug fixes, etc.
- Run tests: `npm run test && npm run lint`
