import { createHash } from "node:crypto";
import type {
  BulletinDocument,
  ContentRecord,
  EditorialDocument,
  RichTextDocument,
  RichTextNode,
  SettingsDocument,
  SourceProvenance
} from "../../src/content/documents";
import type {
  CalendarDate,
  ContentBlock,
  Mass,
  MediaAsset,
  ScheduleDay
} from "../../src/content/types";
import { addDays, getLocalDate, getMonday } from "../../src/lib/calendar";
import { migrationExcerpt } from "./excerpt";
import {
  documentToBlocks,
  imageNode,
  markdownToDocument,
  nodeText,
  safeContentUrl
} from "../../src/lib/legacy-rich-text";
import type {
  DumpSource,
  MigratedMedia,
  MigratedStaticPage,
  MigrationReport,
  MigrationResult,
  SourceRow
} from "./types";

const EPOCH = "1970-01-01T00:00:00.000Z";
const DAY_FIELDS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];
const POSTER_POST_IDS = new Set(["165", "166", "163", "131"]);
const DONATION_CATEGORIES: Record<string, string> = {
  funerals: "Z pohrebu",
  weddings: "Zo svadby",
  baptism: "Z krstu",
  charity: "Na charitu",
  urnBurials: "Z kladenia urny",
  other: "Iné"
};
const HASH = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const clean = (value: string | null | undefined) => value?.trim() ?? "";
const numericOrder = (row: SourceRow) => Number(row.order) || 0;
const asJson = (value: string | null | undefined): unknown => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

function timestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  // PostgreSQL timestamp without zone was exported by the legacy UTC backend.
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const result = new Date(
    /[zZ]|[+-]\d\d(?::?\d\d)?$/.test(normalized) ? normalized : `${normalized}Z`
  );
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

function provenance(
  kind: string,
  row: SourceRow,
  payload: unknown,
  anomalies: string[] = []
): SourceProvenance {
  return {
    kind,
    id: row.id!,
    hash: HASH({ row, payload }),
    importedVersion: 1,
    publishedAt: timestamp(row.published_at),
    createdAt: timestamp(row.created_at),
    updatedAt: timestamp(row.updated_at),
    ...(anomalies.length ? { anomalies } : {})
  };
}

function dateOnly(value: string | null | undefined): CalendarDate | null {
  const part = value?.slice(0, 10);
  if (!part || !/^\d{4}-\d{2}-\d{2}$/.test(part)) return null;
  try {
    addDays(part as CalendarDate, 0);
    return part as CalendarDate;
  } catch {
    return null;
  }
}

function publicDate(row: SourceRow): CalendarDate {
  const date =
    timestamp(row.published_at) ?? timestamp(row.created_at) ?? EPOCH;
  return getLocalDate(new Date(date));
}

