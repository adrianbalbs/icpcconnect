import pageStyles from "@/styles/Page.module.css";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
}

const Tile: React.FC<Props> = ({
  title,
  description,
  buttonText,
  buttonTo,
}) => {
  return (
    <div className={pageStyles.tile}>
      <div className={pageStyles["tile-title"]}>
        <h2>{title}</h2>
      </div>
      <div className={pageStyles["tile-description"]}>
        <p>{description}</p>
      </div>
      <div className={pageStyles["tile-button-container"]}>
        <Link href={buttonTo} className={pageStyles["tile-button"]}>
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default Tile;
