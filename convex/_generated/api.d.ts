/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as availability from "../availability.js";
import type * as calendar from "../calendar.js";
import type * as crons from "../crons.js";
import type * as dateDrops from "../dateDrops.js";
import type * as demo from "../demo.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as inspect from "../inspect.js";
import type * as integrations_agentmail from "../integrations/agentmail.js";
import type * as integrations_firecrawl from "../integrations/firecrawl.js";
import type * as integrations_openai from "../integrations/openai.js";
import type * as lib_age from "../lib/age.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_calendar from "../lib/calendar.js";
import type * as lib_catalog from "../lib/catalog.js";
import type * as lib_emailTemplates from "../lib/emailTemplates.js";
import type * as lib_enums from "../lib/enums.js";
import type * as lib_fallbackPlan from "../lib/fallbackPlan.js";
import type * as lib_geo from "../lib/geo.js";
import type * as lib_matching from "../lib/matching.js";
import type * as lib_participants from "../lib/participants.js";
import type * as lib_privacy from "../lib/privacy.js";
import type * as lib_stateMachine from "../lib/stateMachine.js";
import type * as lib_text from "../lib/text.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_venueHeuristics from "../lib/venueHeuristics.js";
import type * as mail from "../mail.js";
import type * as matching from "../matching.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as research from "../research.js";
import type * as safety from "../safety.js";
import type * as setup from "../setup.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  availability: typeof availability;
  calendar: typeof calendar;
  crons: typeof crons;
  dateDrops: typeof dateDrops;
  demo: typeof demo;
  feedback: typeof feedback;
  http: typeof http;
  inspect: typeof inspect;
  "integrations/agentmail": typeof integrations_agentmail;
  "integrations/firecrawl": typeof integrations_firecrawl;
  "integrations/openai": typeof integrations_openai;
  "lib/age": typeof lib_age;
  "lib/authz": typeof lib_authz;
  "lib/calendar": typeof lib_calendar;
  "lib/catalog": typeof lib_catalog;
  "lib/emailTemplates": typeof lib_emailTemplates;
  "lib/enums": typeof lib_enums;
  "lib/fallbackPlan": typeof lib_fallbackPlan;
  "lib/geo": typeof lib_geo;
  "lib/matching": typeof lib_matching;
  "lib/participants": typeof lib_participants;
  "lib/privacy": typeof lib_privacy;
  "lib/stateMachine": typeof lib_stateMachine;
  "lib/text": typeof lib_text;
  "lib/time": typeof lib_time;
  "lib/venueHeuristics": typeof lib_venueHeuristics;
  mail: typeof mail;
  matching: typeof matching;
  messages: typeof messages;
  notifications: typeof notifications;
  profiles: typeof profiles;
  research: typeof research;
  safety: typeof safety;
  setup: typeof setup;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
