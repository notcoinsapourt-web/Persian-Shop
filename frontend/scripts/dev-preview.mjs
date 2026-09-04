import { spawn } from "node:child_process";

const forwarded = process.argv.slice(2);
const args = ["node_modules/next/dist/bin/next", "dev"];

for (let index = 0; index < forwarded.length; index += 1) {
  const value = forwarded[index];
  if (value === "--strictPort") continue;
  if (value === "--host") {
    args.push("--hostname");
    if (forwarded[index + 1]) args.push(forwarded[++index]);
    continue;
  }
  args.push(value);
}

const child = spawn(process.execPath, args, { stdio: "inherit" });
child.on("exit", code => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
