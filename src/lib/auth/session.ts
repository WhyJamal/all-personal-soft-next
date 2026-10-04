import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

/** Server Components / Actions: `const session = await getSession()` */
export const getSession = () => getServerSession(authOptions);
