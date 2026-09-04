/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentDates from "../agentDates.js";
import type * as agents from "../agents.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as authProviders from "../authProviders.js";
import type * as authTestOtp from "../authTestOtp.js";
import type * as billing from "../billing.js";
import type * as crons from "../crons.js";
import type * as demo from "../demo.js";
import type * as growth from "../growth.js";
import type * as http from "../http.js";
import type * as integrations_agentmail from "../integrations/agentmail.js";
import type * as integrations_firecrawl from "../integrations/firecrawl.js";
import type * as integrations_openai from "../integrations/openai.js";
import type * as legal from "../legal.js";
import type * as lib_age from "../lib/age.js";
import type * as lib_agentAvatar from "../lib/agentAvatar.js";
import type * as lib_agentDatePacing from "../lib/agentDatePacing.js";
import type * as lib_agentMatchingBoundaries from "../lib/agentMatchingBoundaries.js";
import type * as lib_authEmail from "../lib/authEmail.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_catalog from "../lib/catalog.js";
import type * as lib_emailTemplates from "../lib/emailTemplates.js";
import type * as lib_enums from "../lib/enums.js";
import type * as lib_geo from "../lib/geo.js";
import type * as lib_legal from "../lib/legal.js";
import type * as lib_locales from "../lib/locales.js";
import type * as lib_matchingPreferenceInput from "../lib/matchingPreferenceInput.js";
import type * as lib_privacy from "../lib/privacy.js";
import type * as lib_text from "../lib/text.js";
import type * as lib_time from "../lib/time.js";
import type * as mail from "../mail.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as safety from "../safety.js";
import type * as setup from "../setup.js";
import type * as showcase from "../showcase.js";
import type * as testSupport from "../testSupport.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentDates: typeof agentDates;
  agents: typeof agents;
  ai: typeof ai;
  auth: typeof auth;
  authProviders: typeof authProviders;
  authTestOtp: typeof authTestOtp;
  billing: typeof billing;
  crons: typeof crons;
  demo: typeof demo;
  growth: typeof growth;
  http: typeof http;
  "integrations/agentmail": typeof integrations_agentmail;
  "integrations/firecrawl": typeof integrations_firecrawl;
  "integrations/openai": typeof integrations_openai;
  legal: typeof legal;
  "lib/age": typeof lib_age;
  "lib/agentAvatar": typeof lib_agentAvatar;
  "lib/agentDatePacing": typeof lib_agentDatePacing;
  "lib/agentMatchingBoundaries": typeof lib_agentMatchingBoundaries;
  "lib/authEmail": typeof lib_authEmail;
  "lib/authz": typeof lib_authz;
  "lib/catalog": typeof lib_catalog;
  "lib/emailTemplates": typeof lib_emailTemplates;
  "lib/enums": typeof lib_enums;
  "lib/geo": typeof lib_geo;
  "lib/legal": typeof lib_legal;
  "lib/locales": typeof lib_locales;
  "lib/matchingPreferenceInput": typeof lib_matchingPreferenceInput;
  "lib/privacy": typeof lib_privacy;
  "lib/text": typeof lib_text;
  "lib/time": typeof lib_time;
  mail: typeof mail;
  notifications: typeof notifications;
  profiles: typeof profiles;
  safety: typeof safety;
  setup: typeof setup;
  showcase: typeof showcase;
  testSupport: typeof testSupport;
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
