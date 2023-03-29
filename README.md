## Node Service Library

Modular HTTP/WS service wrappers for Node. 

### Why not just use Express?

Your Node.js backend could be a simple `server.js` with a bunch of handlers down the file.

But at scale, you often need to split out backend functionality to separate services, or even individual functions, in order to scale each part efficiently.

[`node-service-library`](https://github.com/bennyschmidt/node-service-library) gives you a common interface for building such services. 

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

### Components

`HTTP`: An HTTP service.
  - `{ GET, POST, PUT, DELETE }` declarative configuration
  - Lifecycle methods:
    - `onHttpGet` 
    - `onHttpPost`
    - `onHttpPut`
    - `onHttpDelete`
    - `onHttpSearch // SEARCH is a GET with a query`
    
`WS`: A WS service.
  - `{ REQUEST, LIFECYCLE }` declarative configuration
  - Lifecycle methods:
    - `onWsReady` 
    - `onWsConnect`
    - `onWsDisconnect`
    - `onWsRequest`

#### Folder structure similar to Next.js

API endpoints are defined in an `api/` directory as in: `src/services/{service}/api/{endpoint}.js`. The folder structure is very similar to [Next.js](https://github.com/vercel/next.js/) `pages/api`.

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

The functions within `api/` are exposed as API endpoints, and lifecycle methods are bound for each HTTP method. You could now call `await onHttpGet(req, res)` in the backend as some event-driven lifecycle method, or from a client you could `await fetch("/hello")` and receive identical responses.

#### REST APIs

API design closely follows REST (with `GET`, `POST`, `PUT`, & `DELETE` methods).

#### Where are the other HTTP methods?

Not all methods are supported:

- `HEAD`: `HEAD` requests will very likely be supported in the future for various reasons, but it isn't a high priority yet.

- `CONNECT`: For security and other reasons, and because two-way communication is already accomplished via the `WS` (WebSocket) component, there is currently no plan to support `CONNECT` requests or HTTP tunneling.

- `OPTIONS`: Currently not supported, but will likely be implemented in [`node-service-core`](https://github.com/bennyschmidt/node-service-core) to provide clients with information about what requests are allowed.

- `TRACE`: `TRACE` requests were designed for diagnostics and debugging. It's not supported because they can be exploited to carry out DDoS attacks like the "HTTP TRACE Flood" attack, where:

> An HTTP TRACE Flood consists of TRACE requests. Unlike other HTTP floods that may include other request methods such as POST, PUT, GET, etc.
>
> When the server’s limits of concurrent connections are reached, the server can no longer respond to legitimate requests from other clients attempting to TRACE, causing a denial of service.
>
> HTTP TRACE flood attacks use standard URL requests, hence it may be quite challenging to differentiate from valid traffic. Traditional rate-based volumetric detection is ineffective in detecting HTTP TRACE flood attacks since traffic volume in HTTP TRACE floods is often under detection thresholds.
>
> https://kb.mazebolt.com/knowledgebase/http-trace-flood

- `PATCH`: `PATCH` requests are not supported (while `PUT` is) for data integrity reasons. In today's world, with JSON being the primary format, the rise of GraphQL APIs & NoSQL databases, and similarly structured blockchains, it's not possible to manage complex database re-structuring without something like a schema migration: 

Take the following data `{ name: "Bob Smith" }`. Imagine a sudden requirement to change it to `{ firstName: "Bob", lastName: "Smith" }`. Migrating this change with an API that supports `PATCH` would result in `{ name: "Bob Smith", firstName: "Bob", lastName: "Smith" }` in the database without performing some kind of schema migration - either at the ORM level (`sequelize` migrations, RoR ActiveRecord, etc.), the database itself (`sql-migrate`, `mongo-migrate`, etc.), or in your API endpoint (you'd have to transform any `{ name }` payloads to `{ firstName, lastName }` in order to keep supporting your API). None of those are great solutions, so given that JavaScript has a spread operator (`...`) we only support `PUT` for updating data, giving you the flexibility to change things gracefully, without having to version your entire platform when you do.
    
### Scalability

When a service gets too busy, large, or concerned with different things, it might be time to split it into multiple services. You can use [node-service-core](https://github.com/bennyschmidt/node-service-core) to manage multiple HTTP and WS services (see [README.md](https://github.com/bennyschmidt/node-service-core/blob/master/README.md) for instructions). Think of `node-service-core` as the grown-up version of the "`server.js`" mentioned above, operating as the lightweight core of the overall backend application - rather than as a server monolith - orchestrating the different `HTTP` and `WS` components (which can each be scale "out", infinitely).

In most cases, you will only need 1 instance of `node-service-core`, acting as an API gateway, load balancer, and orchestrator of child services, scaling "up" only as needed using your favorite cloud platform like EC2 (AWS), or Google Compute Engine (GCP); or even hosting on-prem on a physical server. 

But if you expect Twitter-level traffic from all over the world, you can also scale "out" the core instance and run them in evenly geolocated data centers, sharing data between cores via an extremely fast (~4k reads/writes per second on a Macbook!) JSON persistence service [DSS](https://github.com/exactchange/dss) which shares a common interface with your other services, as it is also [built with `node-service-library`](https://github.com/exactchange/dss/blob/main/index.js).
