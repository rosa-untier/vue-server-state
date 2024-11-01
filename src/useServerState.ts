import {
  type MaybeRefOrGetter,
  type Ref,
  ref,
  type ShallowRef,
  shallowRef,
  toValue,
  watchEffect,
} from "vue";
import { create, type Draft } from "mutative";

type Status = "idle" | "pending";
type Patch<T> = (data: Draft<T>) => void;
type ServerData<T> = ShallowRef<T>;
type Data<T> = Ref<T>;
type AddPatch<T> = (patch: Patch<T>) => void;
type RemovePatch<T> = (patch: Patch<T>) => void;

export const useServerState = <
  // deno-lint-ignore no-explicit-any
  TState extends Record<string | number | symbol, any>,
  T extends unknown[],
>(
  initialData: MaybeRefOrGetter<TState>,
  fn: (...args: T) => Promise<TState>,
): {
  serverData: ServerData<TState>;
  data: Data<TState>;
  status: Ref<Status>;
  patches: Ref<Patch<TState>[]>;
  patch: AddPatch<TState>;
  removePatch: RemovePatch<TState>;
  reset: () => void;
  update: (...args: T) => Promise<void>;
} => {
  const serverData = shallowRef<TState>(toValue(initialData));
  const data = ref<TState>(toValue(initialData));

  watchEffect(() => {
    serverData.value = toValue(initialData);
  });

  const status = ref<Status>("idle");

  const update = async (...args: T) => {
    status.value = "pending";
    serverData.value = await fn(...args);
    status.value = "idle";
  };

  const patches = ref([]) as Ref<Patch<TState>[]>;

  const patch = (patch: Patch<TState>) => patches.value.push(patch);
  const removePatch = (patch: Patch<TState>) =>
    patches.value = patches.value.filter((p) => p !== patch);
  const reset = () => patches.value = [];

  watchEffect(() => {
    let d = serverData.value;
    patches.value.forEach((patch) => {
      const patchedData = create<TState>(d, (draft) => {
        patch(draft);
      });
      if (patchedData === d) {
        removePatch(patch);
      }
      d = patchedData;
    });

    data.value = d;
  });

  return {
    data,
    serverData,
    status,
    update,
    patches,
    patch,
    removePatch,
    reset,
  };
};
