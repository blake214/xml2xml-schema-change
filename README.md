xml2xml-schema-change
===========

Ever needed a was to convert between xml schemas, then xml2xml-schema-change could be of use

NOTE: This package is a university project, and will unlikely be worked on in the future, so dont expect to much.

Description
===========

A simple XML to XML converter, supporting a mapping file from one schema to the next.
The package includes two primary methods.

xsltSchema: Which is used to initialise and create the conversion resources. This tool will primarily return a JSON object that can then be serialised and stored in a database for future use.

xsltTransformer: Which is used to perform a transformation on a xml file and return a xml file conforming to a different schema, this method utilised the JSON object recieved by the initialisation of xsltSchema

Installation
============

Simplest way to install `xml2xml-schema-change` is to use [npm](http://npmjs.org), just `npm
install xml2xml-schema-change` which will download xml2js and all dependencies.

Usage
=====

This is a simple tool to use though does require some understanding.

Stage ONE : Initialise
----------------------

You will initialise the xsltSchema instance with 3 primary paramiters.

- xsd_source : This is a serialised version of the xsd that the parsed xml would be in
- xsd_target : This is a serialised version of the xsd that you would require the returned xml to be in
- mapping_object : This is a mapping object mapping the two together (read more on this later in this document)

```javascript
const { xsltSchema } = require("xml2xml-schema-change")

const xslt_schema = new xsltSchema(xsd_source, xsd_target, mapping_object)
xslt_schema.init()
.then(()=>{
    const xslt_schema_serialised = JSON.stringify(xslt_schema, null, 2)
    // Can check what elements havent been mapped to the xsd_target
    console.log(xslt_schema.non_mapped)
    // -> Save this xslt_schema_serialised in your database
}).catch((err) => {
    // Handle errors
    console.error(err);
});
```

Stage TWO : Transform 
-------------------

Once initialised, you can use the xslt_schema_serialised instance to transform an xml to the new xsd schema. You create an instance of the transformer with one paramiter:

- xslt_schema_serialised : This is the stored instance from stage ONE

Then you call the transform method with one paramiter:

- xml_source : This is a serialised version of the source xml you want to transform

```javascript
const { xsltTransformer } = require("xml2xml-schema-change")

const xslt_transformer = new xsltTransformer(xslt_schema_serialised)
xslt_transformer.transform(xml_source)
.then((result) => {
    console.log(result)
    // -> Now do what you want with the transformed xml
})
```

Finished

Mapping Object
=======

The mapping object should be as the form below. It is invisioned this mapping object would be created by an UI tool.

```json
[
    {
        "target": "",
        "sources": []
    }
]
```

- The primary array would hold objects of each mapping.
- target : This is the target element of the xsd_target
- sources : These are the Xpath sources from the xsd_source that will be getting mapped to the target.

Below a dummy example
```json
[
    {
        "target": "bookstore",
        "sources": ["root/sold_novels", "root/available_novels"]
    }
]
```

What happens with multiple sources? Note i have only catered to concatinating strings and arrays
- When a target is a string element, then the sources will be concatenated into one string.
    - As source_1 = "hello", source_2 = "world" -> concatednation = "hello world"
- When the target is a array element, or an element with maxOccurs="unbounded", then the elements from the sources will just be instances of the array

Running tests, development
==========================

The development requirements are handled by npm, you just need to install them.
We also have a number of unit tests, they can be run using `npm test` directly
from the project root. Use of mocha.

Conclusion
===============

There is no support for this package.
