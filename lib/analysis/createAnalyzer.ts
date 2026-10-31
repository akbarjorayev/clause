import { FixtureMuseClient } from "@/lib/muse/FixtureMuseClient";
import { HttpMuseClient, type MuseClient } from "@/lib/muse/MuseClient";
import checkAnswer from "@/lib/muse/fixtures/sa-check.json";
import readAnswer from "@/lib/muse/fixtures/sa-reading.json";
import { RulesRepository } from "@/lib/rules/RulesRepository";
import { ContractAnalyzer } from "./ContractAnalyzer";
import { ContractChecker } from "./ContractChecker";
import { DocumentReader } from "./DocumentReader";

interface AnalyzerEnv {
  MUSE_MODE?: string;
  MUSE_API_KEY?: string;
}

// Two saved answers per check, so a fixture check takes about 3 s, like a short real one.
const FIXTURE_DELAY_MS_PER_STEP = 1500;

// MUSE_MODE=fixture replays the saved Saudi answers, so development costs no Muse credits.
function createMuse(env: AnalyzerEnv): MuseClient {
  if (env.MUSE_MODE === "fixture") {
    return new FixtureMuseClient([readAnswer, checkAnswer], FIXTURE_DELAY_MS_PER_STEP);
  }
  if (!env.MUSE_API_KEY) throw new Error("MUSE_API_KEY is not set (or use MUSE_MODE=fixture)");
  return new HttpMuseClient(env.MUSE_API_KEY);
}

export function createAnalyzer(env: AnalyzerEnv): ContractAnalyzer {
  const muse = createMuse(env);
  return new ContractAnalyzer(new DocumentReader(muse), new ContractChecker(muse), new RulesRepository());
}
