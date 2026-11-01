import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "./FeedbackInvite.module.css";

export function FeedbackInvite({ divided = false }: { divided?: boolean }) {
  return (
    <section
      className={`container ${styles.invite} ${divided ? styles.divided : ""}`}
      aria-labelledby="feedback-invite-heading"
    >
      <div>
        <h2 id="feedback-invite-heading">Máte podnet alebo nápad?</h2>
        <p>
          Napíšte nám, čo môžeme zlepšiť v živote farnosti alebo na tomto webe.
        </p>
      </div>
      <Link href="/podnety" className="textLink">
        Napísať podnet <Icon name="arrow-right" size={18} />
      </Link>
    </section>
  );
}
