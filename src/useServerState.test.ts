// deno-lint-ignore-file require-await
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { nextTick } from "vue";
import { useServerState } from "./useServerState.ts";

describe("patches", () => {
  it("no patches returns the serverData", () => {
    const serverCall = async () => ({ foo: "baz" });
    const initialData = { foo: "bar" };
    const { data, serverData } = useServerState(initialData, serverCall);

    assertEquals(serverData.value, data.value);
  });

  it("applies patch to data", async () => {
    const serverCall = async () => ({ foo: "baz" });
    const initialData = { foo: "bar" };
    const { data, patch } = useServerState(initialData, serverCall);
    patch((data) => data.foo = "new value");

    await nextTick();

    assertEquals(data.value.foo, "new value");
  });

  it("applies multiple patches to data", async () => {
    const serverCall = async () => ({ foo: "baz", fo: "bar" });
    const initialData = { foo: "bar", fo: "baz" };
    const { data, patch } = useServerState(initialData, serverCall);
    patch((data) => data.foo = "new value");
    patch((data) => data.fo = "another value");

    await nextTick();
    assertEquals(data.value.foo, "new value");
    assertEquals(data.value.fo, "another value");
  });

  it("does not apply patch to serverData", async () => {
    const serverCall = async () => ({ foo: "baz" });
    const initialData = { foo: "bar" };
    const { serverData, patch } = useServerState(initialData, serverCall);
    patch((data) => data.foo = "new value");

    await nextTick();
    assertEquals(serverData.value.foo, "bar");
  });

  it("automatically cleans redundant patches", async () => {
    const serverCall = async () => ({ foo: "new value", bar: "vin" });
    const initialData = { foo: "bar", bar: "baz" };
    const { data, patch, patches, update } = useServerState(
      initialData,
      serverCall,
    );
    patch((data) => data.foo = "new value");
    patch((data) => data.bar = "new value");
    await update();

    await nextTick();
    assertEquals(patches.value.length, 1);
    assertEquals(data.value, { foo: "new value", bar: "new value" });
  });

  it("removes all patches", async () => {
    const serverCall = async () => ({ foo: "new value", bar: "vin" });
    const initialData = { foo: "bar", bar: "baz" };
    const { data, patch, reset } = useServerState(
      initialData,
      serverCall,
    );
    patch((data) => data.foo = "new value");
    patch((data) => data.bar = "new value");
    reset();

    await nextTick();
    assertEquals(data.value, { foo: "bar", bar: "baz" });
  });
});
