import { it } from "@std/testing/bdd";
import { pinged } from "./pinged.ts";
import {
  assertSpyCallArg,
  assertSpyCalls,
  resolvesNext,
  spy,
} from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";

it("can be started manually", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const { stop, start } = pinged(getter, { time: 1, autoStart: false });

  await time.nextAsync();
  assertSpyCalls(getter, 0);

  start();
  await time.nextAsync();
  assertSpyCalls(getter, 1);

  await time.nextAsync();
  assertSpyCalls(getter, 2);

  stop();
  await time.runMicrotasks();
});

it("can be stopped manually", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const { stop } = pinged(getter, { time: 1 });

  await time.nextAsync();
  assertSpyCalls(getter, 1);

  await time.nextAsync();
  assertSpyCalls(getter, 2);

  await time.runMicrotasks();
  stop();

  await time.nextAsync();
  await time.nextAsync();
  await time.nextAsync();
  assertSpyCalls(getter, 2);

  await time.runMicrotasks();
});

it("calls handler everytime time runs out", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const { stop } = pinged(getter, { time: 1 });

  await time.nextAsync();
  assertSpyCalls(getter, 1);

  await time.nextAsync();
  assertSpyCalls(getter, 2);

  await time.nextAsync();
  assertSpyCalls(getter, 3);

  await time.runMicrotasks();
  stop();
});

it("retries promise rejects", async () => {
  const retries = 5;
  using time = new FakeTime();
  const getter = spy(() => Promise.reject());
  const { stop } = pinged(getter, { time: 1, retries });

  await time.nextAsync();
  await time.runMicrotasks();
  assertSpyCalls(getter, retries);

  await time.runMicrotasks();
  stop();
});

it("only calls getter if update is needed", async () => {
  using time = new FakeTime();
  const getter = spy(() => Promise.resolve());
  const needsUpdate = spy(resolvesNext([false, false, true]));
  const { stop } = pinged(getter, {
    time: 1,
    needsUpdate,
  });

  await time.nextAsync();
  assertSpyCalls(getter, 0);
  await time.nextAsync();
  assertSpyCalls(getter, 0);
  await time.nextAsync();
  await time.runMicrotasks();
  assertSpyCalls(getter, 1);

  assertSpyCalls(needsUpdate, 3);

  await time.runMicrotasks();
  stop();
});

it("passes the data to the `needsUpdate` check", async () => {
  using time = new FakeTime();
  const getter = spy(resolvesNext([1, 2, 3, 4]));
  const needsUpdate = spy((_?: number) => Promise.resolve(true));
  const { stop } = pinged(getter, { time: 1, needsUpdate });

  await time.nextAsync();
  await time.nextAsync();
  await time.nextAsync();
  await time.nextAsync();
  await time.nextAsync();

  assertSpyCallArg(needsUpdate, 0, 0, undefined);
  assertSpyCallArg(needsUpdate, 1, 0, 1);
  assertSpyCallArg(needsUpdate, 2, 0, 2);
  assertSpyCallArg(needsUpdate, 3, 0, 3);
  assertSpyCallArg(needsUpdate, 4, 0, 4);
  await time.runMicrotasks();
  stop();
});
