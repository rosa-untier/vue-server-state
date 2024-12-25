import { describe, it } from "@std/testing/bdd";
import { Queue } from "./queue.ts";
import { assertEquals } from "@std/assert/equals";
import { assertRejects } from "@std/assert/rejects";

describe("initial context", () => {
  it("object", () => {
    const initialContext = { a: "foo", b: "bar", c: 123, d: { e: true } };
    const queue = new Queue(initialContext);

    assertEquals(queue.context, initialContext);
  });
});

describe("queueing", () => {
  it("add items to the queue", async () => {
    const queue = new Queue(0);

    queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(1);
        }, 200);
      })
    );
    queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(1);
        }, 200);
      })
    );
    const last = queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(1);
        }, 200);
      })
    );

    // only 2 as 1 is processing
    assertEquals(queue.items.length, 2);
    await last;
  });

  it("queued items are awaitable", async () => {
    let mutateMe = 13;
    const queue = new Queue(0);

    queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          mutateMe = 128;
          resolve(1);
        }, 1);
      })
    );
    await queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          mutateMe = 200;
          resolve(2);
        }, 1);
      })
    );
    const last = queue.add((_) =>
      new Promise((resolve) => {
        setTimeout(() => {
          mutateMe = 324;
          resolve(3);
        }, 1);
      })
    );

    assertEquals(mutateMe, 200);
    await last;
  });

  it("passes the update context to subsequent calls", async () => {
    const queue = new Queue(13);

    // deno-lint-ignore require-await
    queue.add(async (n) => {
      assertEquals(n, 13);
      return 37;
    });
    // deno-lint-ignore require-await
    queue.add(async (n) => {
      assertEquals(n, 37);
      return 42;
    });
    // deno-lint-ignore require-await
    queue.add(async (n) => {
      assertEquals(n, 42);
      return 91;
    });
    // deno-lint-ignore require-await
    await queue.add(async (n) => {
      assertEquals(n, 91);
      return 0;
    });
  });
});

it("rejected promises are catchable", () => {
  const queue = new Queue("vin");

  const wrapper = () => queue.add((_) => Promise.reject(""));
  assertRejects(wrapper);
});
