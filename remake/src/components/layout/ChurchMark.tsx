import Image from "next/image";
import churchTower from "../../../public/images/church-tower.png";

/** One parish mark, delivered at logo size instead of the full original PNG. */
export function ChurchMark({
  className,
  eager = false
}: {
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={churchTower}
      width={36}
      height={65}
      alt=""
      className={className}
      loading={eager ? "eager" : "lazy"}
    />
  );
}
