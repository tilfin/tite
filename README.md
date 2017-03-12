tite
====

tite &#x3010;tάɪt&#x3011; is a **Ti**ny static websi**te** engine that supports markdown and ejs.


## Install

```
$ npm install tite
```


## How to use

### config.json

```json
{
  "port": 10080,
  "dir": {
    "www": "/var/www/html",
    "templates": "./ejs",
    "errors": "./errors",
  }
}
```

* `port` - listening port (default 8080)
* `dir.www` - This is web content root directory.
* `dir.templates` - There is placing ejs templates and parts.
* `dir.errors` - There is placing an error page whose basename is status code. ex) 400.md 404.html 500.ejs

### Run a server

```
$ $(npm bin)/tite config.json
```

## Redirect resolver

* **status** (option) - status code `301` or `302` (default is `302`)
* **location** (required) - A string is URL or path to be redirected, or an object is composed of keys (accept-language) and the values (URL or path), Using the first define if no match.

### _index_.redirect

```yaml
status: 301
location:
  en: /en/
  ja: /ja/
```

## Example directory tree

```tree
.
├── node_modules
│   └── tite
├── errors
│   └── 404.html
├── templates
│   ├── parts
│   │   └── common.ejs
│   └── layout.ejs
└── www
    ├── index.md
    ├── sub
    │   ├── index.html
    │   └── faq.ejs
    └── img
        └── xxxx.jpg
```

### templates/layout.ejs

```html
<html>
<head>
<title><%= title %></title>
</head>
<body>
<%- content %>
</body>
</html>
```

### www/index.md

```md
----
title: Top page
template: layout
----
My Website
===========

## List

- example1
- example2
- example3
```

The engine applys the title and the content converted to HTML from the markdown to layout.ejs template if you browse `http://localhost:8080/`.

Static text pages are to be resolved by basically path without the extension.
For example, opening `GET /sub/faq`, the engine converts `sub/faq.ejs` to HTML and return it.
