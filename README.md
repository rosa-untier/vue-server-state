# vue-server-state

In most applications the client retrieves data from the server and let's the
user interact with it via UI elements. However it is rarely a good idea to
mutate the data loaded from the server, as partial or optimistic updates can
lead to race conditions and user inputs getting lost.

This library aims to provide tools to solve this problem.

## How it works

Instead of mutating the data we apply patches to the data. Once a patch doe not
change the data, it will automatically be be removed from the patches.

```ts
const { data, addPatch, update } = useServerState({}, myApiCall);

// user changes server data
data.addPatch((draftedData) => draftedData.foo = "bar");

// we transitively call `myApiCall`
update();

// While api call is pending, user changes data again
data.addPatch((draftedData) => draftedData.bar = "baz");
// usually this change can easily get lost due to race conditions, once the first `update` call resolves
// with useServerData, this patch is kept until it is redundant
```

<!-- gen-readme start - generated by https://github.com/jetify-com/devbox/ -->

## Getting Started

This project uses [devbox](https://github.com/jetify-com/devbox) to manage its
development environment.

Install devbox:

```sh
curl -fsSL https://get.jetpack.io/devbox | bash
```

Start the devbox shell:

```sh
devbox shell
```

Run a script in the devbox environment:

```sh
devbox run <script>
```

## Scripts

Scripts are custom commands that can be run using this project's environment.
This project has the following scripts:

- [test](#devbox-run-test)

## Shell Init Hook

The Shell Init Hook is a script that runs whenever the devbox environment is
instantiated. It runs on `devbox shell` and on `devbox run`.

```sh
```

## Packages

- [deno@latest](https://www.nixhub.io/packages/deno)

## Script Details

### devbox run test

```sh
deno test $@
```

&ensp;

<!-- gen-readme end -->
