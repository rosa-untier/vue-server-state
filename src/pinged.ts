import { type Ref, ref } from "vue";

export type PingOptions<Data> = {
  time?: number;
  retries?: number;
  autoStart?: boolean;
  needsUpdate?: (data?: Data) => Promise<boolean>;
};

export function pinged<Data>(
  getter: () => Promise<Data>,
  {
    time = 1000,
    retries = 3,
    autoStart = true,
    needsUpdate = (_?: Data) => Promise.resolve(true),
  }: PingOptions<Data> = {},
) {
  const data = ref<Data>();
  const timerId = ref(-1);

  const setter = async () => {
    data.value = await getter();
  };

  const stop = () => clearTimeout(timerId.value);

  const start = () => {
    callInterval(setter, timerId, {
      time,
      retries,
      needsUpdate: () => needsUpdate(data.value),
    });
  };

  if (autoStart) {
    start();
  }

  return { data, stop, start };
}

function callInterval<Data>(
  cb: () => Promise<Data>,
  timerId: Ref<number>,
  opts: Pick<Required<PingOptions<Data>>, "time" | "retries" | "needsUpdate">,
) {
  let tried = 0;
  timerId.value = setTimeout(async () => {
    while (tried < opts.retries) {
      try {
        if (await opts.needsUpdate()) {
          await cb();
        }
        tried = Infinity;
      } catch (_) {
        tried++;
      }
    }
    callInterval(cb, timerId, opts);
  }, opts.time);
}
