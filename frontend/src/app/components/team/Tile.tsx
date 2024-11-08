import pageStyles from "@/styles/Page.module.css";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
  added: boolean;
}

const Tile: React.FC<Props> = ({
  title,
  description,
  buttonText,
  buttonTo,
  added,
}) => {
  return (
    <div className={pageStyles.tile}>
      <h2 className={pageStyles["tile-title"]}>{title}</h2>
      <div className={pageStyles["tile-description"]}>
        <p>{description}</p>
      </div>
      <div className={pageStyles["tile-button-container"]}>
        <Link
          href={buttonTo}
          className={`${pageStyles["tile-button"]} ${added && pageStyles.added}`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default Tile;
