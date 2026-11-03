import type { ReactElement } from "react";
import type { ContentRecord } from "@/content/documents";
import { BulletinForm } from "./BulletinForm";
import { EditorialForm } from "./EditorialForm";
import { SettingsForm } from "./SettingsForm";

/** Keep each family's document type correlated with the envelope kind. */
export function RecordForm({
  record,
  onChange,
  disabled,
  onBusyChange
}: {
  record: ContentRecord;
  onChange: (record: ContentRecord) => void;
  disabled: boolean;
  onBusyChange?: (busy: boolean) => void;
}): ReactElement {
  switch (record.kind) {
    case "bulletin":
      return (
        <BulletinForm
          document={record.draft}
          disabled={disabled}
          onBusyChange={onBusyChange}
          onChange={(draft) => onChange({ ...record, draft })}
        />
      );
    case "settings":
      return (
        <SettingsForm
          document={record.draft}
          onChange={(draft) => onChange({ ...record, draft })}
        />
      );
    case "article":
    case "news":
    case "notice":
    case "event":
      return (
        <EditorialForm
          kind={record.kind}
          document={record.draft}
          onChange={(draft) => onChange({ ...record, draft })}
          disabled={disabled}
          pathLocked={!!record.publishedAt || !!record.published}
        />
      );
  }
}
