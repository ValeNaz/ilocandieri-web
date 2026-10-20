import a from "./home-a";
import b from "./home-b";
import c from "./home-c";
import type { CopyPage } from "./types";

const copy: CopyPage = { ...a, ...b, ...c };

export default copy;
