# Feed Mocker

A quick and dirty feed mocker implementation.

## Installation

```bash
git clone <THIS REPOSITORY> <DIR>
cd <DIR>
npm install
```

## Usage

```bash
npm start -- <FEED DIRECTORY>
```

## Feed Directory

Is a directory with manifest.json file which describes feeds responses, example one:

```json5
{
  \\ name of the feed mock
  "api-example": { 
    \\ regular expression to match against url, defaults to .*
    "pattern": "get_[a-z]+_updates", 
    \\ if true, when all events expires it'll restart from beginning, default to false
    "wrapAround": true,
    \\ introduce random delays in range [min, max], defaults to [0,0]
    "delays": {
      "min": 50,
      "max": 500
    },
    \\ list of events / responses to play
    "events": [
      {
        // get response from file, relative to manifest, optional
        "file": "1.xml",
        // response status code, optional
        "statusCode": 200,
        // response headers, optional
        "headers": {
          "x-custom": "aaaa"
        }
      },
      {
        "statusCode": 500,
        // instead of file, body can be given
        "body": "Something went terribly, terribly wrong"
      },
      {
        "statusCode": 302,
        "headers": {
          "location": "http://127.0.0.1:8080/get_matches_liver_updates"
        }
      },
      {
        "file": "1.json"
      },
      {
        "body": "How about a nice body"
      }
    ]
  }
}
```

## Body templates
response body is treated as a handlebars template, with two custom helpers, that differ only in default format

### now
default format is 'YYYY-MM-DD HH:mm:ss'

```handlebars
{{now}}
{{now 'YYYY-MM-DD'}}
{{now -10 'months'}}
{{now +10 'days' 'YYYY-MM-DD'}}
```

Date formatting and manipulation is done by moment.js, here're the relevant docs:
- [format](https://momentjs.com/docs/#/displaying/format/)
- [manipulation](https://momentjs.com/docs/#/manipulating/add/)

### today
default format is 'YYYY-MM-DD'

```handlebars
{{today}}
{{today 'YYYY-MM-DD'}}
{{today -10 'months'}}
{{today +10 'days' 'YYYY-MM-DD'}}
```
