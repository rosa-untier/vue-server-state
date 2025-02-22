import { it } from "@std/testing/bdd";
import { pinged } from "./pinged.ts";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
it("can be started manually", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const { cancel, start } = pinged(getter, { time: 1, autoStart: false });

  await time.nextAsync();
  assertSpyCalls(getter, 0);

  start();
  await time.nextAsync();
  assertSpyCalls(getter, 1);

  await time.nextAsync();
  assertSpyCalls(getter, 2);

  cancel();
  await time.runMicrotasks();
});

it("calls handler everytime time runs out", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const { cancel } = pinged(getter, { time: 1 });

  await time.nextAsync();
  assertSpyCalls(getter, 1);

  await time.nextAsync();
  assertSpyCalls(getter, 2);

  await time.nextAsync();
  assertSpyCalls(getter, 3);

  cancel();
  await time.runMicrotasks();
});

it("retries promise rejects", async () => {
  const retries = 5;
  using time = new FakeTime();
  const getter = spy(() => Promise.reject());
  const { cancel } = pinged(getter, { time: 1, retries });

  await time.nextAsync();
  await time.runMicrotasks();
  assertSpyCalls(getter, retries);

  cancel();
  await time.runMicrotasks();
});
