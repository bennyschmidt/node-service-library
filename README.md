## Node Service Library

Modular HTTP/WS service wrappers for Node. 

### Why not just use Express?

Your Node.js backend could be a simple `server.js` with a bunch of handlers down the file. A surprising number of codebases are essentially that. 

But at scale, you often need to split out backend functionality to separate services, or even individual functions, in order to scale each part efficiently. [`node-service-library`](https://github.com/bennyschmidt/node-service-library) gives you a common interface for building such services. 

It includes basic request validation, error handling, and a novel feature called "implicit responses" whereby `return` values of API endpoints can optionally be the HTTP response to a request - closing the development gap in client/server API applications, making it easier to build focusing only on FE/BE components.

### Is it hard to learn?

#### Component-based

This library follows a declarative component architecture with lifecycle methods (like React) and is as thin and simple as it could be while still adding organizational value, and the baseline modularity you need for a scalable service architecture.

Define a new `http` service like this:

In `/example/index.js`:

```javascript
const { http } = require('node-service-library');

module.exports = http({
  GET: {},
  POST: {},
  PUT: {},
  DELETE: {}
});
```

#### REST APIs

API design closely follows REST (with `GET`, `POST`, `PUT`, & `DELETE` methods), and services are declared in [`node-service-core`](https://github.com/bennyschmidt/node-service-core). 

#### Where are the other HTTP methods?

Not all methods are supported:

- `HEAD`: `HEAD` requests will very likely be supported in the future for various reasons, but it isn't a high priority yet.

- `CONNECT`: For security and other reasons, and because two-way communication is already accomplished via the `WS` (WebSocket) component, there is currently no plan to support `CONNECT` requests or HTTP tunneling.

- `OPTIONS`: Currently not supported, but will likely be implemented in [`node-service-core`](https://github.com/bennyschmidt/node-service-core) to provide clients with information about what requests are allowed.

- `TRACE`: `TRACE` requests were designed for diagnostics and debugging. It's not supported because they can be exploited to carry out DDoS attacks like the ["HTTP TRACE Flood"]() attack, where:

> An HTTP TRACE Flood consists of TRACE requests. Unlike other HTTP floods that may include other request methods such as POST, PUT, GET, etc.
>
> When the server’s limits of concurrent connections are reached, the server can no longer respond to legitimate requests from other clients attempting to TRACE, causing a denial of service.
>
> HTTP TRACE flood attacks use standard URL requests, hence it may be quite challenging to differentiate from valid traffic. Traditional rate-based volumetric detection is ineffective in detecting HTTP TRACE flood attacks since traffic volume in HTTP TRACE floods is often under detection thresholds.

- `PATCH`: `PATCH` requests are not supported (while `PUT` is) for data integrity reasons. In today's world, with JSON being the primary format, the rise of GraphQL APIs & NoSQL databases, and similarly structured blockchains, it's not possible to manage complex database re-structuring without something like a schema migration: 

Take the following data `{ name: "Bob Smith" }`. Imagine a sudden requirement to change it to `{ firstName: "Bob", lastName: "Smith" }`. Migrating this change with an API that supports `PATCH` would result in `{ name: "Bob Smith", firstName: "Bob", lastName: "Smith" }` in the database without performing some kind of schema migration - either at the ORM level (`sequelize` migrations, RoR ActiveRecord, etc.), the database itself (`sql-migrate`, `mongo-migrate`, etc.), or in your API endpoint (you'd have to transform any `{ name }` payloads to `{ firstName, lastName }` in order to keep supporting your API). None of those are great solutions, so given that JavaScript has a spread operator (`...`) we only support `PUT` for updating data, giving you the flexibility to change things gracefully, without having to version your entire platform.

#### Folder structure similar to Next.js

API endpoints are defined in an `api/` directory as in: `src/services/{service}/api/{endpoint}.js`. The folder structure is very similar to [Next.js](https://github.com/vercel/next.js/) `pages/api` - so similar that I was able to port [this app](https://github.com/bennyschmidt/reverse/) out of a Next.js API over to [`node-web-framework`](https://github.com/bennyschmidt/node-web-framework) (which uses this library for APIs) in about 20 minutes.

### Usage

Define a new service with an endpoint like this:

In `/example/index.js`:

```javascript
const { http } = require('node-service-library');

// Import your API endpoints
const { hello } = require('./api');

// Bind them to HTTP method handlers (declarative)
module.exports = http({
  GET: {
    hello
  },
  POST: {},
  PUT: {},
  DELETE: {}
});
```

In `/example/api/hello.js`:

```javascript
// Implement the new API response
module.exports = () => ({ 
  message: 'Hello world :)' 
});
```

### Scalability


### Components
