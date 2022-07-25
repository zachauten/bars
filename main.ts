#! /usr/bin/env deno run -A

async function main() {
  const cont = new AbortController();
  const signal = cont.signal;
  Deno.addSignalListener("SIGINT", () => {
    cont.abort();
  });

  let bars = new Bars({ signal });
  const foo = {
    name: "foo bar baz bar",
    current: 0,
    total: 500,
  };
  bars.add(foo);
  const zach = {
    name: "zach",
    current: 0,
    total: 1234,
  };
  bars.add(zach);
  const hazel = {
    name: "hazel",
    current: 0,
    total: 100,
  }; 
  bars.add(hazel);

  bars.render();
  let i = 0;
  while(i < 15) {
    zach.current += 150;
    hazel.current += 5;
    await new Promise((res) => setTimeout(res, 1000));
    foo.current += 123;
    zach.current += 300
    await new Promise((res) => setTimeout(res, 1000));
    hazel.current += 10;
    foo.current += 50;
    await new Promise((res) => setTimeout(res, 1000));
    i++;  
  }


}

class Bars {
  pending: Bar[] = [];
  displayed: Bar[] = [];
  signal?: AbortSignal;
  bar_count: number;
  line_width: number;

  constructor(opts?: RenderOptions) {
    this.signal = opts?.signal;
    this.bar_count = opts?.bar_count || 10;
    this.line_width = opts?.bar_count || 50;
  }

  add(bar: Bar) {
    if (this.displayed.length < this.bar_count) {
      this.displayed.push(bar);
    } else {
      this.pending.push(bar);
    }
  }

  async render() {
    out(hide);
		out(save);
    while (!this.signal?.aborted) {
      this.displayed = this.displayed.filter(x => x.current < x.total);
      for (let i = 0; i < this.displayed.length; i++) {
        const title = this.displayed[i].name.slice(0, 10).padEnd(10, ' ');
        const prog = this.displayed[i].current / this.displayed[i].total;
        const line = `${title} [${"=".repeat(prog * this.line_width).padEnd(this.line_width, "-")}] ${prog.toString().slice(0, 4)}%`
        out(line);
				out(eraseline);
        out("\n");
      }
			out(restore);
      // for testing
      await new Promise((res) => setTimeout(res, 1000));  
    }
		out(downline(this.displayed.length));
    out(show);
  }
}

interface Bar {
  current: number,
  name: string,
  total: number,
}

interface RenderOptions {
  signal?: AbortSignal,
  progress?: "percent" | "count",
  bar_count?: number,
  line_width?: number,
}

function is_xterm(): boolean {
  return !!Deno.env.get("TERM")?.startsWith('xterm')
}

const hide = "\x1b[?25l";
const show = "\x1b[?25h";
const eraseline = "\x1b[J"
const save = "\u001B7";
const restore = "\u001B8";
function upline(n: number) {
  return `\x1b[${n}F`;
}
function downline(n: number) {
	return `\x1b[${n}E`;
}
const encoder = new TextEncoder();
function out(msg: string) {
  Deno.writeAllSync(Deno.stdout, encoder.encode(msg));
}

await main();
