import "@betro/lib/dist/setupNodePollyfill";
import { runTests } from "./testFunction";

describe("User functions", () => {
  const port = process.env.PORT || "4000";
  describe("Run api test", () => runTests(port));
});
