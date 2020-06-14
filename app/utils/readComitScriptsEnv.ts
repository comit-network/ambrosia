import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

export default function readComitScriptsEnv() {
  const envConfig = dotenv.parse(
    fs.readFileSync(`${os.homedir()}/.create-comit-app/env`)
  );
  return envConfig;
}