function normalized(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
function similarity(a: string, b: string): number {
  const wordsA = new Set(normalized(a).split(" ").filter(Boolean));
  const wordsB = new Set(normalized(b).split(" ").filter(Boolean));
  const intersection = [...wordsA].filter((word) => wordsB.has(word)).length;
  return (2 * intersection) / Math.max(1, wordsA.size + wordsB.size);
}

export function buildMigration(source: DumpSource): MigrationResult {
  const rows = (table: string) => source.tables[table] ?? [];
  const indexes = new Map<string, Map<string, SourceRow>>();
  const find = (
    table: string,
    id: string | null | undefined
  ): SourceRow | undefined => {
    if (!id) return undefined;
    if (!indexes.has(table))
      indexes.set(table, new Map(rows(table).map((row) => [row.id!, row])));
    return indexes.get(table)!.get(id);
  };
  const report: MigrationReport = {
    schemaVersion: 1,
    sourceCounts: Object.fromEntries(
      [
        "articles",
        "posts",
        "announcements",
        "events",
        "weekly_announcements",
        "admin_pages",
        "pages",
        "upload_file",
        "upload_file_morph"
      ].map((table) => [table, rows(table).length])
    ),
    records: {},
    media: {
      total: 0,
      images: 0,
      other: 0,
      relationCount: rows("upload_file_morph").length,
      invalidUrls: 0,
      unreferenced: 0
    },
    staticPages: { total: 0, published: 0, mappedRoutes: 0 },
    bodyReconciliations: [],
    anomalies: [],
    sectionTypes: {},
    unresolvedComponents: [],
    crossKindSlugCollisions: 0,
    settings: { imported: false, recurringScheduleConfirmed: false },
    donationProjection: {
      droppedEmptyContainers: 0,
      categorizedEntries: 0,
      uncategorizedEntries: 0
    }
  };
  const relations = rows("upload_file_morph");
  const media: MigratedMedia[] = rows("upload_file").map((row) => {
    const providerMetadata = asJson(row.provider_metadata);
    const publicId =
      providerMetadata &&
      typeof providerMetadata === "object" &&
      "public_id" in providerMetadata
        ? String(providerMetadata.public_id)
        : null;
    return {
      id: `legacy-media-${row.id}`,
      sourceId: row.id!,
      publicId,
      url: row.url ?? "",
      mime: row.mime ?? "application/octet-stream",
      width: Number(row.width) || null,
      height: Number(row.height) || null,
      alt: clean(row.alternativeText),
      caption: clean(row.caption),
      sourceHash: HASH(row),
      metadata: {
        name: clean(row.name),
        originalHash: clean(row.hash),
        extension: clean(row.ext),
        sizeKilobytes: Number(row.size) || null,
        formats: asJson(row.formats),
        provider: clean(row.provider),
        providerMetadata,
        references: relations
          .filter((relation) => relation.upload_file_id === row.id)
          .map((relation) => ({
            type: relation.related_type!,
            id: relation.related_id!,
            field: relation.field!,
            order: numericOrder(relation)
          }))
      }
    };
  });
  const mediaById = new Map(media.map((entry) => [entry.sourceId, entry]));
  const mediaByUrl = new Map(media.map((entry) => [entry.url, entry]));
  const asset = (entry: MigratedMedia, fallback: string): MediaAsset | null =>
    entry.mime.startsWith("image/") &&
    /^(?:https:\/\/|\/(?!\/))/.test(entry.url)
      ? {
          src: entry.url,
          width: entry.width ?? 1200,
          height: entry.height ?? 800,
          alt: entry.alt || fallback,
          ...(entry.caption ? { caption: entry.caption } : {})
        }
      : null;
  const mediaFor = (
    type: string,
    id: string,
    field?: string,
    fallback = ""
  ): MediaAsset[] =>
    relations
      .filter(
        (relation) =>
          relation.related_type === type &&
          relation.related_id === id &&
          (!field || relation.field === field)
      )
      .sort(
        (a, b) =>
          numericOrder(a) - numericOrder(b) || Number(a.id) - Number(b.id)
      )
      .flatMap((relation) => {
        const entry = mediaById.get(relation.upload_file_id!);
        const image = entry && asset(entry, fallback);
        return image ? [image] : [];
      });
  const componentLinks = (table: string, ownerColumn: string, id: string) =>
    rows(table)
      .filter((link) => link[ownerColumn] === id)
      .sort(
        (a, b) =>
          numericOrder(a) - numericOrder(b) || Number(a.id) - Number(b.id)
      );
  const unresolved = new Set<string>();
  const parseMarkdown = (
    value: string | null | undefined
  ): RichTextDocument => {
    const document = markdownToDocument(value);
    const hydrate = (node: RichTextNode): RichTextNode => {
      if (node.type === "image") {
        const stored = mediaByUrl.get(String(node.attrs?.src));
        const image = stored && asset(stored, String(node.attrs?.alt ?? ""));
        if (image)
          return imageNode({
            ...image,
            alt: String(node.attrs?.alt || image.alt),
            ...(node.attrs?.title ? { caption: String(node.attrs.title) } : {})
          });
      }
      return {
        ...node,
        ...(node.content ? { content: node.content.map(hydrate) } : {})
      };
    };
    return { type: "doc", content: document.content.map(hydrate) };
  };

  function component(
    type: string,
    id: string,
    visited = new Set<string>()
  ): RichTextNode[] {
    const key = `${type}:${id}`;
    if (visited.has(key)) throw new Error(`Cyclic legacy component ${key}`);
    const row = find(type, id);
    if (!row) {
      unresolved.add(key);
      return [];
    }
    report.sectionTypes[type] = (report.sectionTypes[type] ?? 0) + 1;
    const nextVisited = new Set([...visited, key]);
    const nested = rows(`${type}_components`).filter((link) =>
      Object.entries(link).some(
        ([column, value]) =>
          !["id", "component_id"].includes(column) &&
          column.endsWith("_id") &&
          value === id
      )
    );
    nested.sort(
      (a, b) =>
        Number(b.field === "heading") - Number(a.field === "heading") ||
        numericOrder(a) - numericOrder(b) ||
        Number(a.id) - Number(b.id)
    );
    const nodes: RichTextNode[] = [];
    if (clean(row.title))
      nodes.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: clean(row.title) }]
      });
    if (clean(row.superscript))
      nodes.push(...parseMarkdown(row.superscript).content);
    for (const field of ["content", "description", "info", "quote"])
      if (clean(row[field])) {
        const content = parseMarkdown(row[field]).content;
        nodes.push(
          ...(field === "quote" ? [{ type: "blockquote", content }] : content)
        );
      }
    if (type === "components_sections_quotation_sections" && clean(row.author))
      nodes.push({
        type: "paragraph",
        content: [{ type: "text", text: `— ${clean(row.author)}` }]
      });
    const headings = nested.filter((link) => link.field === "heading");
    const other = nested.filter((link) => link.field !== "heading");
    for (const link of headings)
      nodes.push(
        ...component(link.component_type!, link.component_id!, nextVisited)
      );
    const images = mediaFor(type, id, undefined, clean(row.title));
    if (images.length && type === "components_sections_galleries")
      nodes.push({ type: "imageGallery", attrs: { images } });
    else nodes.push(...images.map(imageNode));
    for (const link of other)
      nodes.push(
        ...component(link.component_type!, link.component_id!, nextVisited)
      );
    const href = safeContentUrl(clean(row.link) || clean(row.url));
    if (href)
      nodes.push({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: clean(row.text) || clean(row.title) || href,
            marks: [{ type: "link", attrs: { href } }]
          }
        ]
      });
    // Some iframe wrappers also retained the URL directly in a legacy links field.
    if (clean(row.links))
      for (const url of clean(row.links).match(/https?:\/\/[^\s"'<>]+/g) ??
        []) {
        const safe = safeContentUrl(url);
        if (safe)
          nodes.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Otvoriť externý obsah",
                marks: [{ type: "link", attrs: { href: safe } }]
              }
            ]
          });
      }
    return nodes;
  }

  function project(document: RichTextDocument): ContentBlock[] {
    return document.content.flatMap((node) =>
      node.type === "imageGallery"
        ? [
            {
              type: "gallery",
              images: (node.attrs?.images as MediaAsset[]) ?? []
            } as ContentBlock
          ]
        : documentToBlocks({ type: "doc", content: [node] })
    );
  }

  const records: ContentRecord[] = [];
  function addEditorial(
    table: string,
    kind: "article" | "news" | "notice" | "event"
  ) {
    for (const row of rows(table)) {
      const anomalies: string[] = [];
      const title = clean(row.title) || clean(row.name);
      const slug =
        clean(row.slug) || (kind === "event" ? `podujatie-${row.id}` : "");
      if (!title) anomalies.push("missing-title");
      if (!slug) anomalies.push("missing-slug");
      const content: RichTextNode[] = [];
      const sectionLinks =
        kind === "article"
          ? componentLinks("articles_components", "article_id", row.id!)
          : [];
      for (const link of sectionLinks)
        content.push(...component(link.component_type!, link.component_id!));
      const flat = parseMarkdown(row.content);
      if (!sectionLinks.length) content.push(...flat.content);
      else if (clean(row.content)) {
        const sectionText = content.map(nodeText).join("\n\n");
        const flatText = flat.content.map(nodeText).join("\n\n");
        let appendedParagraphs = 0;
        let appendedImages = 0;
        const existingImages = new Set(
          content.flatMap((node) =>
            node.type === "image"
              ? [String(node.attrs?.src)]
              : node.type === "imageGallery"
              ? ((node.attrs?.images as MediaAsset[]) ?? []).map(
                  (image) => image.src
                )
              : []
          )
        );
        for (const image of flat.content.filter(
          (node) => node.type === "image"
        ))
          if (!existingImages.has(String(image.attrs?.src))) {
            content.push(image);
            existingImages.add(String(image.attrs?.src));
            appendedImages += 1;
          }
        if (normalized(flatText) !== normalized(sectionText)) {
          for (const candidate of flat.content) {
            const text = nodeText(candidate);
            if (!normalized(text)) continue;
            const represented = content.some(
              (node) =>
                normalized(nodeText(node)).includes(normalized(text)) ||
                similarity(nodeText(node), text) >= 0.9
            );
            if (!represented) {
              content.push(candidate);
              appendedParagraphs += 1;
            }
          }
        }
        report.bodyReconciliations.push({
          sourceId: row.id!,
          choice:
            appendedParagraphs || appendedImages
              ? "ordered-sections-plus-unique-flat-elements"
              : "ordered-sections-with-flat-duplicate-suppressed",
          appendedParagraphs,
          appendedImages,
          flatCharacters: clean(row.content).length,
          sectionCharacters: sectionText.length
        });
      } else if (["2", "3", "4", "5"].includes(row.id!))
        report.bodyReconciliations.push({
          sourceId: row.id!,
          choice: "ordered-sections-empty-flat",
          appendedParagraphs: 0,
          appendedImages: 0,
          flatCharacters: 0,
          sectionCharacters: content.map(nodeText).join("\n\n").length
        });
      if (kind === "event") {
        if (clean(row.description))
          content.push(...parseMarkdown(row.description).content);
        for (const [field, label] of [
          ["dateFrom", "Začiatok"],
          ["dateTo", "Koniec"],
          ["place", "Miesto"]
        ])
          if (clean(row[field]))
            content.push({
              type: "paragraph",
              content: [
                { type: "text", text: `${label}: ${clean(row[field])}` }
              ]
            });
        const link = safeContentUrl(clean(row.link));
        if (link)
          content.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Informácie o podujatí",
                marks: [{ type: "link", attrs: { href: link } }]
              }
            ]
          });
      }
      const galleries = mediaFor(table, row.id!, "gallery", title);
      if (galleries.length)
        content.push({ type: "imageGallery", attrs: { images: galleries } });
      const body: RichTextDocument = { type: "doc", content };
      const cover = mediaFor(
        table,
        row.id!,
        kind === "event" ? "poster" : "image",
        title
      )[0];
      const author = find("writers", row.author)?.name;
      const poster =
        kind === "news"
          ? POSTER_POST_IDS.has(row.id!)
          : kind === "event" && !!cover;
      const destination =
        kind === "news" && slug === "den-farskej-rodiny"
          ? "/den-farskej-rodiny"
          : kind === "event"
          ? safeContentUrl(clean(row.link)) ?? undefined
          : undefined;
      const document: EditorialDocument = {
        id: `legacy-${kind}-${row.id}`,
        slug,
        title,
        excerpt: migrationExcerpt(row.description, body),
        date: publicDate(row),
        ...(author ? { author } : {}),
        ...(cover ? { cover } : {}),
        blocks: project(body),
        body,
        isPoster: poster,
        showInNews: kind === "news",
        ...(destination ? { posterDestination: destination } : {})
      };
      const originallyPublished = !!row.published_at;
      const published = kind === "article" || originallyPublished;
      const sourceMetadata = provenance(
        table,
        row,
        { document, components: sectionLinks },
        anomalies
      );
      const record: ContentRecord = {
        id: document.id,
        kind,
        title,
        slug: slug || null,
        draft: document,
        published: published ? structuredClone(document) : null,
        version: 1,
        createdAt: timestamp(row.created_at),
        publishedAt: published
          ? timestamp(row.published_at) ?? timestamp(row.created_at) ?? EPOCH
          : null,
        updatedAt:
          timestamp(row.updated_at) ?? timestamp(row.created_at) ?? EPOCH,
        source: sourceMetadata,
        readOnly: false
      };
      records.push(record);
      if (anomalies.length)
        report.anomalies.push({ kind, sourceId: row.id!, codes: anomalies });
    }
  }
  addEditorial("articles", "article");
  addEditorial("posts", "news");
  addEditorial("announcements", "notice");
  addEditorial("events", "event");

  for (const row of rows("weekly_announcements")) {
    const anomalies: string[] = [];
    const links = componentLinks(
      "weekly_announcements_components",
      "weekly_announcement_id",
      row.id!
    );
    const days: ScheduleDay[] = [];
    for (const [offset, field] of DAY_FIELDS.entries()) {
      const link = links.find((item) => item.field === field);
      const day =
        link && find("components_annoucnements_days", link.component_id);
      const date = dateOnly(day?.date);
      if (!day || !date) {
        anomalies.push(`missing-or-invalid-${field}`);
        continue;
      }
      const masses: Mass[] = componentLinks(
        "components_annoucnements_days_components",
        "components_annoucnements_day_id",
        day.id!
      ).flatMap((massLink) => {
        const mass = find(
          "components_annoucnements_masses",
          massLink.component_id
        );
        if (!mass) {
          anomalies.push(`missing-mass-${massLink.component_id}`);
          return [];
        }
        const time = clean(mass.time).slice(0, 5);
        const priest = find("priests", mass.priest);
        const name = priest
          ? [priest.title, priest.name, priest.surname]
              .filter(Boolean)
              .join(" ")
          : "";
        const celebrant = [name, clean(mass.otherPriests)]
          .filter(Boolean)
          .join(", ");
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
          anomalies.push(`invalid-mass-time-${mass.id}`);
        const label = clean(mass.label);
        const location = /^(?:lieskovec|zolná|nemocnica|charita)(?:\s|$)/i.test(
          label
        )
          ? label
          : undefined;
        return [
          {
            time,
            ...(clean(mass.intention)
              ? { intention: clean(mass.intention) }
              : {}),
            ...(celebrant ? { celebrant } : {}),
            ...(label ? { label } : {}),
            ...(location ? { location } : {})
          }
        ];
      });
      days.push({
        date,
        ...(clean(day.liturgy) ? { liturgy: clean(day.liturgy) } : {}),
        masses,
        status: masses.length ? "scheduled" : "no-masses"
      });
      if (offset === 0 && getMonday(date) !== date)
        anomalies.push("week-start-not-monday");
    }
    const weekStart = days[0]?.date ?? getMonday(publicDate(row));
    days.forEach((day, offset) => {
      if (day.date !== addDays(weekStart, offset))
        anomalies.push(`inconsistent-${DAY_FIELDS[offset]}-date`);
    });
    const announcements = links
      .filter((link) => link.field === "announcements")
      .map((link) =>
        clean(
          find("components_annoucnements_announcements", link.component_id)
            ?.text
        )
      )
      .filter(Boolean);
    const donations = links
      .filter((link) => link.field === "donations")
      .flatMap((link) => {
        const donation = find(
          "components_annoucnements_donations",
          link.component_id
        );
        if (!donation) return [];
        const result: NonNullable<BulletinDocument["donations"]> = [];
        if (clean(donation.name) || clean(donation.amount)) {
          result.push({
            label: clean(donation.name),
            ...(clean(donation.amount)
              ? { amount: clean(donation.amount) }
              : {})
          });
          report.donationProjection.uncategorizedEntries += 1;
        } else report.donationProjection.droppedEmptyContainers += 1;
        const children = componentLinks(
          "components_annoucnements_donations_components",
          "components_annoucnements_donation_id",
          donation.id!
        );
        const categoryOrder = Object.keys(DONATION_CATEGORIES);
        children.sort((a, b) => {
          const orderA = categoryOrder.indexOf(a.field!);
          const orderB = categoryOrder.indexOf(b.field!);
          return (
            (orderA < 0 ? categoryOrder.length : orderA) -
              (orderB < 0 ? categoryOrder.length : orderB) ||
            numericOrder(a) - numericOrder(b) ||
            Number(a.id) - Number(b.id)
          );
        });
        for (const child of children) {
          const single = find(
            "components_annoucnements_single_donations",
            child.component_id
          );
          if (single) {
            result.push({
              label: clean(single.name),
              ...(clean(single.amount) ? { amount: clean(single.amount) } : {}),
              ...(clean(child.field)
                ? {
                    category:
                      DONATION_CATEGORIES[child.field!] ?? clean(child.field)
                  }
                : {})
            });
            report.donationProjection.categorizedEntries += 1;
          }
        }
        return result;
      });
    const document: BulletinDocument = {
      id: `legacy-bulletin-${row.id}`,
      weekStart,
      days,
      announcements,
      donations
    };
    const title = `Farské oznamy ${weekStart}`;
    records.push({
      id: document.id,
      kind: "bulletin",
      title,
      slug: null,
      draft: document,
      published: row.published_at ? structuredClone(document) : null,
      version: 1,
      createdAt: timestamp(row.created_at),
      publishedAt: timestamp(row.published_at),
      updatedAt:
        timestamp(row.updated_at) ?? timestamp(row.created_at) ?? EPOCH,
      source: provenance(
        "weekly_announcements",
        row,
        { document, links },
        anomalies
      ),
      readOnly: false
    });
  }
  const bulletinWeeks = new Map<string, ContentRecord[]>();
  for (const record of records.filter((record) => record.kind === "bulletin")) {
    const week = (record.draft as BulletinDocument).weekStart;
    bulletinWeeks.set(week, [...(bulletinWeeks.get(week) ?? []), record]);
  }
  for (const sameWeek of bulletinWeeks.values()) {
    const duplicates = sameWeek.filter((record) => record.published);
    if (duplicates.length > 1)
      for (const record of duplicates) {
        record.source!.anomalies = [
          ...(record.source!.anomalies ?? []),
          "duplicate-week"
        ];
      }
  }
  for (const record of records.filter((record) => record.kind === "bulletin")) {
    record.readOnly = !!record.source?.anomalies?.length;
    if (record.readOnly)
      report.anomalies.push({
        kind: "bulletin",
        sourceId: record.source!.id,
        codes: record.source!.anomalies!
      });
  }

  const staticPages: MigratedStaticPage[] = [];
  for (const [table, kind, owner] of [
    ["admin_pages", "admin-page", "admin_page_id"],
    ["pages", "page", "page_id"]
  ] as const)
    for (const row of rows(table)) {
      const links = componentLinks(`${table}_components`, owner, row.id!);
      const sections = links.map((link) => {
        const body: RichTextDocument = {
          type: "doc",
          content: component(link.component_type!, link.component_id!)
        };
        return {
          id: link.component_id!,
          type: link.component_type!,
          order: numericOrder(link),
          body,
          blocks: project(body)
        };
      });
      const body: RichTextDocument = {
        type: "doc",
        content: [
          ...parseMarkdown(row.content).content,
          ...sections.flatMap((section) => section.body.content)
        ]
      };
      const slug = clean(row.slug);
      const route = staticRoute(slug, kind);
      const cover = mediaFor(table, row.id!, "image", clean(row.title))[0];
      staticPages.push({
        id: `legacy-${kind}-${row.id}`,
        kind,
        sourceId: row.id!,
        title: clean(row.title),
        slug,
        route,
        description: clean(row.description),
        body,
        blocks: project(body),
        ...(cover ? { cover } : {}),
        publishedAt: timestamp(row.published_at),
        source: provenance(table, row, { body, sections, cover }),
        sections
      });
    }

  const contact = rows("contacts").find((row) => row.published_at);
  if (contact) {
    const links = componentLinks(
      "contacts_components",
      "contact_id",
      contact.id!
    );
    const detailsLink = links.find((link) => link.field === "contactDetails");
    const details =
      detailsLink &&
      find(detailsLink.component_type!, detailsLink.component_id);
    const officeLink = links.find((link) => link.field === "officeHours");
    const preparationLink = links.find(
      (link) => link.field === "SacramentPreparationMettings"
    );
    const officeHours = officeLink
      ? componentLinks(
          "components_contact_office_hours_components",
          "components_contact_office_hour_id",
          officeLink.component_id!
        ).flatMap((link) => {
          const day = find(link.component_type!, link.component_id);
          return day
            ? [{ day: clean(day.day), time: clean(day.openTime) }]
            : [];
        })
      : [];
    const preparationMeetings = preparationLink
      ? componentLinks(
          "components_contact_sacrament_preparation_mettings_components",
          "components_contact_sacrament_preparation_metting_id",
          preparationLink.component_id!
        ).flatMap((link) => {
          const meeting = find(link.component_type!, link.component_id);
          return meeting
            ? [{ name: clean(meeting.name), time: clean(meeting.time) }]
            : [];
        })
      : [];
    const preparationNote =
      preparationLink &&
      clean(
        find(preparationLink.component_type!, preparationLink.component_id)
          ?.infoNote
      );
    const officeNote =
      officeLink &&
      clean(
        find(officeLink.component_type!, officeLink.component_id)?.infoNote
      );
    const contactNote = clean(details?.infoNote);
    const mobile = clean(details?.mobil);
    const ico = clean(details?.ico);
    const mapLink = safeContentUrl(clean(details?.googleMapLink));
    const priests = rows("priests")
      .filter((priest) => priest.published_at)
      .map((priest) => ({
        name: [priest.title, priest.name, priest.surname]
          .filter(Boolean)
          .join(" "),
        role: clean(priest.role),
        ...(clean(priest.phone) ? { phone: clean(priest.phone) } : {}),
        ...(clean(priest.email) ? { email: clean(priest.email) } : {}),
        ...(mediaFor("priests", priest.id!, "photo")[0]
          ? { image: mediaFor("priests", priest.id!, "photo")[0] }
          : {})
      }));
    const settings: SettingsDocument = {
      name: "Farnosť sv. Alžbety",
      shortName: "Farnosť Zvolen",
      location: "Zvolen – mesto",
      phone: clean(details?.phone) || clean(details?.mobil),
      email: clean(details?.email),
      address: clean(details?.address),
      iban: clean(details?.iban),
      officeHours,
      preparationMeetings,
      ...(preparationNote ? { preparationNote } : {}),
      ...(contactNote ? { contactNote } : {}),
      ...(officeNote ? { officeNote } : {}),
      ...(mobile ? { mobile } : {}),
      ...(ico ? { ico } : {}),
      ...(mapLink ? { mapLink } : {}),
      regularSchedule: {},
      priests,
      donationQr: {
        src: "/media/donations-qr.png",
        width: 901,
        height: 885,
        alt: "QR kód pre príspevok farnosti"
      }
    };
    records.push({
      id: "site-settings",
      kind: "settings",
      title: "Nastavenia farnosti",
      slug: null,
      draft: settings,
      published: structuredClone(settings),
      version: 1,
      createdAt: timestamp(contact.created_at),
      publishedAt: timestamp(contact.published_at),
      updatedAt:
        timestamp(contact.updated_at) ?? timestamp(contact.created_at) ?? EPOCH,
      source: provenance("contacts", contact, { settings, details }, [
        "regular-schedule-unconfirmed"
      ]),
      readOnly: false
    });
    report.settings.imported = true;
  }

  for (const record of records) {
    report.records[record.kind] ??= { total: 0, published: 0, draft: 0 };
    report.records[record.kind].total += 1;
    report.records[record.kind][record.published ? "published" : "draft"] += 1;
  }
  const slugs = new Map<string, Set<string>>();
  for (const record of records)
    if (record.slug)
      slugs.set(
        record.slug,
        new Set([...(slugs.get(record.slug) ?? []), record.kind])
      );
  report.crossKindSlugCollisions = [...slugs.values()].filter(
    (kinds) => kinds.size > 1
  ).length;
  for (const kind of ["article", "news", "notice", "event"]) {
    const seen = new Set<string>();
    for (const record of records.filter(
      (record) => record.kind === kind && record.slug
    )) {
      if (seen.has(record.slug!))
        throw new Error(
          `Duplicate slug within ${kind}; resolve source mapping before importing`
        );
      seen.add(record.slug!);
    }
  }
  report.media = {
    ...report.media,
    total: media.length,
    images: media.filter((entry) => entry.mime.startsWith("image/")).length,
    other: media.filter((entry) => !entry.mime.startsWith("image/")).length,
    invalidUrls: media.filter((entry) => !/^https:\/\//.test(entry.url)).length,
    unreferenced: media.filter((entry) => !entry.metadata.references.length)
      .length
  };
  report.staticPages = {
    total: staticPages.length,
    published: staticPages.filter((page) => page.publishedAt).length,
    mappedRoutes: staticPages.filter((page) => page.route).length
  };
  report.unresolvedComponents = [...unresolved].sort().map((key) => {
    const split = key.lastIndexOf(":");
    return { type: key.slice(0, split), id: key.slice(split + 1) };
  });
  return { records, media, staticPages, report };
}

function staticRoute(
  slug: string,
  kind: MigratedStaticPage["kind"]
): string | null {
  if (!slug) return null;
  if (kind === "page") return `/spolocenstva/${slug}`;
  if (slug === "index") return "/";
  if (
    [
      "kontakt",
      "birmovanci",
      "objav-krista",
      "den-farskej-rodiny",
      "404"
    ].includes(slug)
  )
    return `/${slug}`;
  if (slug.startsWith("sviatost-")) return `/sviatosti/${slug}`;
  if (["reholne-sestry"].includes(slug)) return `/spolocenstva/${slug}`;
  if (["prispevky", "vyveska"].includes(slug)) return `/${slug}`;
  if (
    [
      "cirkevna-skola",
      "kostol-sv-jana-pavla-v-lieskovci",
      "kostol-sv-matusa-v-zolnej",
      "kostol-sv-alzbety",
      "farske-oznamy",
      "kalendar-akcii",
      "virtualna-prehliadka",
      "nase-spolocenstvo",
      "galeria"
    ].includes(slug)
  )
    return `/farnost/${slug}`;
  return null;
}
