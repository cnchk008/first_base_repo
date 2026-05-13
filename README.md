# Fully Working Setup

A small dependency-free web app repo that runs locally with Node.js.

## What is included

- Static app in `public/`
- Local web server in `src/server.js`
- Built-in Node tests in `test/`
- Lightweight lint checks in `scripts/lint.js`
- Git ignore rules and editor defaults

## Run it

```sh
node src/server.js
```

Then open `http://localhost:3000`.

Use another port:

```sh
PORT=4000 node src/server.js
```

Use another host:

```sh
HOST=0.0.0.0 node src/server.js
```

## Check it

```sh
node scripts/lint.js
node --test
```

Or run both:

```sh
node scripts/lint.js && node --test
```

## Project Structure

```text
.
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── scripts/
│   └── lint.js
├── src/
│   └── server.js
├── test/
│   └── server.test.js
├── package.json
└── README.md
```
