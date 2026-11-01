import type { BulletinDocument } from "@/content/documents";
import { Icon } from "@/components/ui/Icon";
import { Field } from "./Fields";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

type Donations = NonNullable<BulletinDocument["donations"]>;

export function BulletinDonations({
  donations = [],
  onChange
}: {
  donations?: Donations;
  onChange: (donations: Donations) => void;
}) {
  function updateDonation(index: number, patch: Partial<Donations[number]>) {
    onChange(
      donations.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  return (
    <details
      className={`${styles.panel} ${styles.disclosure} ${weekly.panel}`}
      open={Boolean(donations.length)}
    >
      <summary>
        {donations.length ? "Dary a zbierky" : "Pridať dary a zbierky"}
      </summary>
      {donations.map((donation, index) => (
        <div
          className={styles.mass}
          key={index}
          data-field={`donations.${index}`}
        >
          <div className={styles.fields}>
            <Field
              label="Označenie / meno"
              value={donation.label}
              onChange={(label) => updateDonation(index, { label })}
            />
            <Field
              label="Suma / poznámka"
              value={donation.amount}
              onChange={(amount) => updateDonation(index, { amount })}
            />
            <Field
              label="Kategória daru (nepovinné)"
              value={donation.category}
              maxLength={150}
              wide
              onChange={(category) => updateDonation(index, { category })}
            />
          </div>
          <button
            type="button"
            className={styles.remove}
            title="Odobrať dar alebo zbierku"
            aria-label={`Odobrať dar alebo zbierku ${index + 1}`}
            onClick={() => onChange(donations.filter((_, i) => i !== index))}
          >
            <Icon name="minus" size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => onChange([...donations, { label: "", amount: "" }])}
      >
        + Pridať dar alebo zbierku
      </button>
    </details>
  );
}
