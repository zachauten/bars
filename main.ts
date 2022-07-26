#! /usr/bin/env deno run -A
import { writeAllSync } from "https://deno.land/std/streams/conversion.ts";

export class Bars {
  displayed: Bar[] = [];
  width: number;

  constructor(opts?: BarOptions) {
    this.width = opts?.width || 50;
  }

  add(name: string, total: number): Bar {
    const bar = new Bar(name, total);
    this.displayed.push(bar);
    return bar;
  }

  render() {
    out(hide);
    this.displayed.forEach(x => {
      const title = x.name.slice(0, 10).padEnd(10, " ");
      const prog = x.current / x.total;
      const line = `${title} [${
        "=".repeat(prog * this.width).padEnd(this.width, "-")
      }] ${(prog * 100).toString().slice(0, 4)}%`;
      out(line);
      out(eraseline);
      out("\n");
    })
    out(save);
    out(upline(this.displayed.length));
    this.displayed = this.displayed.filter(x => x.current < x.total);
  }

  stop() {
    out(eraseline);
    out(restore);
    out(show);
  }
}

class Bar {
  current: number;
  name: string;
  total: number;

  constructor(name: string, total: number) {
    this.current = 0;
    this.name = name;
    this.total = total;
  }

  update(amount: number, _msg?: string) {
    this.current += amount;
    if (this.current > this.total) this.current = this.total;
  }
}

interface BarOptions {
  // TODO: Add display options
  progress?: "percent" | "count";
  width?: number;
}

function _is_xterm(): boolean {
  return !!Deno.env.get("TERM")?.startsWith("xterm");
}

const hide = "\x1b[?25l";
const show = "\x1b[?25h";
const eraseline = "\x1b[J";
const save = "\u001B7";
const restore = "\u001B8";
function upline(n: number) {
  return `\x1b[${n}F`;
}
function _downline(n: number) {
  return `\x1b[${n}E`;
}
const encoder = new TextEncoder();
function out(msg: string) {
  writeAllSync(Deno.stdout, encoder.encode(msg));
}
