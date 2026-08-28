import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Button,
  Card,
  Field,
  LinkButton,
  Notice,
  SectionHeading,
  Tag,
  TextInput,
  Toggle,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { useI18n } from "../i18n";

export default function SafetyPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useConvexAuth();
  const safetyProfile = useQuery(
    api.safety.mySafetyProfile,
    isAuthenticated ? {} : "skip",
  );
  const saveSafetyProfile = useMutation(api.safety.saveSafetyProfile);
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [postDateCheckIn, setPostDateCheckIn] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!safetyProfile || loaded) return;
    setContactName(safetyProfile.trustedContactName ?? "");
    setContactEmail(safetyProfile.trustedContactEmail ?? "");
    setContactConsent(safetyProfile.trustedContactConsent);
    setPostDateCheckIn(safetyProfile.postDateCheckIn);
    setLoaded(true);
  }, [loaded, safetyProfile]);

  async function savePrivateSafetyProfile() {
    setSaving(true);
    try {
      await saveSafetyProfile({
        trustedContactName: contactName.trim() || undefined,
        trustedContactEmail: contactEmail.trim() || undefined,
        trustedContactConsent: contactConsent,
        postDateCheckIn,
      });
      toast(t("Private safety settings saved."), "success");
    } catch (error) {
      toast(readableError(error), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <div className="docket-label mb-2 text-[var(--accent-text)]">
          {t("Public record · Safety")}
        </div>
        <h1 className="text-[28px] leading-tight">{t("Safety Center")}</h1>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-soft">
          {t(
            "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.",
          )}
        </p>
      </header>

      <Notice tone="warn" title={t("We are not an emergency service")}>
        {t(
          "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.",
        )}
      </Notice>

      <section>
        <SectionHeading
          eyebrow={t("Optional · private")}
          title={t("Your safety circle")}
        />
        {isAuthenticated ? (
          <Card className="overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-[0.86fr_1.14fr]">
              <div className="border-b border-[var(--border)] bg-[var(--bg-sunken)] p-5 sm:border-b-0 sm:border-r">
                <div className="docket-label text-[var(--accent-text)]">
                  {t("Why we ask")}
                </div>
                <h3 className="mt-3 text-[21px] leading-tight">
                  {t("A real person can know where you are.")}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-soft">
                  {t(
                    "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.",
                  )}
                </p>
                <div className="mt-4 rounded-xl border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] p-3 text-[12.5px] leading-relaxed text-[var(--tint-sage-fg)]">
                  {t(
                    "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.",
                  )}
                </div>
              </div>

              <div className="p-5">
                <Field
                  label={t("Trusted contact name")}
                  optional
                  htmlFor="trusted-name"
                >
                  <TextInput
                    id="trusted-name"
                    value={contactName}
                    maxLength={80}
                    autoComplete="off"
                    onChange={(event) => setContactName(event.target.value)}
                  />
                </Field>
                <Field
                  label={t("Trusted contact email")}
                  optional
                  htmlFor="trusted-email"
                >
                  <TextInput
                    id="trusted-email"
                    type="email"
                    value={contactEmail}
                    autoComplete="off"
                    onChange={(event) => setContactEmail(event.target.value)}
                  />
                </Field>

                {(contactName || contactEmail) && (
                  <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-sunken)] p-3 text-[13px] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={contactConsent}
                      onChange={(event) =>
                        setContactConsent(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ember-400)]"
                    />
                    <span>
                      {t(
                        "They agreed that I can store this email for DateHaja safety plans.",
                      )}
                    </span>
                  </label>
                )}

                <Toggle
                  checked={postDateCheckIn}
                  onChange={setPostDateCheckIn}
                  label={t("Ask me how the date went")}
                  description={t(
                    "A private, optional check-in after the planned end time.",
                  )}
                />

                <Button
                  className="mt-4"
                  loading={saving}
                  onClick={savePrivateSafetyProfile}
                >
                  {t("Save private safety settings")}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-[14.5px] leading-relaxed text-soft">
              {t(
                "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.",
              )}
            </p>
            <div className="mt-4">
              <LinkButton to="/signin?next=/safety" variant="secondary">
                {t("Sign in")}
              </LinkButton>
            </div>
          </Card>
        )}
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Be clear about this")}
          title={t("What we don't verify")}
        />
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag tone="warn">{t("No ID checks")}</Tag>
            <Tag tone="warn">{t("No photo verification")}</Tag>
            <Tag tone="warn">{t("No background checks")}</Tag>
          </div>
          <p className="text-[15px] leading-relaxed">
            {t(
              "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("By design")}
          title={t("What the product does for you")}
        />
        <Card className="divide-y divide-[var(--border)]">
          <Item
            title={t("Public places only")}
            body={t(
              "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.",
            )}
          />
          <Item
            title={t("No contact details exchanged")}
            body={t(
              "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.",
            )}
          />
          <Item
            title={t("Neighbourhood, not address")}
            body={t(
              "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.",
            )}
          />
          <Item
            title={t("You can stop instantly")}
            body={t(
              "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.",
            )}
          />
          <Item
            title={t("Blocking is mutual and permanent")}
            body={t(
              "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.",
            )}
          />
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Before you go")}
          title={t("First-date basics")}
        />
        <Card className="p-5">
          <ul className="space-y-3">
            {[
              t(
                "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.",
              ),
              t(
                "Arrange your own way there and back. Don't accept a lift on a first date.",
              ),
              t(
                "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.",
              ),
              t(
                "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.",
              ),
              t(
                "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.",
              ),
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 text-[15px] leading-relaxed"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("If something happens")}
          title={t("Reporting")}
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            {t(
              "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "You can also reply to any DateHaja Concierge email. It comes to us.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Also")} title={t("Related")} />
        <Card className="divide-y divide-[var(--border)]">
          <LinkRow
            to="/privacy"
            title={t("Privacy")}
            body={t("Exactly what a match can see about you")}
          />
          <LinkRow
            to="/settings"
            title={t("Settings")}
            body={t("Pause matching, manage blocks, control email")}
          />
        </Card>
      </section>
    </div>
  );
}

function Item({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-4">
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mt-1 text-[14px] leading-relaxed text-soft">{body}</p>
    </div>
  );
}

function LinkRow({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="block p-4 transition-colors hover:bg-[var(--bg-sunken)]"
    >
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mt-0.5 text-[13.5px] text-muted">{body}</p>
    </Link>
  );
}
