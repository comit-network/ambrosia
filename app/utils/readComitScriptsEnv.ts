import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

const ENV_PATH = `${os.homedir()}/.create-comit-app/env`;

// Loads the contents of the `~/.create-comit-app/env` file for the app to use
export default function readComitScriptsEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    return {};
  }
  const envConfig = dotenv.parse(fs.readFileSync(ENV_PATH));
  return envConfig;
}
