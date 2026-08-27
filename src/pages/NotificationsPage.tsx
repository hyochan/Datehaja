import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button, Card, EmptyState, Skeleton, cx } from "../components/ui/primitives";
import { relativeTime } from "../lib/format";
import { useI18n } from "../i18n";

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.list, {});
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight">{t("Notifications")}</h1>
          <p className="mt-1.5 text-[15px] text-soft">
            {t("Everything DateDrop has told you, newest first.")}
          </p>
        </div>
        {notifications && notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={() => void markAllRead({})}>
            {t("Mark all read")}
          </Button>
        )}
      </header>

      {notifications === undefined ? (
        <Skeleton className="h-40 w-full rounded-card" />
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            title={t("Nothing yet")}
            body={t("When a DateDrop lands, is confirmed, or changes, you'll see it here.")}
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-medium">{notification.title}</span>
                  <span className="shrink-0 text-[12.5px] text-muted">
                    {relativeTime(notification._creationTime)}
                  </span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-soft">
                  {notification.body}
                </p>
              </>
            );
            return (
              <li key={notification._id}>
                <Card
                  className={cx(
                    "transition-colors",
                    !notification.read && "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]",
                  )}
                >
                  {notification.href ? (
                    <Link
                      to={notification.href}
                      className="block p-4"
                      onClick={() =>
                        void markRead({
                          notificationId: notification._id as Id<"notifications">,
                        })
                      }
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="p-4">{body}</div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
