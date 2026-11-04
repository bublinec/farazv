import { pageMetadata } from "@/lib/seo";
import { aerialImage } from "@/content/assets";
import type { BulletinDocument } from "@/content/documents";
import {
  getPublicBulletins,
  getPublicSettings,
  isFixtureMode
} from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { getLocalDate, getPublicWeek } from "@/lib/calendar";
import { getPreviewNow } from "@/lib/preview-date";
import { PageHero } from "@/components/ui/PageHero";
import { BulletinContent } from "@/components/bulletin/BulletinContent";
import { DonationSection } from "@/components/home/DonationSection";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Farské oznamy",
  description:
    "Rozpis svätých omší a farské oznamy Farnosti sv. Alžbety Zvolen – mesto.",
  path: "/farnost/farske-oznamy"
});

export default async function BulletinPage() {
  const now = getPreviewNow();
  const today = getLocalDate(now);
  const [schedule, settings] = await Promise.all([
    getPublicBulletins(today).catch(() => null),
    getPublicSettings().catch(() => null)
  ]);
  if (!schedule)
    return (
      <>
        <PageHero
          route="/farnost/farske-oznamy"
          title="Farské oznamy"
          description="Sväté omše, úmysly a aktuálne oznamy na jednom mieste."
          image={aerialImage}
          compact
        />
        <section className="container section">
          <Unavailable title="Rozpis je dočasne nedostupný." />
        </section>
        {settings ? (
          <DonationSection iban={settings.iban} qr={settings.donationQr} />
        ) : null}
      </>
    );
  const { days, bulletin } = getPublicWeek(
    schedule,
    now,
    settings?.regularSchedule ?? {}
  );
  return (
    <>
      <PageHero
        route="/farnost/farske-oznamy"
        title="Farské oznamy"
        description="Sväté omše, úmysly a aktuálne oznamy na jednom mieste."
        image={aerialImage}
        compact
      />
      <BulletinContent
        days={days}
        today={today}
        bulletin={bulletin as BulletinDocument | undefined}
        phone={settings?.phone}
        fixture={isFixtureMode()}
        scrollToTodayOnMobile
      />

      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
    </>
  );
}
