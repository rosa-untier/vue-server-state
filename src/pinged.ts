import { type Ref, ref } from "vue";

type PingOptions = {
  time?: number;
  retries?: number;
  autoStart?: boolean;
};
export function pinged<Data>(
  getter: () => Promise<Data>,
  { time = 1000, retries = 3, autoStart = true }: PingOptions = {},
) {
  const data = ref<Data>();
  const timerId = ref(-1);

  const setter = async () => {
    data.value = await getter();
  };

  const cancel = () => clearInterval(timerId.value);

  const start = () => {
    callInterval(setter, { time, retries }, timerId);
  };

  if (autoStart) {
    start();
  }

  return { data, cancel, start };
}

function callInterval<Data>(
  cb: () => Promise<Data>,
  opts: Pick<Required<PingOptions>, "time" | "retries">,
  timerId: Ref<number>,
) {
  let tried = 0;
  timerId.value = setTimeout(async () => {
    while (tried < opts.retries) {
      try {
        await cb();
        tried = Infinity;
      } catch (_) {
        tried++;
      }
    }
    callInterval(cb, opts, timerId);
  }, opts.time);
}
